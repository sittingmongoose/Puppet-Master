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
- **Thin runtime tool contracts** -- This doc owns `question`, `todowrite`, `todoread`, `web*`, `skill`, `task`, and the richer `lsp` tool surface; chat-thread terminal/tool/search access resolves through these canonical tool/search (`/tool/search`) contracts rather than a parallel chat-thread-only tool model.

**Secondary references:** Framework-specific testing tools (Playwright, headless runners) and their catalog are in **newtools.md** (GUI tool catalog). FileSafe (command blocklist, write scope, sensitive files) is in **FileSafe.md** and must align with the central tool policy. Permission semantics and granular rules align with [OpenCode Permissions](https://opencode.ai/docs/permissions/); cross-plan alignment with FileSafe, FileManager, assistant-chat-design, orchestrator, and interview is in §2.5 and §10.

### 1.1 GUI requirements

The GUI must expose tool support in two places (see **Plans/FinalGUISpec.md**):

- **Settings > Advanced > MCP Configuration** -- Already specified: per-platform MCP toggles, MCP server list, Context7 API key, web search provider. MCP-discovered tools then feed into the central registry and permission model (§5).

- **Settings > Permissions** -- **Required:** Per-tool (and optional wildcard) allow/deny/ask; **presets are in scope for MVP** (Read-only, Plan mode, Full) per §10.4 -- user may choose not to apply a preset, but the preset feature must be implemented; list of built-in + MCP-discovered tools with permission dropdown per row. Bound to the same config that the run uses for the central tool registry. Spec: `Plans/Permissions_System.md` §10 and `Plans/FinalGUISpec.md` §7.4 Settings and inspectors.

**Usage page:** Tool usage widget is specified in FinalGUISpec §7.8 (Usage view): tool name, invocation count, latency p50/p95, error rate; data from seglog rollups via analytics scan. See §9.2 enhancement list for context.

**Optional (enhancements):** Tool description in run summary or Config ("which tools are available and their permission for this run"). See §9.2.

---

## 2. Permission model

> **SSOT:** The canonical specification for permission actions (`allow`/`ask`/`deny`), precedence layers, granular rules, wildcard syntax, special guards, ask-flow semantics, deterministic defaults, and resolution algorithm is **`Plans/Permissions_System.md`**. This section provides a summary for tool-registry context; do not duplicate normative detail here.

ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules

### 2.1 Values and semantics (summary)

- **allow** — Tool may run without prompting. FileSafe guards still apply after permission.
- **deny** — Tool is blocked; `tool.denied` event emitted.
- **ask** — User must approve (`deny` / `once` / `for session` / `for-session` / `always`). In headless runs, maps to `deny` unless HITL is enabled.

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

Tools references `Plans/Models_System.md` (`/Models_System.md`) at planning-doc level for provider capability matrix completeness and compaction-threshold coordination; no separate formal JSON Schema is required here for that planning-doc capability table.

Subagents are disposable by default. Completion, cancellation, or failure normally ends that child. Follow-up work should usually spawn a new child rather than reopen an old one.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md
### 2.4 Interaction with FileSafe

FileSafe runs **in addition to** tool permissions. A tool may be **allowed** by permission but still **blocked** by FileSafe. Tool permission = "may the agent call this tool?"; FileSafe = "may this specific invocation proceed?". See `Plans/FileSafe.md`. The policy engine applies both layers in order: permission first, then FileSafe. Full integration order: §10.6.

Embedded document review is not a hidden tool mutation channel. The `embedded-document-pane` consumes the annotation and targeted revision contracts in `Plans/Crosswalk.md`, `Plans/FinalGUISpec.md`, and `Plans/assistant-chat-design.md`; Tools must not introduce direct `patch-apply` or `/suggested-change` mode for that pane unless a later separate capability defines a new tool, permission, FileSafe, and audit contract.

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

### 2.4.2 Tool routing, blocked-packet, and audit carry-through

Tool route activations are persistence-aware. A navigation to a historical-run result may update stored project-state such as `focused_run_id`, while hover previews, temporary comparisons, and transient pivots must not rewrite persistent view state.

Tool and route audit records carry unresolved `exact_items` as explicit gap lineage until the owner docs close them. `gap-001` remains tied to the missing owner anchor `### 5.1B Persona/Runtime Snapshot Payload Contract`; `execution_unit_context` consumers must preserve `requested_account_binding`, `requested_account_policy`, and `operational_identity`. `gap-002` keeps `Plans/UI_Command_Catalog.md` references to the non-existent `Plans/Orchestrator_Page.md#10. Search, routing, and action policy` visible until the target exists, and `cmd.search.open_result`, `cmd.search.replace_selected`, and `result_id` remain live search command arguments rather than stale residue. `gap-006` keeps Glossary carry-through honest: help-entry rows use `common_related_states` and must not collapse back into a two-column table.

Blocked-packet consumers in Tools preserve `gap-005`, `/receipt/blocked/usage`, `blocked-attempt`, `blocked_notice`, `blocked-episode`, `/notification`, `report_ref`, `startup_recovered`, `escalation_level`, and `action_available` when a tool or route result exposes blocked runtime state. Runtime recovery surfaces use current projections and valid `allowed_action_ids` / `allowed_action_ids[]`; History and Ledger remain closer to canonical records than widget rollups, while UI consumers expose `Last updated`, `/freshness`, and `/recovery` before actions depend on stale projections. Existing broken anchors such as `Plans/Orchestrator_Page.md#11. Source Control boundary`, `route-target`, `restore points`, `already-recorded` carry-through, and incomplete consumer `carry-through` are tracked as blockers until their owner docs resolve them.

Validation and project-state consumers keep the `validation-pass-report` lineage explicit without reviving the stale ask tuple `{ tool_name, invocation_summary, options }` as a canonical request shape. `gap-004`, `self-verdict`, `requirements_quality_report_ref`, `Plans/Project_Output_Artifacts.md`, `/Project_Output_Artifacts.md`, `Plans/storage-plan.md`, `/storage-plan.md`, `Plans/usage-feature.md`, `/usage-feature.md`, `Plans/Tools.md`, `/Tools.md`, `Plans/Glossary.md`, `/Glossary.md`, `Plans/assistant-chat-design.md`, `/assistant-chat-design.md`, `project_summary.v1:{project_id}`, `orchestrator.project_state`, and `orchestrator.project_state.{project_id}` remain visible to tool consumers that open or summarize recovery, validation, and project-state artifacts.

Tool export and side-effect records carry identity and trust detail rather than burying it in provider-specific payloads. Receipts, artifacts, and side-effect-bearing attempt/tool records include `/tool`, `operational_identity`, and `trust_state_at_export` when stale or `/degraded` projections affect interpretation. GitHub and Source Control tool consumers must not assume one `/current` repo context: `Plans/GitHub_Integration.md`, `/GitHub_Integration.md`, multi-repo, and multi-context operations remain valid when lanes or projects split execution context. `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, and rewrite-era `/corroboration/concern/wake` semantics stay in scope for tool-event consolidation whenever actor, concern, wake, or corroboration state affects execution authority.

Runtime-governance tool policy keeps `DAE`, `/restart`, run-level strategy, attempt-level account `re-resolution`, `blocked_owner`, blocked-governance, `/governance`, account-aware ordering, and `pre-dispatch` interception visible before remote side-effect approval is enforced. Seams rollups may remain browsable while mildly stale, but Seams completion and `/promote/governance` actions must tighten quickly when projection trust drops. Attention/status payloads use the shared ladder `info`, `warning`, `attention_required`, `blocked`, and `system_notification`.

Tool-facing widgets and command routing do not hide scope or identity mismatches. Progress and widget consumers distinguish page-global, app-global, project-scoped, and `/run-centric` layout/state before treating a view as authoritative. Catalog normalization treats missing `IDs` as structural, not merely local; surfaces must normalize `cmd.*.open_*` variants through one shared target model, prefer deliberate `object_kind` extension over new top-level route fields, and preserve `Executor_Protocol` / `Executor_Protocol.md` `/attempt/blocked-sequence` identity. Approval scope in a multi-lane run must not silently remain same-session when sessions are per-agent-spawn and lanes are parallel.

Tool/runtime recovery evidence is `node-native`: blocked episodes, `/evidence/runtime`, and tool-facing usage/evidence/runtime rollups align to graph `/node/package/seam/lane` identity. Any `tier-native` or `tier-aligned` fields survive only as compatibility/grouping projections, never as execution authority.

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
| **grep** | Search file contents with regex; file pattern filtering. Transparently accelerated by the per-project sparse-n-gram index when available; the same backend also serves Search-panel regex mode | `grep` | Same limits and permission posture as existing grep. Respect .gitignore unless .ignore overrides. Stale snapshots remain queryable; fallback to raw ripgrep only when the index is missing, building without a valid snapshot, corrupted, disabled, or the query cannot be narrowed |
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

OpenCode-compatible baseline evidence is adapter context, not a PM owner override: the registry includes `bash` and `grep`, permission outcomes stay `allow`, `ask`, and `deny`, plan agents ask before `bash` by default unless policy grants it, and IDE integration remains terminal-first (`opencode` split-terminal behavior) while PM keeps canonical tool names and policy evaluation in this document.

### 3.1A Debug-capable tool classification

This `Plans/Tools.md` (`/Tools.md`) owner section classifies **debug-capable** tools as a cross-surface capability family rather than as an Assistant-only or chat-only silo.

Required registry rules:
- `debug_capable` is metadata on a tool or capability, not a new tool ID
- tools and capabilities may also carry usage tags such as `debug`, `evidence_capture`, `instrumentation`, `reproduction`, and `verification`
- debug-capable registry groups include `debug.target_discovery`, `debug.browser_automation`, `debug.logs_and_console`, `debug.dap`, `debug.agent_session_trace`, and `debug.bundle_export`
- built-in tools commonly participating in this family include `read`, `grep`, `glob`, `list`, `bash`, the edit group, `logsearch`, `logread`, `lsp`, and `task`
- debug adapters and `/evidence` collectors plug into the same central registry as provider-exposed tools, browser automation capabilities, DAP controls, runtime-artifact export helpers, eligible MCP tools, eligible skill-backed tools, and eligible custom tools when the registry metadata says they are debug-capable

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/newtools.md

Cross-surface rules:
- Assistant Debug Mode is the chat entrypoint that most aggressively prefers this family
- Assistant, Interview, Orchestrator, Crew/subagents, and delegated runs may use the same debug-capable tools under the same permission, artifact, and visibility contracts
- tool availability, denials, and degraded capability state continue to flow through the same requested/effective policy system and persisted event stream
- when a debug-capable tool's linked runtime identity is stale but recoverable, tool execution must enter `attention_required` with `attention_required_reason_code = session_reconnect_required` instead of silently resuming against stale sessions
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
| **lsp** | **Promoted to MVP** (no longer experimental/feature-flagged). Agents can invoke the canonical read/navigation operation set: `goToDefinition`, `findReferences`, `hover`, `documentSymbol`, `workspaceSymbol`, `goToImplementation`, `prepareCallHierarchy`, `incomingCalls`, and `outgoingCalls`. `rename` remains the single write/approval-gated operation; `lsp_rename` is a legacy queue alias for that same operation, not a second tool. Requires a running LSP server for the project language. When no server is available, the lsp tool returns no results or a clear "LSP unavailable" response. See Plans/LSPSupport.md §9.1. |
| **codesearch** | **Enhanced** when LSP is available: can use LSP `workspace/symbol` (and optionally `documentSymbol`) for **symbol-aware search** (find by symbol name, kind, and location) in addition to text-based search. Fallback: text-based or indexed search when LSP is disabled or no server for the language. |
| **read** / **grep** / **edit** (context) | **Context enrichment:** Assistant/Interview context can include a **summary of current LSP diagnostics** for @'d or open files (errors/warnings with file, line, message, severity). Agents then see linter/type errors when using read/grep/edit and can suggest fixes. Not a new tool; the context passed to the agent is enhanced (Plans/LSPSupport.md §5.1). |

**Implementation note:** The lsp tool should be implemented to call the same LSP client used by the editor and Chat. Permission for `lsp` follows the same allow/deny/ask model; the nine read-only operations default to allow where LSP is available, while `rename` / `lsp_rename` requires explicit approval because it applies edits.

#### 3.4.1 LSP tool (MVP) -- parameters, permission, rename approval

Canonical operation inventory: the packetization summary phrase `10 read-only + 1 write-gated (lsp_rename)` reconciles to the live Part M operation set as nine read-only operations plus one approval-gated `rename` operation. `lsp_rename` is a legacy/source alias for canonical `rename` / `lsp.rename`, not a second tool key.

Short LSP lookup names `definition`, `references`, and `implementation` are compatibility aliases for `goToDefinition`, `findReferences`, and `goToImplementation`; the canonical operation names remain the long-form LSP actions above.


This section consumes the linked owner contract and stays aligned with it.

Core rules:
- LSP canon must preserve the exact MVP operation inventory, normalized parameter shapes, and result envelope. The packetization summary phrase `10 read-only + 1 write-gated (lsp_rename)` reconciles to the canonical Part M inventory: nine read-only operations plus one approval-gated `rename` operation. `workspaceSymbol` must carry `query`, position-based operations use `path` + `position`, and `rename` / `lsp_rename` requires `path` + `position` + `newName` with approval gating.

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
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- rename

Rules:
- ok | partial | unavailable | error
- `workspaceSymbol` requires `query`
- Position-based operations use `path` + `position`.
- `rename` requires `path` + `position` + `newName`.
- `rename` is approval-gated because it applies edits.
### 3.5 Per-tool semantics (I/O, errors, limits)

The following contracts define the minimum runtime envelopes for the core built-in tools. Provider-native names may differ, but the registry must normalize them to these contracts before persistence, analytics, or agent-visible result handling.

All core tool-contract (`/tool-contract`) adapters default to sync execution semantics unless/until a tool contract explicitly exposes async handles. When a call is blocked by permissions, FileSafe, or an unavailable MCP/service (`/service`), the result must include a structured recovery action rather than a passive error only. Non-terminal operation previews use the same mini-card family as terminal output: web/search results show source/result mini-cards, and code-edit previews expose `/diffs` cards that open the editor diff without treating the preview as the final mutation. Built-in tool contracts must keep concrete `I/O/limit/error` guidance, unknown-tool default handling, GUI permission/preset visibility (`/presets`), and usage `/token` / `/tokens` event linkage discoverable from this registry.

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

Canonical skill-runtime boundary: the tool registry may expose `skill-runtime` metadata only as a consumer-facing pointer back to `Plans/Skills_System.md`; richer runtime resource refs stay resolved through the shared tool-contract boundary rather than ad hoc skill-local schemas.


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
- Non-persona tool cleanup is owned by this runtime-contract surface: question, todowrite, and todoread gaps are product tool contracts, not persona behavior.
- Question schema canonical names and enums are locked, including QuestionItem fields, canonical freeform and multi-select field names, and answer source metadata.
- The question tool contract is locked to a multi-question envelope, normalized output statuses, object-array options, included answer source, and top-level orchestrator ownership of user questioning.
- The answer `source?` field is LOCKED and INCLUDED as an optional field with enum values `"option"`, `"other"`, and `"freeform"`.
- `questionnaire` and `/questionnaire` mode use `options?: Array<{id, label, description?}>` for selectable answers; `string[]` options are backwards-compatible only for legacy `single_question` callers and must be normalized to object-array options before storage or multi-question rendering.
- Question and questionnaire flows preserve bounded draft `/answer` state, submitted answer state, and answer-source metadata as tool payloads that storage persists; Tools owns the tool envelope while `Plans/storage-plan.md` owns the durable `chat.plan_todo_updated` and questionnaire projections.
- Implementation-readiness for the shared question-flow / multi-question-flow requires question-card behavior to stay aligned across Assistant, Interviewer, and document-builder / visual-module flows: required-by-default items keep the flow incomplete until answered, dismiss-to-pause returns an explicit dismissed/paused status, and `Other` remains the freeform path rather than a fabricated option answer.
- The v1 input envelope accepts `mode?: "single_question" | "questionnaire"`, `header?`, `prompt?`, `placeholder?`, `questions: Array<QuestionItem>`, `allow_other?: boolean` as a legacy alias for `allow_freeform`, and `allow_multi_select?: boolean` as a legacy alias for `multi_select`; each `QuestionItem` carries at minimum `question_id`, canonical display `question`, legacy alias `text: string`, optional `description?: string`, `options?: Array<{ id, label, description? }>`, `required?` default true, `multi_select?` default false, `allow_freeform?` default true, `allow_other?` as the freeform legacy alias, `placeholder?`, `default_values?`, and response constraints. Legacy `answer: string` output is normalized into the canonical answer array.
- Legacy `string-answer` and `answer: string` callers are compatibility-only; the already-decided canonical path is the multi-question envelope. Source shorthand `questions: [...]` is normalized to `questions: Array<QuestionItem>` before validation or question-card rendering.
- Compatibility shorthand for source and adapter callers is `mode|header|prompt|questions[]`; the canonical item shape is `QuestionItem{question_id, question, options[], required, multi_select, allow_freeform, default_values}`.
- `prompt` is envelope/header-only compatibility text; it is not the per-question field name, and each `QuestionItem` uses canonical `question` for the displayed prompt.
- For question cards, the fields are cross-referenced: `default_values` are caller-supplied initial seed values for pre-defined option IDs, while `draft_value` is the runtime-side PM-managed in-progress freeform or draft answer text.
- Clarification-request and question-resolution surfaces, including chain-wizard and progression gates, use the same question-flow rather than a parallel prompt format. Legacy single-question callers remain single-item syntactic sugar over `mode: "single_question" | "questionnaire"` with `header?`, `prompt?`, `placeholder?`, `questions: Array<QuestionItem>`, and output `status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"` plus `answers: Array<{ question_id, values: string[], source?: "option" | "other" | "freeform" }>` and optional backward-compat `answer_text?`.

Fields:
- mode: "single_question" | "questionnaire"
- questions: Array<QuestionItem>
- status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"
- answered|submitted|dismissed|timed_out|unavailable
- answers: Array<{question_id, values: string[]}>
- answer_text?
- source?: "option" | "other" | "freeform"
- Headless/HITL-unavailable returns `headless_unavailable` with `status: "unavailable", reason: "headless"` and no GUI-only recovery action.
- headless_unavailable
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
- `options?: Array<{id, label, description?}>`
- `string[]` backwards-compatible
### 3.5C `todowrite` and `todoread` runtime contract

This section defines the canonical contract for this surface.

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.
- Plan/TODO persistence is locked to explicit revision states, structural-edit gating after approval, bounded revision history, and emission of `chat.plan_todo_updated` for durable TODO mutations.
- TODO tool behavior is locked so todowrite and todoread use the normalized TODO schema, todowrite is not blanket auto-denied in ask/plan mode, and Deep Plan edits must resync the TODO projection before execution.
- Ask/Plan presets must not carry inherited blanket-denies or a blanket-deny rule for `question`, `todowrite`, `todoread`, or the six web operation tools; the mode-dependent access matrix for plan-mode web tool access and Deep Plan mode availability must show these tools as available unless stricter explicit presets such as read-only or no-network deny them by policy.
- `todowrite` auto-use on-trigger behavior is explicit: when the auto-use heuristic fires, the agent emits a `todowrite` tool call with proposed TODO items. If auto-approved by the resolved permission preset, the tool creates items silently; if ask-mode, the tool is held behind an approval prompt that lists the proposed TODO items before creation.
- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.
- TODO is the SSOT for plan execution state across single-agent, crew, and subagent runs. `/revise` creates an explicit new draft/revision instead of mutating approved history invisibly; sticky-panel-vs-inline-progress is a UI division, not a second TODO state model. The sticky-card / execution-tracker surface owns the full TODO list, status badges, focused item behavior, delegated owner display, and post-approval edit restrictions, while inline-progress chat messages stay compact and link back to the sticky panel.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- order_index?
- notes?
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
- `todowrite` / `todoread` use the same normalized TODO schema as planning outputs.
- Crew/subagent execution consumes the same TODO contract without translation.
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
- The web operation family is provider-pluggable and PM-owned above individual providers. The PM-native layer provides native page read/extract (`/extract`), optional site crawl, optional site map extraction (`/crawl/map`), and research/synthesis (`/synthesis`) orchestration; providers plug into that layer for discovery and optional backend-native retrieval. This keeps the operation family future-proof instead of treating providers as the only place web capability can live, and the GUI/help surfaces show support tier as `native`, `PM-composed`, or `unavailable`; backend-native retrieval and adapter narrowing are capability/routing qualifiers, not replacements for the support-tier enum.
- The web dispatcher maps each invocation to one canonical operation (`search`, `extract`, `research`, `crawl`, `map`, or `fetch`/`read`), validates parameters against that operation's contract before adapter routing, and rejects malformed or unsupported inputs with `invalid_input` instead of handing them to a provider.
- Minimal canonical input shapes are stable across adapters: `websearch` accepts `query: string`, `max_results?: number`, compatibility `limit?: number` for source-specific search-result caps, `adapter_hint?: string`, `sources?: ("web" | "news" | "images" | "code" | "academic")[]`, `categories?: ("github" | "research" | "pdf")[]`, `include_domains?: string[]`, `exclude_domains?: string[]`, and `time_range?: string`; source-lineage shorthand `/news/images/code/academic` maps to the `sources` enum, category shorthand `/research/pdf` maps to the `categories` enum, and the default `sources` value is `["web"]`. The `categories` filter is applied during search when the effective provider supports it, otherwise post-search before PM chooses candidate sources. A requested source or category unsupported by the effective provider returns `unsupported_operation` for that source or category. `webfetch` is the PM-native site read via Site Reader / native fallback fetch and its PDF handling is specified by `pdf_mode?: "fast" | "auto" | "ocr"` (`/auto/ocr` lineage), default `"auto"`, applied when the URL serves PDF content; `webextract` accepts `url: string`, `adapter_hint?: string`, `detail_hint?: "fast" | "balanced" | "deep"` for provider/API-side (`/API-side`) extraction or PM-composed extraction, `schema?: object` (JSON Schema defining expected output structure), and `prompt?: string` (natural-language extraction guidance, max 2000 chars) when schema alone is insufficient or no schema is supplied; `webresearch` accepts `task: string`, `max_sources?: number`, `adapter_hint?: string`, `depth_hint?: "fast" | "balanced" | "deep"`, `autonomous?: boolean`, `auto_read_cap?: number`, `schema?: object`, and `schema_mode?: "strict" | "lenient"`; `webcrawl` accepts `root_url: string`, `max_pages?: number`, `max_depth?: number`, `same_origin_only?: boolean`, `adapter_hint?: string`, `include_paths?: string[]`, `exclude_paths?: string[]`, `dedup?: boolean`, `respect_robots?: boolean`, and `search?: string`; `webmap` accepts `root_url: string`, `max_pages?: number`, `max_depth?: number`, `same_origin_only?: boolean`, `adapter_hint?: string`, `include_paths?: string[]`, `exclude_paths?: string[]`, and `search?: string`.
- `webresearch` may also accept `starting_urls?: string[]` as optional seed URLs to begin research from, capped at five URLs; each URL follows the same normalization and validation rules as `webfetch`, and malformed or non-HTTP(S) URLs return `invalid_input`.
- When `autonomous: true` is set on `webresearch`, PM may use provider-native autonomous research when available; Firecrawl delegates to `/v2/agent`, Tavily uses its advanced search + extract chain, and other providers use the PM-composed enhanced recipe: search, read top pages through Site Reader, refine and repeat only when evidence is insufficient, then synthesize with citations. Autonomous research remains bounded to at most three search iterations, at most `max_sources` page reads, and a 120s total runtime unless a narrower provider or run limit applies; each step surfaces activity such as `Searching Web: <refined query>` and `Reading Site: <url>`.
- When `autonomous: false` or omitted on `webresearch`, the default PM-composed research recipe is deterministic and bounded: search with the highest-priority provider, select top candidate URLs up to `max_sources`, read/extract up to `auto_read_cap` pages via Site Reader as the auto-read cap, then synthesize an answer with citations from read content. In this branch the agent does NOT navigate or interact with pages; interaction-capable browser work must route through the explicit WebAction or browser/session contracts.
- Agent-web-research is the shared web-tools flow for Assistant, Interview, Orchestrator, requirements-doc-builder, and doc-builder surfaces: activity cards and the audit-trail must expose search plus `/fetch/read` steps rather than burying them in generic history text, and dangling or `/brittle` cited-search cross-references are replaced by this owner contract.
- Native site-reading uses the PM Site Reader/browser-reader layer for `/token-efficient` structured reading with iframe-aware support; `/plain` fetch is a fallback/degraded read mode, not the default product path.
- Permission requests for `websearch` and `webresearch` are wildcard-only operation approvals because the URL set is not known before discovery, while `/extract/crawl/map` and `webfetch` use host/site-scoped approvals when their target is known.
- `webfetch` accepts `formats?: Array<"markdown" | "html" | "rawHtml" | "screenshot" | "pdf" | "summary" | "links" | "images">` with default `["markdown"]`; provider slash shorthand such as `/html/rawHtml/screenshot/pdf/summary/links/images` and legacy `/PDF/summary` wording normalize to this typed `formats` enum instead of becoming a path or mode family.
- Format semantics stay explicit: `"screenshot"` returns a full-page or viewport screenshot as a base64 image artifact through the browser runtime, `"pdf"` renders the page to a PDF artifact through the browser runtime, and `"summary"` returns an LLM-generated page summary. Summary execution is provider-dependent: Firecrawl may satisfy it natively when selected and supported, while other providers use PM-composed summarization over the fetched/read page content.
- `webcrawl` accepts compatibility `formats?: string[]` with default `["markdown"]`; the same options as `webfetch` apply to each crawled page and normalize into the typed `formats` enum before dispatch.
- Permission and GUI consumers must preserve URL/domain pattern visibility for extract/crawl/map, query/task pattern visibility for search/research where supported, and provider availability in `/web` help/autocomplete and Settings rather than hiding fan-out behind generic `webfetch`.
- `snapshot` and `screenshot` action results are included in the parent tool output, specifically the `webfetch` or `/webextract` result that owns the browser session.
- For `webcrawl`/`webmap`, result-shape hints include `depth_limit?` as the effective depth limit applied. It may differ from `max_depth` when a provider imposes a lower ceiling, and it is an audit/transparency field, not an input parameter.
- `webcrawl` and `webmap` accept `include_paths?: string[]` and `exclude_paths?: string[]` as glob-style path matching, with examples such as `/docs/*`, `/api/**`, and `!/internal/*`; the patterns apply to the URL path component only, not the query string or fragment. Include rules are applied first to establish the candidate URL/path set, `/exclude_paths` removes matches from that set before crawl or map dispatch, and `search?: string` filters discovered URLs by search term.
- `webcrawl` preserves `change_tracking`, `dedup`, `respect_robots`, `formats`, and `include/exclude_paths` as explicit web-operation inputs; providers may narrow unsupported behavior only through structured warnings or capability disclosure.
- `webcrawl` `dedup` defaults to true and uses content-hash based duplicate detection unless caller policy or provider capability narrows the effective behavior.
- For `webcrawl` change tracking, each crawled page is compared to the previous crawl of the same root URL and the output includes a per-page `change_status` field with `new`, `same`, `changed`, or `removed`; removed pages are pages present in the previous crawl but absent from the current crawl, and `change_summary` reports counts for each status.
- Research sessions use a research-session action subset and may use read-only `automation_session` actions for web research: `navigate` navigates to a URL for reading; `back` returns to the previous page; `reload` refreshes a stale page; `snapshot` captures structured page state for extraction; `screenshot` captures visual evidence of page state; `console` debugs page errors that prevent content access; and `network` debugs failed requests that prevent content.
- Research-appropriate `automation_session` actions may also use `click`, `scroll`, `type`, `press_key`, `wait_for`, and `set_viewport` when needed to access page evidence. `click` expands collapsed content or dismisses overlays, `scroll` is viewport scroll for lazy or below-fold content, `type` fills search boxes or forms, `press_key` submits or dismisses modals, `wait_for` waits for dynamic content, and `set_viewport` switches responsive views; `drag` remains precise element manipulation for the full automation/browser action surface, not a research-read default.
- Activity transparency uses `Reading Site: <url> (with browser interaction)` as a sub-annotation on the existing `Reading Site` label when browser interaction was needed for evidence access, not as a distinct seventh web activity label.
- Firecrawl action aliases are adapter-boundary mappings, not a replacement WebAction enum: provider `wait` maps to PM `wait_for`, provider `write` maps to PM `type`, and provider `press` maps to PM `press_key`; provider `click`, `scroll`, and `screenshot` preserve their names.
- `extraction_empty` means extraction completed but produced no data because page content did not match the schema or prompt. Output includes `extracted_data: null` and `schema_conformance: "none"`; lenient mode treats this as a WARNING with empty data plus a warning, while strict mode treats it as an ERROR.
- `schema_too_large` means the extraction schema exceeds the 50KB limit. `schema_invalid` means the schema is not valid JSON Schema draft-07.
- Schema-backed web extraction uses JSON Schema draft-07. Supported schema constructs include `$ref`, `oneOf`, `anyOf`, `enum`, `required`, and nested objects/arrays; providers may narrow unsupported constructs only with structured `schema_invalid` or `schema_too_large` feedback rather than silently flattening the schema.
- `webresearch` output extends locked common fields with `extracted_data?: object` when a schema is provided and `iterations_used?: number` when autonomous, counting the search-read cycles used.
- Multiple extraction `formats` may be requested together. `screenshot` and `pdf` formats require browser runtime; when that runtime is unavailable, return a `capability_unavailable` warning rather than an error. `export_pdf` is retired as a browser/trace action for research access; callers request PDF capture through `webfetch` with `formats: ["pdf"]`. Trace/video actions are testing evidence only and are excluded from `research_session` web-operation actions.
- Browser permissions/safety use a three-layer `/safety` model aligned with `Plans/Permissions_System.md`: always-allowed read/evidence actions cover `navigate`, `back`, `reload`, `snapshot`, `screenshot`, console read, network read, open DevTools, normal selection/copy, and explicit share-to-chat actions; `session_granted` actions cover `click`, `type`, `fill_form`, tab management, uploads, dialog handling, viewport `/device` changes, and trace `/video` capture; high-risk explicit confirmation covers auth flows, storage import `/export`, cookie or `/storage` mutation, offline mode, network mock routing, download execution, and promotion of automation state into normal browsing.
- The browser-testing action family is named-action based rather than arbitrary browser-code execution. Its top-level buckets are Session `/setup`, Navigation `/tabs`, Interaction, Wait `/assert`, Debug `/evidence`, and Environment; canonical token lineage includes `/mock`, `/online`, `/select/close`, `/element/state`, `/element/value`, and `/element/value/list`.
- Named browser action coverage includes navigation/session basics (`navigate`, `back`, `refresh`, `wait`, `tabs`), richer interaction (`hover`, `drag`, `press key`, `press_key`, `select option`, `select_option`, `fill form`, `fill_form`, `file upload`, `upload_file`, `dialog handle`, `handle_dialog`), inspection/evidence (`snapshot`, `console`, `network`, `screenshot`, `trace`, `video`, `PDF`, `pdf`), state control (`cookies`, `localStorage`, `sessionStorage`, storage import/export, `storage_import`, `storage_export`, network offline/mock routing), and verification/debug helpers (`verify visible text/element/value`, `verify_text`, `verify_element`, `verify_value`, locator/debug targeting helpers).
- Browser action records treat the ledger-canonical long-name labels such as `press key`, `select option`, `fill form`, `file upload`, and `dialog handle` as aliases for the same operations as the short snake_case shorthands `press_key`, `select_option`, `fill_form`, `upload_file`, and `handle_dialog`; dispatch and persistence normalize both vocabularies to the same canonical action identity.
- Guaranteed everyday browser/testing action IDs include `open_tab`, `select_tab`, `close_tab`, `click`, `type`, `fill_form`, `select_option`, `hover`, `drag`, `press_key`, `upload_file`, `handle_dialog`, `wait_for`, `verify_text`, `verify_element`, `verify_value`, `snapshot`, `screenshot`, `console`, `network`, and `set_viewport`; advanced `/testing` actions include `trace_start`, `trace_stop`, `video_start`, `video_stop`, `export_pdf`, `cookie_*`, `local_storage_*`, `session_storage_*`, `network_offline`, `network_online`, `route_mock`, and `generate_locator`.
- Degraded or blocked browser capabilities return explicit reason codes: `platform_unsupported`, `runtime_unavailable`, `permission_not_granted`, `session_class_restricted`, and `temporarily_unavailable_after_recovery`.
- For `webextract`, when both prompt and schema are provided, the prompt guides extraction and the schema validates output as a two-phase flow; schema validation must not silently rewrite the LLM prompt. With prompt only and no schema, free-form extraction is guided by prompt and output shape is provider/LLM-determined.
- `webextract` accepts `schema_mode?: "strict" | "lenient"` with default `"lenient"`; when browser interaction is required before extraction it may accept `actions?: Array<WebAction>` with the same max-10 action count and 30s total action cap as the WebAction contract.
- Schema validation modes apply to `webextract` and schema-backed `webresearch`. In `"strict"` mode, output MUST conform to schema, non-conforming fields are dropped, and missing required fields return `extraction_schema_mismatch`; in `"lenient"` mode (default), output uses best-effort conformance, keeps non-conforming fields with `_schema_violation: true` annotation, and treats missing required fields as a warning, not an error.
- `detail_level` does not map to Firecrawl `onlyMainContent` / `onlyCleanContent` as a PM-side input. These Firecrawl params are adapter-internal defaults derived from format selection based on requested `formats`: when `formats` includes `"rawHtml"`, both `onlyMainContent` and `onlyCleanContent` are false; for `"markdown"` or `"html"`, `onlyMainContent: true`.
- Firecrawl `scrapeOptions.depth` is not a canonical PM mapping. The legacy `detail_hint -> scrapeOptions depth` / `detail_hint → scrapeOptions depth` mapping is explicitly removed as unconfirmed; `detail_hint` remains PM advisory input for provider/API-side extraction or PM-composed extraction unless a future provider contract reintroduces that mapping explicitly.
- Firecrawl PDF processing does not make `LlamaParse` PM canon. The source claim that Firecrawl uses `LlamaParse` for PDF handling is intentionally retired as unconfirmed; PM-owned PDF behavior stays on `pdf_mode?: "fast" | "auto" | "ocr"` and platform OCR / fallback text extraction.
- Format output semantics are locked: `"html"` is cleaned HTML with scripts/nav/ads stripped via Site Reader, while `"rawHtml"` is unprocessed HTML as-is from the server.
- Web-operation outputs expose `execution_path?: string` as a routing/audit field. `websearch` may report `provider_search_native` or `pm_search_plus_site_reader`; `webextract` may report `provider_extract_native` or `pm_extract_composed`; `webfetch`/Site Reader reads may report `pm_site_reader`, `provider_firecrawl_scrape`, or `pm_fetch_fallback`; `webresearch` may report `provider_firecrawl_agent` or `pm_research_composed`; `webcrawl` may report `provider_crawl_native` or `pm_crawl_composed`; `webmap` may report `provider_map_native` or `pm_map_composed`.
- Operation cache TTL defaults are exact unless overridden by caller policy: `websearch` defaults `cache_policy?: { max_age_seconds?: number, store?: boolean }` to `{ max_age_seconds: 3600, store: true }`; `webfetch` and `webextract` default the same shape to `{max_age_seconds: 14400, store: true}`; `webcrawl` and `webmap` default the same shape to `{ max_age_seconds: 86400, store: true }`. `webresearch` may reuse cached search/read/extract artifacts under those operation TTLs, but the synthesized research answer is task-specific and is not cached as reusable web content. Non-fetch web operations that use the shared web cache expose `cache_policy` input and `cache_state` output rather than relying on invisible TTL-only caching.
- Web cache outputs use `cache_state?: "hit" | "miss" | "bypassed"`; `bypassed` means request policy, action-driven reads, or a provider/runtime constraint skipped read-time cache lookup while still allowing post-action storage when permitted.
- Web operation outputs share a locked common result envelope: `success: boolean`, `web_operation`, `support_tier`, `execution_path`, `requested_adapter_id?`, `effective_adapter_id?`, `adapter_selection_reason?`, `projection_freshness?`, `projection_health?`, `provider_fallback_occurred: boolean`, `provider_fallback_summary?`, `source_count?: number`, `sources?: Array<{ title?, url, snippet?, provenance_badge? }>`, `warnings?: string[]`, `error_code?: string`, and `error_message?: string`.
- Operation-specific result fields extend the common envelope without replacing it: `websearch` adds `results: Array<{ title, url, snippet?, score? }>`; `webfetch` returns `content: string`, `status?: number`, `formats_returned?: string[]`, `screenshot?`, `cache_state?`, and `change_status?` for the requested URL; `batch_webfetch` returns `results: Array<{ url, success, content?, formats_returned?, screenshot?, cache_state?, change_status?, error_code?, error_message? }>` plus `summary: { total, succeeded, failed, cached }`; `webextract` returns extracted content + provenance refs and adds `content_ref?: string`, `content_preview?: string`, `content_format?: "text" | "markdown" | "structured"`, `extracted_data?: object` when schema-backed structured extraction is requested, `links?: Array<{ url, text?, rel? }>` for requested link extraction, and `images?: Array<{ url, alt?, dimensions? }>` for requested image extraction; `webresearch` adds `answer_summary?: string`, `sources_used_count?: number`, and `evidence_refs?: string[]`; `webcrawl` adds `pages_visited_count?: number`, `pages_returned_count?: number`, and `scope_summary?: string`; `webmap` adds `nodes_count?: number`, `edges_count?: number`, `scope_summary?: string`, `map_ref?`, and `sitemap_used?: boolean` when `sitemap.xml` was found and used.
- Web outputs that surface canonical citation provenance use `provenance_badge?: string` from the Part P citation precedence hierarchy. Crawl/map operations that skip pages during deduplication report `dedup_skipped?: number` alongside their operation-specific counters.
- `web_operation` uses semantic audit values `search`, `extract`, `research`, `crawl`, `map`, and `read`; `read` maps to the canonical `webfetch` tool. Audit payloads use `read` as the semantic operation name, while the underlying tool invocation is `webfetch`, and consumers MUST map between these vocabularies.
- Default execution limits begin with `websearch` `max_results = 8`; `webresearch` `max_sources = 6` and `auto_read_cap?: number`; the default auto-read cap = 4 pages before answering; `webextract` one URL only per invocation; `webcrawl` `max_pages = 25`, `max_depth = 2`, and `same_origin_only = true`; and `webmap` `max_pages = 50`, `max_depth = 3`, and `same_origin_only = true` unless a caller or provider capability contract supplies a narrower effective limit.
- The web-operation child payload used by `tool.invoked` / `tool.denied` stores operation-local data under the web child payload, while requested/effective runtime identity remains top-level and shared. Required child fields are `web_operation`, `web_input`, `support_tier`, `execution_path`, `requested_adapter_id?`, `effective_adapter_id?`, `adapter_selection_reason?`, `projection_freshness?`, `projection_health?`, `provider_fallback_occurred`, `provider_fallback_summary?`, `source_count?`, `sources_ref?`, and operation-specific counters/refs. Source shorthand `/refs`, `/shared`, and `/provisional` resolve to these explicit fields rather than to a loose extras bag.
- Common web-operation audit fields live under `payload.meta`: `warnings_count?: number` counts non-fatal warnings during the operation, and `error_code?: string` is present when `success = false` with a canonical Web Error Taxonomy value.
- Operation-specific payload refs include `content_ref?` for fetched/extracted content, `map_ref?` for map output, and `answer_summary_ref?` for research summaries. `web_input` is the canonical structured routing/audit input; `web_input_preview` is derived display text only and must not replace structured `web_input`. For web/tool denial child payloads, `denial_reason_code` is the operation-local reason field; legacy child payload `blocked_reason_code?` aliases normalize to `denial_reason_code`, while the top-level runtime blocked payload may still carry the shared `blocked_reason_code`.
- Provider-doc volatility must not make the web tool contract brittle. Implementation-safe canon keeps the user-facing and tool-facing (`/tool-facing`) contract stable for `/web`, `search`, `extract`, `research`, `crawl`, `map`, `Searching Web`, `Extracting Site`, `Researching Web`, `Crawling Site`, `Mapping Site`, `Reading Site`, support tiers, citation/provenance rules, and permission keys/defaults, while provider-doc `/classes`, provider-internal, account-vs-API-key grouping, exact global-vs-per-operation ordering UI, and provider row layout remain adapter/provider details until restated through the shared runtime-identity model. This avoids over-locking the provider seam while preserving command semantics.
- `webfetch` is one non-search web primitive among extract/research/crawl/map/read paths, so web notes must not treat it as the only non-search operation. Provenance display follows stronger-evidence precedence, and `/web` UI, `/help/autocomplete`, and slash-command surfaces expose operation support tiers instead of hiding capability behind generic `webfetch`.

Fields:
- `type: "click" | "scroll" | "type" | "press_key" | "wait_for" | "navigate" | "screenshot" | "set_viewport" | "fill_form" | "select_option" | "back" | "reload" | "snapshot" | "console" | "network";`
- `selector?: string`
- `value?: string`
- `timeout_ms?: number`
- `description?: string`
- `include/exclude_paths`
- `/exclude_paths`
- `respect_robots`
- `dedup`
- `formats`
- `detail_level`
- `onlyMainContent`
- `onlyMainContent: true`
- `onlyCleanContent`
- `rawHtml`
- scripts/nav/ads
- /nav/ads
- glob-style
- `WebAction.timeout_ms` / `timeout_ms` defaults to 5000ms; max 30000ms; total across all actions capped at 30s
- Unknown `type` values → `invalid_input` error
- Actions are executed sequentially in array order
- Firecrawl official action labels: wait, click, scroll, write, press, screenshot

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
- execution_path?: string
- provider_search_native
- pm_search_plus_site_reader
- pm_site_reader
- provider_firecrawl_scrape
- pm_fetch_fallback
- provider_firecrawl_agent
- pm_research_composed
- cache_policy?: { max_age_seconds?: number, store?: boolean }
- { max_age_seconds: 3600, store: true }
- { max_age_seconds: 14400, store: true }
- { max_age_seconds: 86400, store: true }

#### Site Reader structured browser runtime

Site Reader is part of the agent web-research seam, not a browser-display feature or thin search helper. PM treats it as the native full browser-automation/structured-reading runtime behind `webfetch` and `Reading Site` when rendered-page evidence is needed. `websearch` remains discovery, while `webfetch`/Site Reader/`Reading Site` own the site/page reading path; these web/read paths do not own the full built-in browser, click-to-context, DevTools-linked capture, or visible browser-session product surface. The runtime exposes grouped internal tool families for navigation, observation, interaction, dialog handling, session state, monitoring, `dev-mode`, evaluate, and a meta-tool for `tool-profile` enable/disable.

The Site Reader renderer pipeline MUST build a structured `PageRepresentation` rather than returning an untyped page dump. It extracts the accessibility tree, layout bounds for relevant nodes, landmarks, headings, interactive elements, forms, content summary/full content according to the requested detail level, and optionally discovered/merged iframe content. The representation carries typed page structure, interactive elements, forms, errors, optional interactive summary, and optional iframes so downstream agents can reason about the page before acting.

Site Reader iframe handling is read-target behavior, not inline visualizer sandboxing. During structured reading, PM recursively discovers nested iframes up to 3 levels deep, attempts cross-origin iframe content extraction only where browser security policy allows, gracefully skips blocked same-origin or X-Frame-Options cases with a warning, may use per-frame CDP sessions when the browser runtime is available, and merges iframe content into the parent `PageRepresentation` with source-frame attribution.

Navigation returns a rendered page representation after URL load. The default detail level is `minimal` for orientation, not full-page extraction; agents escalate detail or use `find` / `/observe` when they need more. Page/session state is owned by the Site Reader runtime: a `PageManager`-equivalent component tracks tabs, the active tab, console/network logs, pending dialogs, popup capture, and error queues.

Site Reader is the default structured-reader engine for web-reading behind `Reading Site` / `webfetch`; plain `/raw` fetch is fallback behavior when the structured reader cannot produce a usable result. The structured-reader subsystem (`/subsystem`) is token-efficient and token-budgeted: it prefers `/text/markdown` and structured page summaries over raw page dumps, preserves stable element identity, separates read/observe (`/observe`) from act/interact (`/interact`, `/interaction`), and may use frame-discovery with frame-level/per-frame CDP session handling for iframes. Non-PM implementation, package, repository, and source-file names do not become PM product vocabulary; the canonical product vocabulary remains `Site Reader`, `Searching Web`, `Reading Site`, `visual module`, `visual card`, `Skill Store`, source-canonical documents, and preview-capable editor/document surfaces; legacy `Skills page` labels normalize to `Agent Config > Skills`, and external `skill-management` labels do not replace PM vocabulary. External editor architecture remains non-normative inspiration, not PM implementation guidance.

#### `webfetch`

This section defines the canonical contract for this surface.

Core rules:
- webfetch URL handling is locked: reject non-HTTP(S) schemes such as `file://`, `ftp://`, and `javascript:`, normalize before routing, default bare domains to https://, reject malformed URLs with invalid_input, and enforce a default 5 MB max_content_length unless configured otherwise.
- Binary `/non-text` webfetch URL responses are detected from the HTTP `Content-Type` header. Supported image types (`image/png`, `image/jpeg`, `image/gif`, `image/webp`, `image/svg+xml`; source shorthands `/png`, `/jpeg`, `/gif`, `/webp`, and `/svg`) return as inline attachments with MIME type preserved and size capped by `max_content_length` (5 MB by default). Unsupported or `/large` binary media such as video, audio, or executables returns metadata only (`MIME type`, `content-length`, `URL`) without downloading the body, and non-text responses do not enter HTML-to-Markdown conversion.
- webfetch defaults `cache_policy` to `{ max_age_seconds: 14400, store: true }` and uses hash-based `change_tracking` with status values `new|same|changed|removed`.
- webfetch accepts `url: string` and returns extracted page `content: string` in the requested format, with markdown as the default content view. Output also carries `execution_path?: string`; valid paths include `pm_site_reader`, `provider_firecrawl_scrape`, and `pm_fetch_fallback`.

Rules:
- reject non-HTTP(S) schemes
- invalid_input
- normalize URL before routing
- default to `https://` if bare domain
- reject malformed URLs
- `max_content_length`
- 5 MB default
- `cache_policy`
- `{ max_age_seconds: 14400, store: true }`
- `execution_path?: string`
- `pm_site_reader`
- `provider_firecrawl_scrape`
- `pm_fetch_fallback`
- `change_tracking`
- hash-based
- `new|same|changed|removed`
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

#### 3.5.A Additional semantics: chatsearch / logs / repo import and codesearch multi-tier (MVP)

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
- **Tool split:** `codesearch` is a multi-tier workspace search tool (Tantivy full-text index, LSP symbol search, and grep fallback), while `lsp` is the direct language-server operation surface for go-to-definition, references, hover, and related symbol calls.
- **Tool boundary:** `grep` is regex pattern matching over raw text, while `codesearch` is semantic/keyword/phrase/symbol workspace search (`/keyword` and `/phrase/symbol`) over code-search indexes and symbol-aware sources. They have different tool contracts, indexes, and use cases even when codesearch falls back to text search.
- **Output:** Return best-effort results with stable `{ path, line_or_range, snippet, kind? }`.
- **Ignore + sensitive guards:** Respect `.gitignore` by default; exclude `.env` and `.env.*` (allow `.env.example`) consistent with FileSafe + Permissions defaults.
- **Secrets policy:** Any indexed/stored snippet text MUST be secrets-scrubbed before persistence to Tantivy.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FileSafe.md

**grep (index-accelerated regex search; MVP)**

The `grep` tool keeps its existing interface and transparently uses a per-project sparse n-gram regex index when that index can narrow the query.

Plans/Tools.md (`/Tools.md`) owns `grep` /fallback semantics, `/sparse-n-gram` index-acceleration behavior, tool-event field disclosure, filtering, and /degradation language: acceleration may narrow candidates, but raw ripgrep remains the visible fallback when the index is unavailable, disabled, invalid, or skipped by query rules. The `/fallback/freshness/degradation/filtering/event-field` owner bundle maps to this section: fallback causes, stale-index freshness, degradation language, filtering rules, and the `tool.invoked.index_used` event field live here.

For multi-project scope, each `grep` call carries a project context from the active tool registry or from the project owning the `path` parameter. PM queries that project's index only; there is no cross-project index merging.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md

- **External contract:** Same compatibility signature `{ pattern: string, path?: string, glob?: string }`, same `matches: Array<{ path, line_number, line }>` result shape for content-mode callers, same project scoping, same result limit (1000), same timeout (30s), and same read-only permission posture as today's `grep`. The richer canonical contract above may expose output-mode variants, but Search-panel regex mode uses the same backend; there is no new user-facing or agent-facing tool name.
- **Correctness model:** The index is only a candidate reducer. Final results always come from ripgrep verification on authoritative file content. Hash collisions, stale base snapshots, and broad dirty-layer candidate inclusion may increase candidate count, but MUST NOT change final correctness.
ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md, Invariant:INV-002

- **Sparse-n-gram model:** This is not a summary-level algorithm and not a classic fixed-trigram index. Build time extracts **all** sparse n-grams from normalized file content via `build_all`. Query time extracts only a **minimal-covering** set from normalized literals. That asymmetric build/query contract is the core selectivity/performance property.
- **Frequency table contract:** Boundary weighting uses a shipped pre-computed 256x256 `u16` base table derived from The Stack Smol, counted on ASCII-lowercased bytes as char-pair frequencies, blended with per-project frequencies using `effective[a][b] = α × base[a][b] + (1-α) × project[a][b]` where alpha defaults to 0.5. The blended table improves selectivity for projects with unusual naming conventions, DSLs, or non-English identifiers, is stored per project in `frequency_table.bin`, and is shared by both build and query logic. It is recomputed only on full rebuilds; Non-Git remote content uses the pre-computed base table only until a project table exists.
- **Boundary-failure fallback:** When weighting cannot place sparse boundaries for a segment of length >= 3, including zero-weight or all-equal blended weights, extraction falls back to fixed-width 3-gram boundaries so the segment remains discoverable.
- **Byte-level operation rule:** N-gram extraction and frequency counting operate on raw bytes. Implementers MUST NOT decode content to Unicode at any point in the indexing or query pipeline. ASCII-only lowercasing (`u8::to_ascii_lowercase()`, loop shorthand `u8::to_ascii_lowercase();`) is the only transformation; non-ASCII bytes pass through unchanged.
- **Line-ending normalization:** The sparse-n-gram pipeline is line-ending-agnostic: index-time and query-time inputs strip CRLF `\r` bytes before ASCII-lowercase, so bare Git clones and Windows working trees produce matching n-grams for the same content.
- **Lowercase query rationale:** CRITICAL FIX: the sparse-n-gram index stores lowercase-normalized n-grams rather than original-case n-grams; both index-time and query-time operate in lowercase space. A case-insensitive query such as `(?i)foobar` therefore queries lowercase forms and gets superset candidates that ripgrep verifies, avoiding case-variant explosion and normalized-hash misses such as `hash("fo")` versus `hash("Fo")`. Case-sensitive queries may get more candidates, but final ripgrep verification preserves exact case correctness.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

- **Query flow:** Parse regex with `regex-syntax` / `regex_syntax` into HIR, extract literals through `regex_syntax::literal`, classify `regex_syntax::literal::Seq` conjunctions versus alternations, strip CRLF `\r` bytes, ASCII-lowercase with `u8::to_ascii_lowercase()`, compute a minimal-covering n-gram set, hash with xxh3, binary-search `lookup.bin`, load Roaring Bitmap postings, intersect within required-literal groups, union across alternations, resolve file IDs / `file_id` entries via `file_map.bin`, apply path/glob filters, add dirty-layer paths, then run ripgrep only on candidate files from the local filesystem, local Git cache via `git show`-materialized content, or dirty staging; index-build bulk reads for bare Git content use `git cat-file --batch`. Git repositories without a public clone URL follow the same non-Git fallback path.
- **Alternation rule (CRITICAL FIX):** Alternation uses union-of-intersections, not pure intersection. For alternatives, e.g., `foo|bar`, PM intersects within each branch and then UNIONs across branches; a match means files containing foo OR bar, not files containing BOTH alternatives.
- **Query skip rules:** Skip the index and run raw ripgrep when no literals can be extracted, for example `.*`, `[a-z]+`, or `\d{3}`; this is the same behavior as the index-missing path. Also skip when a case-insensitive query contains non-ASCII literals or when the covering set exceeds 64 n-grams.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md

- **Freshness model:** PM-mediated writes update the dirty layer synchronously before returning success. Dirty entries are generation-aware path records, not a second canonical search index. All dirty paths are unconditionally included in candidate verification, and deleted dirty paths suppress stale base-index hits.
- **Watcher overflow/rescan model:** When a file watcher reports an overflow/rescan condition, including inotify `IN_Q_OVERFLOW`, FSEvents "must scan", or Windows RDCW buffer overflow, PM marks all indexed files dirty and immediately crosses the re-anchor threshold. This path is equivalent to crash-recovery after losing the dirty layer; on Windows the watcher buffer default is 64 KB to reduce overflow frequency.
- **Stale-index rule:** There is no stale-threshold cutoff and no commit-count-based fallback threshold. When an index snapshot exists, it remains queryable while background refresh or re-anchor work runs; dirty-layer state tracks `SHA` / `HEAD` movement through re-anchor instead of making commit count the freshness proxy. Raw ripgrep fallback is reserved for missing, `/corrupted/building` without a valid snapshot, disabled, or query-skip conditions.
- **Verification fault tolerance:** Per-file verification races (`ENOENT`, permission denied, deleted-between-candidate-and-verify, transient I/O errors) are skip-and-continue conditions, not whole-query failures.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md

- **Filtering rules:** The index respects the same `.gitignore` / `.ignore` baseline as `grep`, applies mandatory secret-path exclusions, excludes binary files using ripgrep-style null-byte detection, honors the per-project large-file threshold (default 10 MB), and applies separate index-exclusion patterns for low-value or generated-file content. The default generated-file exclusion set is `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `*.min.js`, `*.min.css`, `*.map`, `*.generated.*`, `*.g.dart`, and `*.pb.go`; users can add/remove patterns without changing grep ignore rules.
- **Path traversal prevention:** Paths derived from `.gitmodules`, dirty staging notifications, or remote file-change events MUST be canonicalized before use and then validated with `starts_with(project_root)` / `starts_with(cache_root)`. Submodule paths containing `..` are rejected with a logged warning before they can affect the project tree or remote `cache_root`.
- **Symlink policy:** Index build filesystem walks and ripgrep verification default to `--no-follow` / `no-follow`; symlinks are not followed into directories outside the project root. The Indexing settings section may expose a "Follow symlinks" toggle, but it is OFF by default. When enabled, PM still canonicalizes each resolved path and applies `starts_with(project_root)` validation after canonicalization before indexing or verifying a symlink target.
- **User-facing search:** When the Search panel regex toggle is ON, the same sparse-n-gram path accelerates find-in-files. Search inherits the same dirty-layer freshness guarantee and the same fallback causes as agent `grep`.
ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

- **Performance / acceptance targets:** Indexed query latency target is <20 ms across repository sizes. Full-build targets are <2 minutes for <=500 MB, <10 minutes for <=5 GB, and <30 minutes for <=50 GB on SSD-class storage. Incremental rebuilds may temporarily use roughly 1.5x index size in RAM because extraction is incremental but serialization is full-snapshot rewrite. SSD storage is the supported baseline for repositories above 5 GB. Steady-state memory: peak RSS contribution typically <500 MB (only the lookup table is mmap'd; postings are streamed via offset). Dirty-layer insert: <1 ms per path (synchronous HashMap update). Typical index size: 1-10% of source code size. Build-thread dependencies, also reflected by `storage-plan.md ### 2.4`, include `thread-priority` alongside `regex-syntax`, `roaring`, `memmap2`, `xxhash-rust`, and `arc-swap`; `thread-priority` runs build threads at `ThreadPriority::Min`, wraps `setpriority/pthread_setschedparam` on Unix and `SetThreadPriority` on Windows, and on macOS Apple Silicon additionally calls `pthread_set_qos_class_self_np(QOS_CLASS_UTILITY)` for energy-efficient scheduling so indexing does not starve the editor.
- **Build publication and cancellation handoff:** Storage owns the detailed snapshot lifecycle, while this tool contract depends on the same guarantees: builders write the next generation under `gen-{N+1}/`, flush generation files with `File::sync_all();` / `sync_all` before publication, check `CancellationToken` between file-processing iterations, and document incremental rebuild cost as O(index_size) RAM.
- **Rust implementation foundation:** PM assembles well-understood Rust crates rather than a from-scratch novel algorithm: regex parsing uses `regex-syntax` plus the `regex_syntax::literal` module and `regex_syntax` HIR extraction; posting operations use `roaring` intersection and /union behavior; lookup mmap uses `memmap2`; and SIMD may optimize candidate or verification loops without changing correctness. `trigrep` and `fast-grep-rust` are disk-backed study references only, while Cursor, ClickHouse, and GitHub Code Search are proof points, not PM dependencies.
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
- **Output:** `{ repo_id?, project_id?, workspace_root?, mount_ref?, status, warnings[]?, imported_ref? }`; temporary mounts return a bounded `mount_ref` instead of silently creating a permanent workspace root.
- **Limits:** import must honor FileSafe write scope, project-root/path traversal guards, maximum repository size and clone timeout, and network/provider permissions; `temporary_mount` data is lifecycle-bound and excluded from durable project identity until promoted.
- **Errors:** structured failures include `invalid_source`, `permission_denied`, `filesafe_blocked`, `repo_too_large`, `clone_failed`, `auth_required`, `destination_exists`, and `network_unavailable`; failed imports must not leave a half-registered project/workspace root.

### 3.6 Task tool and the 42 subagents (Plans)

The public `task` contract describes delegated work, not a user-curated agent catalog. Hidden, unavailable, or policy-blocked subagents stay out of public discovery and out of runtime success-shaped fallbacks.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Permissions_System.md

#### Request shape

| Field | Type | Required | Notes |
|---|---|---|---|
| `goal` | `string` | yes | The delegated work to perform. |
| `context?` | `object` | no | Structured supporting context, refs, or constraints. |
| `owner_hint?` | `string` | no | Exact-match hint against `crew.roles`; on no match the current session remains the owner. |
| `subagent_type?` | `string` | no | Optional child role selector; when present, validate it against the `subagent_registry` enum of 42 subagent types before launch. |
| `resume?` | `{ delegated_session_id: string }` | no | Resume token for an existing delegated run. |
| `timeout_s?` | `number` | no | Caller-selected ceiling when policy allows. |

This request-shape table is the task tool input schema. The dispatch contract resolves an accepted `subagent_type` through the same run-config, permission, and tool-policy pipeline as other child launches, rejects unknown subagent types before launch, and keeps hidden, inaccessible, or policy-blocked subagents out of selectable public inputs.

#### Runtime result shape

| Field | Type | Notes |
|---|---|---|
| `delegated_session_id` | `string` | Stable identity reused on resume. |
| `status` | `pending | running | completed | failed | cancelled | timed_out` | Child lifecycle. |
| `summary?` | `string` | Short user-facing result. |
| `artifacts[]?` | `array` | Optional refs emitted by the delegated run. |
| `failure_detail?` | `object` | Structured failure disclosure when not completed. |

Runtime rules:
- Task I/O is resume-aware: resumes reuse the stable delegated session, surface `resumed: boolean` only as provider-facing compatibility metadata, and normalize returned text/artifacts back into PM's canonical child-run result shape.
- resume reuses the same `delegated_session_id`; it does not mint a fresh child identity
- provider-facing compatibility output may expose `task_id`, `subagent_type`, `resumed: boolean`, `result_text`, and `runtime_snapshot?`, but PM normalizes those values back to the canonical child-run identity and user-facing result shape
- hidden, inaccessible, or denied subagents are not advertised as selectable, subagents inherit parent permissions with enforced overrides, `todowrite` / `todoread` remain denied by default for subagents unless explicitly re-enabled by run config, and nested `task` stays denied unless the target subagent/run config explicitly permits it
- The low-level permission engine remains the base enforcement point for task/subagent launches; permanent-approval UX, /logging/subagents visibility, and aggressive-by-default read-heavy delegation heuristics are consumed through the permission, chat, storage, and orchestrator owners while Tools keeps the user-facing `task` envelope tight.
- User-asked subagent usage is honored when feasible. Without explicit instruction, PM may be aggressive-by-default about read-heavy `task` delegation when specialist-fit and task-fit evidence is strong; GUI/chat transparency records which subagent or `/persona` was used, why when meaningful, what task it owned, TODO linkage, `/blocked` or failure state, and lifecycle in thread history/storage after registry validation.
- task-launched MCP dependencies use the shared MCP runtime `/auth/config` owner rather than task-local config. Local MCP entries use `type: "local"` plus `command: string[]`; remote entries use `type: "remote"` plus URL/auth state, and task metadata may reference that resolved runtime but does not copy secrets.
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
- **Enterprise host-policy:** MCP, custom, `/custom/plugin`, `/import/share`, and plugin tools that touch external `/hosts` declare contacted domains before execution. The same `host-policy`, proxy, and trust checks used by core web/runtime surfaces apply before the subprocess or adapter runs. Diagnostics distinguish `blocked_by_host_policy`, `host_blocked_by_policy`, `proxy_auth_required`, `tls_untrusted`, `offline_cached_only`, and `enterprise_host_unsupported` from generic network failure; offline cached results are read-only evidence, not live authority.

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
- MCP-specific skill metadata is a consumer of the central registry, not a competing tool model: requested/effective `tool-resolution` is resolved through the registry and policy engine before provider-specific projection or skill metadata is interpreted
- Tool-registry consumers expose MCP `/remote/auth/debug/status` as requested/effective availability and auth-state evidence from `Plans/MCP_Integration.md`; this is a lower-level owner handoff, not a second MCP schema in Tools.
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

- Claude Code CLI structured output probes such as `claude -p --output-format json --permission-mode plan "Reply exactly OK"` can return usage fields including `usage.outputTokens`, `usage.cacheReadTokens`, and `usage.cacheWriteTokens`. PM treats those as provider/runtime usage observations that normalize through `usage.event`, not as a separate tool counter schema.
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
- `tool.invoked` events for grep/Search acceleration include optional `index_used`; `tool.invoked.index_used = true` means sparse-n-gram candidate narrowing served the query, while `false` means raw ripgrep fallback or another unindexed path served it.
### 8.1 Config persistence

- **Where:** Tool permissions live in the same config as the rest of Settings (e.g. `GuiConfig` in memory, persisted to redb as `config:v1` per FinalGUISpec §15.1). Use the key **`tool_permissions`** (object: tool name or wildcard → `"allow"` | `"deny"` | `"ask"`, or per-tool object for granular rules per §10.1).
- **Scope:** Tool permissions support app-level defaults plus project-scoped overrides for the active project context. Project switching recalculates the effective permission set from the current scope layers.
- **Mid-run:** Run config is an immutable snapshot at start (FinalGUISpec §9.7). Changing Settings (including tool permissions) mid-run does **not** affect the active run; next run picks up the new config.

### 8.2 Policy application order and invocation flow

Tool dispatch follows one canonical order. No tool implementation is invoked directly outside this flow.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md

Child-run tool dispatch inherits the parent run's tool policy, deadline, and MCP effective-availability snapshot unless the run envelope carries an explicit narrower override. The child tool set is resolved from the central tool registry plus effective MCP-discovered tools before policy filtering, so built-in, custom, provider-exposed, and MCP tools follow one readiness and permission path. `/helper/background` work uses the same policy application order as foreground tool calls and must not bypass per-tool policy, schema validation, or timeout propagation.

### Schema isolation and OAuth state

Tool dispatch consumes MCP-owned schema/OAuth facts without re-owning them. The `/OAuth/timeout` contract is: OAuth-required tool calls must fail fast with structured auth or timeout evidence when the MCP owner reports expired auth, missing client registration, callback/listener failure, or exhausted parent deadline; the tool layer must not retry by minting a hidden OAuth flow or extending the run timeout.

OAuth callback listeners MUST use the configured loopback `bind-address` / `bind-host` from the auth owner contract; wildcard, public-interface, or tool-invented callback binds are callback/listener failures and must not silently widen the listener.

WSL/container OAuth callback surfaces keep that owner-provided loopback binding explicit; hardcoding `127.0.0.1` in the wrong network namespace is a callback/listener failure, not a reason to widen the listener.

MCP schema resolution treats a repeated `$ref` revisit as a `schema-cycle`: the cycle-break output substitutes the revisited branch with `{}`, emits a structured warning, and continues validation only for the safe continuation surface rather than recursing indefinitely. This prevents DataHub/Supabase-style circular-schema `RecursionError` crashes during tool registration.

Malformed MCP tool data is isolated per-server and per-tool: schema violations emit a structured `mcp_schema_mismatch` envelope plus diagnostic evidence, do not crash the host, and do not poison other servers' availability or tool records.

This section intentionally replaces under-specified and over-summarized child-run/MCP tool wording: inherited deadlines, pre-validation, schema validation, OAuth timeout handling, and unavailable-server behavior must stay explicit. The owner-level contract is a pre-dispatch pipeline, not a consumer hint.

Additive owner-detail for this Tools anchor: provider `finishReason` / `finishReason=length` with `stop_reason = length` on an incomplete tool call is a `no-dispatch` gate before permission, schema, or any tool execution; retry taxonomy is `per-class` with explicit attempt ceilings and bounded recovery posture; loop suppression may use `similarity-based` equivalence only after normalized fingerprint and error-class comparison and must still emit a diagnostic; nested runtime/tool work inherits hierarchical deadline propagation. MCP OAuth state stays stable across tool dispatch: client registration uses a durable `client-id`, callback setup uses the owner-provided `callback-listener`, and token persistence serializes each `token-write` so concurrent refresh or callback paths cannot race or replace a valid token.

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
- the PM LESSON from empty `tool_result` crashes is that pre-execution validation must reject invalid payloads before dispatch, and max retry limits are PER error type rather than global text matching
- provider-specific retry decisions MUST use structured error classes or status codes, never substring matching on error text
- non-permission tool errors, including `OC-EXEC-106`, MUST surface as `is_error=true` with the error message and MUST NOT return a zero-value success-shaped result on error

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/CLI_Bridged_Providers.md

Truncation gate:
- if upstream provider output ends with `finishReason=length` or equivalent truncation while a tool invocation is incomplete, PM closes the invocation with a structured truncation error and MUST NOT dispatch the tool
- PM closes incomplete `tool_use` payloads with `tool_result(ok=false, error=truncated_by_length)` and MUST NOT synthesize missing arguments
- PM MUST reject empty, `/minimal`, or structurally incomplete tool arguments produced by truncation before any permission or execution path is reached

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
- banned-command checks scan the full rendered command string, including metacharacter and control forms such as `;`, `&&`, `||`, `|`, subshell/grouping constructs, command substitution (`$()` and backticks), and redirection operators where relevant to the shell family; this is full-string validation for the shell-runtime surface
- implementations SHOULD prefer structured parsing or AST-aware validation where the shell family makes it practical; fallback scanning still MUST evaluate the full rendered command rather than only the first token
- dispatch occurs through exactly one shell interpretation layer; never eval, and `eval` or equivalent second-pass command construction is prohibited
- Unix-style shell dispatch passes the already `shellQuote`-protected command through `exec.Command("bash", "-c", command)` or an equivalent one-layer platform runner; it must not run a second interpreter after quoting.
- shell selection is platform-aware (`/bin/bash` or equivalent on Unix; `cmd.exe` / PowerShell family on Windows based on configured tool semantics)
- all paths interpolated into shell commands MUST be shell-escaped for the target platform; on Windows this means quoting, double-backslash handling, or forward-slash conversion according to the selected shell, and individual tools MUST NOT implement their own competing escaping layer
- shell instances are isolated per agent tree so environment variables do not leak across session/agent boundaries
- shell lifecycle is mutex-guarded; work queues MUST be `/non-blocking`, and writes to a dead shell return a structured error instead of hanging forever
- `OC-LIFE-006` requires an alive-check before queue writes; if the shell is dead, PM returns a structured LIFE error instead of blocking forever

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Permissions_System.md

OC reference coverage for this owner section includes shell command validation `OC-EXEC-101` / `/108`, Windows shell/provider behavior `OC-PROV-012`, tool error surfacing `OC-EXEC-106`, shell lifecycle `OC-LIFE-004` / `/005/006`, MCP connection pooling `OC-PROV-006`, and MCP refresh `OC-PROV-005`. These codes are evidence labels only; the canonical behavior is the full-command, one-interpretation-layer, lifecycle, schema, `/error-isolation`, and MCP availability contract above.

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
- **Value shape:** JSON or bincode: `{ [tool_name: string]: { count: number, p50_ms: number, p95_ms: number, error_count: number, index_used?: { true_count: number, false_count: number } } }`. Example: `{ "bash": { "count": 42, "p50_ms": 120, "p95_ms": 500, "error_count": 2 }, "grep": { "count": 30, "p50_ms": 18, "p95_ms": 40, "error_count": 0, "index_used": { "true_count": 24, "false_count": 6 } } }`. Analytics scan aggregates `tool.invoked` events (fields: tool_name, latency_ms, success, error, and grep/Search `index_used`) into this structure so the Usage page can render the table without scanning seglog. See §8.0 for event payload and storage-plan.md §2.3.
- **Runtime identity alignment:** Blocked episodes and tool/runtime recovery evidence are `node-native`; tool-facing `usage/evidence/runtime` rollups MUST NOT remain `tier-native` execution authority. Consumers align those rollups to graph `/node/package/seam/lane` identity, and any `tier-aligned` or `tier-native` fields survive only as compatibility/grouping projections.
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
- MCP tool enable/disable layering follows the canonical `Plans/Permissions_System.md` precedence and does not add an `org` layer; older `project > global > org > default` wording is non-canonical historical wording.
### 8.7 MCP server unavailable

When an MCP server is unavailable because of startup timeout, transport failure, auth loss, schema mismatch, or repeated health-check failure, PM treats this as a structured degraded-state condition.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

Required behavior:
- Tools from that server are marked `unavailable` in the registry.
- Calls to those tools fail immediately with a structured error and `failure_class=provider_transient` (or a stricter class when the error is known-fatal).
- Per-tool MCP invocation timeout defaults to 30 seconds and MAY be overridden per server with a configured timeout. This timeout is independent of startup-timeout and reconnect cool-down settings.
- PM emits a structured diagnostic containing `server_id`, `reason`, `last_healthy_at`, and whether a stale list is still available.
- A transient `listTools()` failure is CRITICAL but not destructive to singleton state: PM retries or marks the server degraded, preserves the last known client identity when safe, and MUST NOT permanently delete the MCP client or make tools vanish forever after one listTools error.
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

The following are **optional** improvements. MVP is defined by §3 built-in tools, §10 permission model, §8 events/rollups, and GUI Tool permissions (`Plans/Permissions_System.md` §10 plus `Plans/FinalGUISpec.md` §7.4 Settings and inspectors).

| Enhancement | Description | Priority / notes |
|------------|-------------|-------------------|
| **Per-tool rate limits** | Limit invocations per tool per run/session (e.g. max 100 grep calls). | Reduces runaway tool use; configurable per tool or global. |
| **Tool usage dashboard** | Dashboard widget: most-used tools, latency p50/p95, error rate by tool (from seglog rollups). | storage-plan + usage-feature; already implied by analytics scan. |
| **Permission presets** | Presets: "Read-only" allows read/grep/glob/list/codesearch/chatsearch/logsearch/skill/read-only lsp/question/todoread/todowrite/capabilities.get, asks for webfetch/websearch/logread/task, and denies edit/bash/repo.import/media.generate; "Plan mode" allows the Read-only set, asks for the full web family plus logread/task, and denies state mutation; "Full" allows read/search/skill/lsp/question/todo with asks for mutation-capable tools. | Simplifies config; maps to assistant modes (Ask, Plan, Agent). Plan mode allows information gathering but not state mutation. |
| **Custom tool templates** | Project or org templates for common custom tools (e.g. "run tests", "deploy staging") with schema and default permission. | Encourages reuse; catalog in docs or GUI. |
| **MCP tool allowlist** | Option to allow only specific MCP tools by name (e.g. only `context7_query_docs`) even if server is enabled. | Finer control than server-level enable; complements wildcards. |
| **Audit log for denied/ask** | Explicit audit event when a tool is denied or when user declines an "ask". | Helps compliance and debugging; store in seglog with tool name, reason, timestamp. |
| **Tool description in UI** | In Config or run summary, show which tools are available and their permission (allow/deny/ask) for the current run. | Transparency; can be generated from registry + run config. |
| **Bash command allowlist** | Beyond FileSafe blocklist: allowlist of permitted commands (e.g. `npm test`, `cargo build`) when bash is "allow". | Stricter than blocklist-only; optional; align with FileSafe. |

---

## 10. Implementation plan: permissions (spec for implementers)

> **SSOT:** The canonical permission specification (actions, precedence, granular rules, wildcards, special guards, ask-flow, defaults, resolution algorithm, persistence, and GUI) is **`Plans/Permissions_System.md`**. This section provides implementation-oriented guidance for the tool registry and policy engine integration. It references the SSOT for normative definitions and adds tool-registry-specific details (FileSafe integration, CLI derivation, presets) that are scoped to this document.

ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules

Mode-override alignment rule: Tools consumes the Permissions SSOT for presets; plan/research mode-override text must not imply blanket denial of `/question/skill/LSP/todo/subagent` or `/search/skill/lsp/question/todo` help-family tools when the effective preset allows them.

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

The Permissions GUI is specified in `Plans/Permissions_System.md` §10 and `Plans/FinalGUISpec.md` §7.4 Settings and inspectors. The tool registry supplies the list of known tool names (built-in + MCP-discovered) to populate the GUI's per-tool list.

### 10.6 FileSafe integration order and API

- **Canonical order owner:** `§8.2` is the authoritative dispatch sequence. This subsection is an API summary only and MUST NOT be read as a competing order definition.
ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md
- **Single API (recommended):** `policy.may_execute_tool(tool_name, invocation_context) -> Result<Allow | Deny(reason) | Ask, Error>` remains the permission entrypoint within that sequence. Runner code calls it before any underlying tool implementation is invoked.
- **FileSafe contract:** FileSafe exposes e.g. `check_bash_command(cmd)`, `check_write_path(path)`, `check_read_path(path)`. For file-affecting or shell-affecting tools, FileSafe runs on normalized arguments inside the canonical `§8.2` flow; hook-mutated arguments trigger the required re-checks before dispatch.

### 10.7 Ask-flow runner notes

Ask-flow semantics (`deny`/`once`/`for session`/`always`) are defined in `Plans/Permissions_System.md` §6. Implementation notes for the runner:

- **Assistant (interactive):** When policy returns **ask**, surface a `blocked_notice` as a **pending approval** to the UI. The notice includes `action_available` (the scoped response options: `deny` / `once` / `for session` / `always`), `blocked_reason_code`, `blocked_sequence`, and `approval_scope_key`. See `Plans/Permissions_System.md` §6 for response semantics.
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
7. **GUI Tool permissions** -- Settings > Permissions (`Plans/Permissions_System.md` §10 plus `Plans/FinalGUISpec.md` §7.4 Settings and inspectors); presets per §10.4; load/save `tool_permissions` (§10.5).
8. **Usage widget and rollups** -- Analytics scan → redb `rollups` / `tool_usage.{window}` (§8.4); Usage view §7.8; empty state message.
9. **Central registry and policy engine** -- Registry + policy; single API e.g. `policy.may_execute_tool` (§10.6).
10. **Registry → CLI derivation** -- Single function per platform (§8.3, §10.8).
11. **MCP integration** -- Discovery, namespacing, hide if server fails (§8.7); all providers in GUI.
12. **Ask UI and headless** -- Assistant: Once / For session / Deny; headless: ask → deny or HITL (§10.7).
13. **LSP tool promotion** -- MVP when LSP is MVP (Plans/LSPSupport.md §9.1); no feature flag; rename requires approval.
14. **Addenda consolidation gate** -- Run the `FinalGUISpec` (22), `orchestrator-subagent-integration` (8), and `feature-list` (13) addenda through a `merge-and-dedup` owner pass so body-owned content lands in canonical sections and retired residue is not preserved as live implementation text.
15. **Machine verification gates** -- Keep machine-verification aligned with the `/gate` story: owner docs that advertise verifiable tool behavior must expose concrete schemas, event fields, policy outcomes, and evidence refs before a gate can treat the claim as supported.
16. **Doctor and docs** -- MCP/LSP checks; document default table and resolution.
17. **Subagent tool overrides** -- Document `subagent_tool_overrides` schema (e.g. `{ "todowrite": "allow" }`) and config location in orchestrator-subagent-integration.md so run config can override todowrite/todoread for subagent runs.

---

## 13. References

- [OpenCode -- Tools](https://opencode.ai/docs/tools/) -- Built-in tools, permission model (allow/deny/ask), custom tools, MCP servers, ignore patterns (primary reference for §2-§4).
- [OpenCode -- Permissions](https://opencode.ai/docs/permissions/) -- Granular rules (object syntax), external_directory, doom_loop, defaults (.env for read), "What Ask Does" (once/always/reject), per-agent overrides; cross-plan alignment §2.5.
- [Model Context Protocol -- Specification (latest)](https://modelcontextprotocol.io/specification/latest) -- MCP spec; PM naming/availability/auth-state canon is captured in `Plans/MCP_Integration.md`.
- Operational surface reference baselines for Source Control, GitHub Actions, Docker Manager, and Kubernetes MVP parity: `github/vscode-github-actions` (`/vscode-github-actions`), `docker/vscode-extension` (`/vscode-extension`), `microsoft/vscode-containers` (`/vscode-containers`), and `vscode-kubernetes-tools/vscode-kubernetes-tools` (`/vscode-kubernetes-tools`, `vscode-kubernetes-tools` namespace).
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
## Tool Denial and Runtime Action Canonical Alignment (2026-03-09)

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

Packet regeneration treats `## 10` as one coherent owner-section replacement unit: do not preserve a stale parent `## 10` owner body beside newer child `### 10.3` or `### 10.7` replacements for the same Firecrawl subtree.

Drift guard for `Plans/Tools.md#10 Firecrawl provider integration`: this section is the single owner-level Firecrawl subtree; packet repair must collapse two incompatible owner-level truths into the current provider capability/routing canon instead of keeping stale parent and child bodies as peer canon.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### 10.1 Provider configuration

This section defines the canonical contract for this surface.

Core rules:
- The Firecrawl configuration field set must preserve proxy_mode with the exact supported enum values and the self-hosted Fire Engine limitation note.
- The Firecrawl owner section must preserve the base configuration fields and default-disabled state already restored in the live owner doc.
- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default priority below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale cited-search framing and older `newtools` wording" from owner/provider canon.
- Firecrawl configuration exposes `timeout_ms?: number` with default 60000 and `proxy_mode?: "basic" | "enhanced" | "auto"` with default `"auto"` for cloud mode; slash lineage `/enhanced/auto` normalizes to the enhanced/auto enum choices rather than adding another mode.
- Firecrawl `timeout_ms` is provider-level configuration, not a user-facing or per-invocation `webfetch`/web operation parameter; callers express narrower limits through approved run or provider policy rather than a tool input named `timeout`.
- Provider-reference implementation notes are non-normative PM product vocabulary: confirmed Firecrawl lineage may name Node.js/TypeScript (Express), proprietary Fire Engine with Playwright fallback, Redis, and `playwright-service`, while other provider internals remain outside PM canon unless Firecrawl documents them.

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
- Firecrawl operation endpoints are method-locked for PM routing: `websearch` -> `POST /v2/search`, `webextract` -> `POST /v2/extract`, `webresearch` -> `POST /v2/agent`, `webcrawl` -> `POST /v2/crawl`, `webmap` -> `POST /v2/map`, `webfetch` -> `POST /v2/scrape`, and `batch_webfetch` -> `POST /v2/batch/scrape`.
- Firecrawl provider-side capability names such as `executeJavascript`, `scrape`, and `pdf` are adapter-lineage only unless a future provider contract maps them; PM must not add them to the `WebAction` enum or expose arbitrary provider code execution as a first-class user tool.

### 10.3 PM-to-Firecrawl mapping

This section defines the canonical contract for this surface.

Core rules:
- The Firecrawl webextract mapping must preserve structured extraction modes and option surface, not a thin single-URL summary.
- The Firecrawl webresearch mapping must preserve provider-native no-URL research behavior, navigation/forms/pagination capability, and structured extraction during agent-led research.
- Firecrawl `webextract` maps PM `url` to provider `urls: [url]` for the strict one-URL PM call shape and maps JSON Schema to provider `schema`; URL wildcards and domain-wide extraction remain provider capabilities but PM still validates scope before dispatch. Provider options `enableWebSearch`, `urlTrace`, and `showSources` remain adapter-boundary options surfaced only through typed provider options or audit metadata. `strictConstrainToURLs` is intentionally not mapped as a PM-exposed parameter because it is unconfirmed; PM's one-URL constraint is enforced by the PM contract before adapter dispatch.
- Firecrawl `webresearch` accepts `task: string` and returns a `multi-source result + sources/provenance`; it does not imply chaining, autonomous behavior, or a complete behavioral spec beyond the web operation runtime contract.
- Firecrawl research adapter mapping treats PM `task` as provider `prompt`; `max_sources` is only an approximate adapter hint to `maxCredits` because Firecrawl limiting is credit-based, not source-based.
- The Firecrawl websearch mapping must preserve provider-specific search behavior and option surface.
- Firecrawl `websearch` preserves source and category filters where the provider supports them: PM `sources` maps to provider `sources` with supported values `["web", "news", "images"]`, and PM `categories` maps to provider `categories` with supported values `["github", "research", "pdf"]`.
- Firecrawl `/v2/search` response transformation is exact: provider responses may be source-partitioned as `{ web: [...], images: [...], news: [...] }`, and the adapter flattens them into PM's unified `results` array, tagging each item with `source_type` and preserving per-source rank order. Merge order remains web results first, then news, then images.
- Firecrawl websearch `scrapeOptions` defaults use `formats: ["markdown"]` and `onlyMainContent: true` unless an explicit supported request narrows or expands that provider-side scrape behavior.
- Firecrawl interact/browser capabilities are sub-features accessible through `/v2/scrape` `actions` or the interact-session flow; they are not standalone PM core endpoints or separate `/v2` endpoint families.
- Firecrawl `webmap` sitemap discovery errors are canonical: return `map_timeout` when site map discovery exceeds the provider timeout, and return `map_no_sitemap` when `use_sitemap` is `"only"` but no `sitemap.xml` is found at `root_url`.
- The Firecrawl owner section must either preserve `changeTracking` with its structured output shape or explicitly retire it as out of scope; it must not disappear silently.
- The Firecrawl mapping table must preserve all PM operation rows, including the exact batch_webextract mapping POST /v2/extract with urls[].
- Firecrawl search responses must be transformed into PM's unified search result shape by flattening source-partitioned results into one results array and tagging each item with source_type in a fixed merge order.
- PM `dedup` maps to Firecrawl `deduplicateSimilarURLs`, preserving Firecrawl default true behavior; PM `filters` map to Firecrawl `includePaths` and `excludePaths`.
- `webmap` accepts `use_sitemap?: "include" | "only" | "skip"` with default `"include"`; the legacy shorthand `include|only|skip` maps to this enum.
- Firecrawl `webcrawl` provider options preserve `ignoreRobotsTxt`, `delay`, and webhook callback capability as provider-native adapter controls; PM exposes them only through typed provider options and policy, not as global web or run modes.
- Firecrawl crawl mapping keeps PM-owned limits ahead of provider defaults: PM `root_url` maps to provider `url`, PM `max_pages` maps to provider `limit`, Firecrawl's provider default `limit` of 10000 does not override PM's default `max_pages = 25`, and callers must raise PM's limit explicitly when larger crawl breadth is intended.
- Cache-capable Firecrawl operations accept `cache_policy?: { max_age_seconds?: number, store?: boolean }`. The Firecrawl provider default is `{ max_age_seconds: 86400, store: true }`; PM may still apply narrower operation-specific defaults such as the existing webfetch 14400-second read cache where the routing contract says so.
- Firecrawl provider-cache parameters are adapter-boundary details: PM exposes `cache_policy.max_age_seconds` and maps it to Firecrawl `maxAge`; Firecrawl `minAge` and `storeInCache` are not PM-exposed parameters, and provider default `storeInCache: true` remains subordinate to the PM-owned cache policy.
- Firecrawl search does not map PM `include_domains` to `scrapeOptions.includeTags`; that source mapping is intentionally retired as unconfirmed. If the effective Firecrawl search route cannot enforce `include_domains` natively, PM applies the domain filter post-search before candidate-source selection.
- Firecrawl search mapping treats `exclude_domains` as not directly supported by the provider search route; PM filters excluded domains post-search before candidate-source selection. `time_range` maps to provider `tbs`, the Firecrawl time-based search parameter, when that adapter path is selected.
- Firecrawl change tracking maps PM `change_tracking: true` to a `formats` entry `{type:"changeTracking"}` where the provider route supports it. Legacy `cache_ttl` normalizes to `cache_policy.max_age_seconds`; PM exposes seconds while the Firecrawl adapter converts to provider `maxAge` milliseconds.
- Webcrawl `change_tracking` is PM-owned for crawl diffs: it requires storing previous crawl state and comparing the new crawl against that state. Firecrawl does not natively diff whole crawls for PM's per-page crawl contract, so any provider `changeTracking` output is subordinate to PM persistence, comparison, and audit semantics.
- PM `websearch` maps to native provider search when available and reports `execution_path?: string` as `provider_search_native`; the composed fallback path reports `pm_search_plus_site_reader` when search discovery is paired with Site Reader page reads.
- PM `webextract` accepts `cache_policy?: { max_age_seconds?: number, store?: boolean }` with default `{ max_age_seconds: 14400, store: true }`.
- PM `webresearch` reports `execution_path?: string` as `provider_firecrawl_agent` when delegated to `/v2/agent`, or `pm_research_composed` when PM composes search plus read/extract cycles itself. For Firecrawl agent delegation, `depth_hint` is an adapter hint for provider model selection: PM `fast` maps to `spark-1-mini`, PM `deep` maps to `spark-1-pro`, and `balanced` or absent depth uses the configured/provider default model rather than inventing a PM-owned model.
- PM `webcrawl` accepts `cache_policy?: { max_age_seconds?: number, store?: boolean }` with default `{ max_age_seconds: 86400, store: true }`.

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
- `query` -> `query`
- `max_results` -> `limit`
- configurable `limit` parameter; actual cap varies by plan and source type
- PM default 8
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
- `dedup` -> `deduplicateSimilarURLs`
- `filters` -> `includePaths` + `excludePaths`
- `use_sitemap?: "include" | "only" | "skip"`
- `cache_policy?: { max_age_seconds?: number, store?: boolean }`
- default `{ max_age_seconds: 86400, store: true }`
- `provider_search_native`
- `pm_search_plus_site_reader`
- `provider_firecrawl_agent`
- `pm_research_composed`
- default `{ max_age_seconds: 14400, store: true }`

Labels and values:
- Firecrawl
- websearch
- webfetch
- webcrawl
- webmap

Rules:
- changeTracking { status: changed | unchanged | no_previous_version, previous_checked_at_utc?, previous_content_ref?, diff_summary_ref?, checked_at_utc }
- change_status: "new" | "same" | "changed" | "removed"
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
- Long-running web operations must preserve the structured progress_event payload and cancellation-with-partial-results contract. `webcrawl` is always potentially long because it crawls N pages sequentially/in parallel; `webmap` is usually fast for sitemap parsing but can be slow during link traversal on large sites; autonomous `webresearch` can involve multiple search-read cycles; `batch_webfetch` and `batch_webextract` are potentially long because they process multiple URLs and may reach the locked batch timeout envelope. `webfetch`, `websearch`, and `webextract` remain synchronous from PM's perspective as single-request operations.
- The activity stream Stop button cancels long-running operations and returns partial results collected so far with `cancelled: true`.
- The Firecrawl async contract must preserve the exact poll ladder and status family already restored in the owner section.
- Async Firecrawl operations begin with `POST /v2/<operation>` and return `{ success: true, id: "<job_id>" }`; PM polls `GET /v2/<operation>/<job_id>` until the response `status: "scraping" | "processing" | "completed" | "failed" | "cancelled"` reaches a terminal value. The returned `job_id` stays in lineage and audit metadata; polling is MVP, while provider `/webhooks` / webhook `POST` delivery is a non-MVP provider option.
- If a future webhook-based completion path is enabled, Firecrawl webhook delivery must verify `X-Firecrawl-Signature` as HMAC-SHA256 of the payload before accepting the callback. Signature verification is MANDATORY for that future path and is NOT MVP while PM uses polling.
- Poll responses may include partial `data` while in-progress. On `completed`, PM returns full results to the tool layer; on `failed`, PM maps the provider error into PM's error-code family; on timeout, PM returns a `timeout` error with any materialized partial results.
- Chat and activity surfaces must not appear-complete while `Researching Web` is still performing multi-step search, read, or extraction work; they render intermediate `progress_event` updates until the final terminal status is known. Batch URL operations surface count-based progress such as `Fetching sites: 5/20 complete`, and each URL is cached independently under the same cache semantics as a single `webfetch`.

Fields:
- timeout_ms
- timeout when polling exceeds `timeout_ms`
- partial results survive timeout if already materialized
- webcrawl
- webmap
- webresearch
- batch_webfetch
- batch_webextract
- crawling N pages sequentially/in parallel
- progress_event
- appear-complete
- Researching Web
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
- Routing must remain cost-aware when multiple providers offer similar capability: PM prefers lower `estimated_credit_cost` unless capability, policy, or freshness provides a stronger `adapter_selection_reason`; static priority alone is insufficient, and estimates above 100 credits require cost confirmation before execution while the 500 credits cap remains aligned with routing.
- The Firecrawl credit and disclosure contract must preserve the warning threshold, hard cap, and self-hosted billing exception already restored in the owner section.
- Firecrawl Zero Data Retention (ZDR) is NOT MVP; it is an enterprise future consideration. If enabled by global adapter config `firecrawl_zdr?: boolean` and not per-request, Firecrawl uses `zeroDataRetention: true` on scrape (+1 credit/page) and `enterprise: ["zdr"]` on search (10 credits/10 results). When ZDR is enabled, PM cache is the ONLY persistence layer.
- Firecrawl cost references are advisory routing inputs, not user billing truth. PM records the provider endpoint, estimated credit class, `estimated_credit_cost`, ZDR modifier, and any self-hosted exception in audit metadata before applying warnings or caps.

| PM operation | Firecrawl endpoint | Base credit cost | Modifiers |
|---|---|---|---|
| `websearch` | `/v2/search` | 2 per 10 results | `scrapeOptions` add scrape costs; ZDR search uses 10 credits/10 results. |
| `webfetch` | `/v2/scrape` | 1 credit per page | enhanced proxy +4, JSON mode +4, ZDR +1. |
| `webfetch` interact session | `/v2/scrape/{id}/interact` | 2/min for code or 7/min for AI | session-time based. |
| `webextract` | `/v2/extract` | variable extraction credits | JSON mode and page-count modifiers apply when provider-supported. |
| `webresearch` | `/v2/agent` | dynamic, approximately 20-2500 | `spark-1-mini` is a lower-cost provider model option when selected through adapter policy. |
| `webcrawl` | `/v2/crawl` | 1 credit per crawled page | enhanced proxy and JSON mode modifiers apply per page. |
| `webmap` | `/v2/map` | low/undocumented provider cost | PM treats uncertainty as a warning input rather than hiding it. |
| `batch_webfetch` | `/v2/batch/scrape` | 1 credit per URL | Same modifiers as `webfetch`; legacy `batch_scrape` normalizes to `batch_webfetch`. |

Batch credit awareness is mandatory before dispatch: Firecrawl `batch_webfetch` estimates `per_url_credit_estimate` and computes `url_count × per_url_credit_estimate`; this estimate is recorded as `estimated_credit_cost` where available and feeds the >100 credits warning threshold before large URL batches execute.

Firecrawl-native `/v2/batch/scrape` options preserve `ignoreInvalidURLs` for skipping invalid URLs without failing the whole batch and `maxConcurrency` for provider-side parallelism limits.

Firecrawl `/v2/agent` delegation uses the same `estimated_credit_cost` confirmation rule before delegating autonomous `webresearch`; the 20-2500 credit range is treated as a warning input, not as silent background spend.

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

Firecrawl's `/interact` endpoint provides a STATEFUL multi-turn browser session, distinct from the one-shot `actions` parameter on `/scrape`. Firecrawl supports that session through `/v2/scrape/{scrapeId}/interact`.

Session flow:
1. `POST /v2/scrape { url }` returns a `scrapeId` in metadata.
2. `POST /v2/scrape/{scrapeId}/interact { prompt | code }` resumes the same browser session.
3. Multiple interact calls reuse session state including DOM, cookies, and scroll position.
4. `DELETE /v2/scrape/{scrapeId}/interact` terminates the session and releases provider resources.

Interaction modes and session properties:
- prompt-based interaction is natural-language driven and maps well to PM's higher-level action intent.
- Firecrawl prompt-based mode is an ALTERNATIVE execution strategy to PM's action-by-action approach: PM may send one composite prompt describing all intended actions, and Firecrawl handles navigation autonomously inside the provider session.
- code-based interaction is an adapter-internal precision path shaped as `code: string, codeOptions: { language: "nodejs" | "python" | "bash" }`; it costs 2 credits/min where the provider reports that rate, and PM does not expose raw provider code execution as a first-class user tool surface.
- Simple read-only, click, or type sequences may use prompt-based mode; custom `wait_for` timeouts, precise-coordinate interactions, and dynamic DOM-dependent actions route to code-based mode.
- If Firecrawl interact returns a timeout, PM retries once; if the retry still fails, PM returns partial content with a warning rather than a success-shaped full read.
- sessions default to a 10-minute TTL with a 5-minute inactivity timeout.
- responses may include `liveViewUrl` and `interactiveLiveViewUrl`.
- PM does not surface those URLs as first-class MVP UI because PM owns the browser surface directly.
- When Firecrawl is the selected provider for `webfetch` or `webextract` with actions, PM uses the Firecrawl interact session model above instead of a one-shot `actions` parameter, so browser state, scroll, cookies, and provider cleanup remain explicit.
- In that selected-provider action path, PM starts scrape to obtain `scrapeId`, translates each PM `WebAction` into the chosen interact `prompt` or `code` mode, captures final page state into the owning `webfetch` or `webextract` result after all actions, and then performs `DELETE /v2/scrape/{scrapeId}/interact` cleanup.
- Persistent profiles are not an MVP feature for this interact surface. If a future profile bridge is added, the provider payload shape is `profile: { name: string, saveChanges: boolean }`, `saveChanges` controls whether cookies and localStorage persist after the session, and legacy `/localStorage` slash notation is retained only as lineage for the canonical `localStorage` field name.

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
- Permission canon must preserve the four-tier approval ladder, question default allow only when HITL is available, keep the six web tools independently visible and ask-gated in plan presets, allow strict read_only/no-network presets to deny them, and carry the blocked/unavailable payload fields through to permission-card consumers.
- Firecrawl-specific HTTP and provider errors must map to PM canonical error codes exactly as specified.
- Firecrawl `success: false` with an otherwise unmapped provider error maps to the closest PM canonical error code and preserves the original provider detail in `error_message`.
- Legacy Firecrawl/browser `stealth` configuration is retired for PM web tools. `stealth` is not exposed as a PM tool input, not stored as provider routing policy, and not accepted as canonical Firecrawl configuration; adapter-internal provider behavior may surface only through capability disclosure or structured warnings.
- Firecrawl scrape traceability is recorded as `firecrawl_scrape_id?: string` from response `data.metadata.scrapeId`; legacy `scrape_id` is retired as an incorrect canonical field name and may appear only as transfer lineage for the corrected JSON path.
- Firecrawl usage/cache traceability is recorded with exact provider lineage: `firecrawl_credits_used?: number` comes from response `creditsUsed`, and `firecrawl_cache_state?: "hit" | "miss"` comes from response `metadata.cacheState`.

Fields:
- firecrawl_credits_used
- firecrawl_cache_state
- firecrawl_scrape_id
- firecrawl_scrape_id?: string
- data.metadata.scrapeId
- scrape_id (retired alias)
- requested_adapter_id
- effective_adapter_id
- adapter_selection_reason
- execution_path
- provider_search_native
- pm_search_plus_site_reader
- pm_site_reader
- provider_firecrawl_scrape
- pm_fetch_fallback
- provider_firecrawl_agent
- pm_research_composed
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
- Firecrawl crawl timeout or provider crawl timeout → `crawl_timeout`
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
  - `autonomous_budget_exceeded` means autonomous research hit an iteration/time/credit cap without a satisfactory result. This is a soft error: the tool still returns partial results collected before the budget was hit, with the error code present alongside partial `answer_summary`, `sources_used_count`, and `research_steps`; agents may use the partial results or retry with a larger budget.
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
- GUI/help canon must preserve row-level health/error disclosure, last-failure messaging, inline contextual help, and availability/support-tier visibility in Settings and /web help/autocomplete. Help appears inline as a tooltip or below-field text, not as a separate help page; Settings UI, `/web` help, and autocomplete show both provider availability and support tier per provider × operation as a capability matrix or per-provider badge rows.
- Retire stale cited-search ownership residue from reference sections; provider-capability and web-routing canon is owned by Plans/Tools.md sections 11-12, while Plans/newtools.md#8.2.1 is non-normative consumer guidance only.
- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default lower-priority position below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale cited-search framing and older `newtools` wording" from owner/provider canon.
- Firecrawl gap coverage is MVP scope across high/medium/lower source findings; lower-priority provider placement controls default ordering only and remains user-changeable.
- Support-tier stored canon uses `pm_composed` for PM-assembled behavior; `pm-composed` is only a display/source-lineage alias and must normalize to `pm_composed`.
- Exa websearch behavior preserves the free-plan fallback contract: Exa's free tier works without an API key, a user API key overcomes rate-limit ceilings, default `numResults=8`, and a free-plan rate-limit falls back gracefully to the next provider rather than hard-failing the web operation.
- Provider fallback on rate-limit is LOCKED: fall to the next provider and do NOT stop the operation solely because one provider exhausted a rate-limit budget.
- Exa rate-limit fallback is user-visible: when Exa is rate-limited and PM falls back to DuckDuckGo or another eligible provider, the chat activity label includes a user-readable path to resolution, for example adding an Exa API key in Settings > Providers, and the audit log records the same explanation in `provider_fallback_summary`. This guidance appears in both the chat activity label AND the audit log via `provider_fallback_summary`.
- Provider fallback on rate-limit or outage falls to the next eligible provider in priority order that supports the SAME operation; PM does NOT stop solely because one provider hit a rate-limit or outage. The fallback path is shown in BOTH the chat activity label and the audit log through `provider_fallback_summary`.
- DuckDuckGo is a best-effort/no-key fallback provider, not a canonical gold-standard backend. DuckDuckGo does not offer an official full organic web-search API suitable for PM's general search-provider contract; official/public DDG developer surfaces are instant-answer style responses, not full organic web search. PM treats DuckDuckGo `websearch` as native-ish because practical integrations are wrapper or scraping-based rather than official full-search APIs; the concrete source-read exemplar `Nipurn123/duckduckgo-mcp` fetches `https://html.duckduckgo.com/html/?q=`, parses result HTML via `cheerio`, crawls result pages directly and strips script/nav/etc (`/nav/etc` lineage), and remains an HTML scraping adapter, not an official DDG API integration. Such adapters may expose `search`, `search_and_crawl`, and `research`, but remain degraded for JavaScript-heavy SPAs and must stay provider-pluggable rather than becoming a strategic (`/strategic`) long-term search-provider foundation.
- Google official search still supports JSON web search results through Google Programmable Search / Custom Search JSON API, but PM must not hard-depend on it while that official path is not available to new customers, is scheduled for discontinuation on `2027-01-01`, and carries the recorded pricing shape of 100 free queries/day, then `$5 per 1,000` queries, up to `10,000/day`. A `Google` provider row therefore means a pluggable, optional configured Google-compatible third-party SERP adapter unless the official path becomes viable again.
- `Searching Web` uses a provider-pluggable (`provider-pluggable`) search layer. The Exa primary/default high-quality provider posture applies unless the user changes provider priority, and the Google optional provider slot remains available for configured Google-compatible search unless the official path becomes viable. Provider-settings GUI controls expose enabled/disabled state, provider priority / fallback order, per-provider credentials, health/error state, and last-failure messaging. Exa's free-plan / free-tier behavior may run without a user key but must fall back cleanly on rate-limit. DuckDuckGo is enabled as a best-effort `/no-key` fallback by default, and provider /fallbacks on rate-limit, outage (`/outage/provider-specific`), or provider-specific failure are logged with /sources and citations so the user can see which provider supplied the evidence.
- User-facing web activity rows preserve `Searching Web: <query>` and `Reading Site: <url>`; if provider fallback occurs, label/audit examples may render `Searching Web: <query> (switched from Exa to DuckDuckGo after rate limit)`. GUI copy may label the provider slot `Google`, but implementation docs must not over-promise official Google dependence when a third-party `/search-provider` adapter supplies that slot.
- Provider settings group provider classes as `account-backed | API-backed | no-key` while preserving provider-specific rows and capability disclosure.
- Model-native Anthropic/OpenAI web-search availability derives from provider auth state, current-account selection, selected/effective model support, provider health, and `/configuration/availability`; PM must not expose a separate web-search-specific API key field when the provider account is already configured.
- Search provider settings preserve `/Tavily/Google-compatible`, /Exa/DDG/Google-provider, and /Exa/DDG/Google-compatible lineage plus provider-order controls: Exa, Tavily, Google, DuckDuckGo/DDG, Firecrawl, and other provider rows keep enabled state, credential/config fields, health/error state, support-tier badges, and user-adjustable fallback order without requiring per-operation overrides for MVP. The web stack must not regress to a /Tavily-only model, and /rate-limits remain provider-specific routing/fallback reasons instead of global hard stops.
- OpenCode compatibility references such as `emilsvennesson/opencode-websearch` and `/opencode-websearch` are adapter examples only: provider conventions like `web_search`, `websearch: "auto"`, `websearch: "always"`, provider `Sources` output, and terminal-first IDE integration may inform model-native/native-provider mapping, but PM canonical tool keys, labels, read-path behavior, and source blocks remain `websearch`, `Searching Web`, `Reading Site`, and PM-owned citations.
- Tavily is an optional premium/official provider when the user supplies an API key. Settings expose only the enable/disable toggle, API key field, and provider priority ordering at top level; Tavily advanced provider options stay behind an expandable Advanced section. The Advanced section owns default `search_depth`, max results (`max_results`), optional domain filters (`include_domains`, `exclude_domains`), news/time-range preferences (`time_range` / `/time-range`), `topic`, `include_images`, conservative `include_raw_content`, and `chunks_per_source`. When Tavily is enabled for `Searching Web`, PM keeps `include_raw_content` conservative by default, defaults `include_raw_content` to `false` for search-result discovery, returns candidate URLs/snippets first, sends chosen URLs into `Reading Site`, and reserves `advanced`, raw content, and extract-heavy modes for higher precision or when the simpler pass fails.
- Tavily provider-plan economics and option lineage preserve the source-captured API-key shape: free tier = 1,000 credits/month and $0.008/credit PAYG, with `search_depth` values `ultra-fast/fast/basic/advanced`, `max_results`, include/exclude domains, `time_range`, `topic`, `include_images`, `include_raw_content`, and `chunks_per_source`. Tavily best practice remains two-step search-then-extract; Tavily extract must NOT replace native Site Reader because provider-side enrichment and PM-native structured reading are distinct roles. A future Tavily extract layer may be ADDITIVE second-pass enrichment for structured metadata alongside Site Reader, but it is not MVP.
- Capability-tier (`capability-tier`) entries record direct support separately from routing posture. `OpenAI` has native/model search with extract/research/crawl/map composed by PM where the PM-native web layer exists, including site-map extraction when PM owns the traversal path. Exa extract is native `/near-native` through known-URL retrieval, research may be provider-native (`/provider-native`) through deep-search or `/deep-research`, crawl is native, and map remains unsupported unless PM composes it. Tavily is native for search, extract, research, crawl, and map. DuckDuckGo keeps native-ish search, native-ish or PM-composed research, partial crawl via `search_and_crawl`, PM-composed extract, and unsupported map unless PM supplies native map. Google-compatible providers are provider-native for search and PM-composed for extract/research/crawl/map when PM has the required URL reading and traversal primitives.
- Source/category capability disclosure is explicit: Firecrawl is native for web/news/images sources and github/research/pdf categories; Exa is native for web while news/images/code/academic are pm-composed or unsupported; Tavily is native for web plus news via `topic: "news"` and otherwise pm-composed where PM composes; DDG is native-ish for web only; Anthropic/OpenAI are model-native for web only.

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
- Firecrawl webfetch capability is not erased by Site Reader primacy
- Tavily webfetch capability is not erased by Site Reader primacy
- Exa webfetch capability is not erased by Site Reader primacy
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

Support tiers are canonical capability labels:
- `native` - provider exposes the operation as a first-class path that PM can map directly.
- `native (model)` - the selected model/provider already exposes the capability and PM reuses the same account/auth surface.
- `native-ish` / `near-native` - provider has a near-native or near-equivalent path but PM still normalizes or supplements it.
- `pm_composed` - PM can synthesize or assemble the operation from lower-level primitives such as provider search, provider fetch, PM-native Site Reader, crawl, or map traversal.
- `pm-composed` - display/source-lineage alias for `pm_composed`; stored support-tier canon normalizes to `pm_composed`.
- `fallback-only` - provider path exists only as backup and is not the preferred posture.
- `partial` - provider supports only a reduced subset of the operation family.
- `unsupported` - no supported path exists in MVP.

Capability tier and routing posture are separate dimensions. Site Reader primacy for `webfetch` is a routing rule, not a capability erasure.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/assistant-chat-design.md

### 11.3 Capability matrix

| Operation | Exa | Tavily | Firecrawl | Anthropic / OpenAI | Google | DuckDuckGo |
|---|---|---|---|---|---|---|
| `websearch` | `native` | `native` | `native` | `native (model)` | `native` | `native-ish` |
| `webfetch` | `native-ish` | `native-ish` | `native-ish` | `fallback-only` | `pm_composed` | `pm_composed` |
| `webextract` | `native-ish` | `native` | `native` | `pm_composed` | `pm_composed` | `pm_composed` |
| `webresearch` | `native-ish` | `native` | `native` | `pm_composed` | `pm_composed` | `native-ish / pm_composed` |
| `webcrawl` | `native` | `native` | `native` | `pm_composed` if PM native crawler exists | `pm_composed` if PM native crawler exists | `partial native-ish / pm_composed` |
| `webmap` | `unsupported` unless PM composes it | `native` | `native` | `pm_composed` if PM native map exists | `pm_composed` if PM native map exists | `unsupported` unless PM supplies native map |

Matrix interpretation:
- Firecrawl `webfetch` capability is not erased by Site Reader primacy.
- Tavily `webfetch` capability is not erased by Site Reader primacy.
- Exa `webfetch` capability is not erased by Site Reader primacy.
- Anthropic/OpenAI `websearch` support is `native (model)` / model-native, not `pm-composed`.
- Anthropic/OpenAI model-native research beyond search is /PM-orchestrated; Exa extract may be yes-ish through known-URL content retrieval while PM preserves the native Site Reader distinction.
- OpenAI/Anthropic crawl and map are `pm_composed` only when PM's native crawler or native map traversal exists; otherwise the operation follows the capability-unavailable terminal branch.
- Exa research may be provider-native through deep-search or `/deep-research`; Exa map remains unsupported unless PM composes it.
- DuckDuckGo `websearch` is `native-ish`; DuckDuckGo `webresearch` may be native-ish through provider composition or `pm_composed`; DuckDuckGo `webfetch` / `webextract` remain PM-composed rather than flattened to `unsupported`; DDG `/extract/research` is therefore PM-composed, while DuckDuckGo crawl preserves partial native-ish `search_and_crawl` behavior or PM-composed traversal.
- the display label is `Google`; it is a pluggable adapter slot, not a strategic backend requirement, and Google extract/research/crawl/map remain `pm_composed` when PM has the required URL reading, synthesis, crawl, or map primitives.
- `fallback-only` is reserved for true backup-only paths and must not replace real fetch capability where the provider has a real fetch path.
- model-native rows reuse the already-selected model account/auth when that provider exposes search or browse capability; PM does not create a second auth silo for the same model account.
- Anthropic/OpenAI model-native web-search rows reuse PM's provider-account/auth model. When an Anthropic or OpenAI provider account is already configured, PM does not expose a separate web-search API key field; Settings show the provider name, enabled toggle, capability badges, effective account label, effective model, auth state, and rate-limit summary for that model-native capability.
- `web_search` with underscore is a provider convention for model-native/provider-native APIs, not a PM-specific collision-avoidance decision; the PM tool key remains `websearch`.

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
- `search_provider` override is NOT exposed as a tool parameter; provider selection is handled by the capability-based routing algorithm and configured provider stack.
- Adapter-agnostic routing follows the ordered sequence: Step 1: NORMALIZE OPERATION - normalize the requested operation/input; resolve the canonical runtime snapshot; resolve permission for the canonical web tool key; Step 5: QUERY CAPABILITY MATRIX by querying the provider capability registry / adapter contract; filter eligible adapters by runtime identity constraints, support tier, execution role, account/auth viability, and freshness/health constraints; choose the effective adapter through the shared runtime/provider resolver; fallback only to the next eligible adapter for the same operation; and persist both canonical runtime snapshot + web-operation payload.
- If provider execution fails, PM tries the next eligible same-operation adapter, records `provider_fallback_occurred` and `provider_fallback_summary`, and repeats until success or the eligible set is exhausted. If all providers fail, the operation returns `adapter_unavailable` with a summary of failures rather than a success-shaped fallback.
- The web routing recovery-plan is MVP: when no configured provider supports the requested operation, the capability-unavailable terminal branch includes clear setup guidance, provider configuration pointers, and the reason the selected route cannot proceed.
- Web activity labels are routing-aware. The canonical set is `Searching Web: <query>`, `Fetching Site: <url> (via <provider>)`, `Reading Site: <url>`, `Extracting Site: <url>`, `Researching Web: <task>`, `Crawling Site: <url>`, and `Mapping Site: <url>`; internal payloads may still store `root_url` and normalized task summaries for crawl/map/research.
- Chat-transparency requires each activity row to expose whether evidence came from search, provider/API extraction, PM-native Site Reader, research synthesis, crawl, or map; source blocks and audit rows remain source-linked and cite the actual read path. The final sources-block deduplicates repeated URLs and /mapped page sets while retaining the strongest provenance badge per source, ordered strongest to weakest as `site_reader` / `site reader`, `site_extract` / `site extract`, `research_synthesis` / `research synthesis`, `crawl_result` / `crawl result`, `map_result` / `map result`, then `search_snippet` / `search snippet`. When no deeper read or extract occurred, search-snippet citations are allowed only when visibly labeled as snippet-level provenance.
- `Reading Site: <url>` is reserved EXCLUSIVELY for the PM-native Site Reader path; provider-routed or provider-delegated fetch uses `Fetching Site: <url> (via <provider>)`.
- When PM-native Site Reader uses browser interaction, the activity label remains `Reading Site: <url>` and displays `(with browser interaction)` only as a sub-annotation; activity detail carries `interaction: true` metadata instead of adding a seventh web activity label.
- Cited web search (`cited-web-search`, legacy `cited-search`) is an explicit PM web workflow: show `Web search: <query>` or `Searching Web: <query>`, perform `websearch`, choose candidate sources, call `webfetch` (`/webfetch`) / `Reading Site` or Site Reader before final claims, and answer with `/citations` / sources from the actual read path. Provider-specific helper names and adapter parameters do not become PM-owned tool names.
- Provider fallback treats `/rate-limit/outage`, `/unconfigured`, and provider-specific failure as visible routing reasons, not silent product behavior; the `/product` copy and audit record disclose the effective provider, fallback reason, and setup guidance before presenting a successful answer.
- Web operation completion formats the result according to the tool output contract, computes a `change_tracking` diff when applicable, stores in cache when `cache_policy.store` is true, and records audit events with all routing metadata.
- Terminal/tool research lineage for this routing family includes validated inputs `topic-01`, `topic-02`, `topic-03`, `topic-07`, `topic-08`, `topic-09`, `topic-10`, `topic-11`, `topic-13`, `topic-18`, `topic-19`, `topic-21`, `topic-24`, `topic-26`, `topic-28`, `topic-29`, `topic-34`, `topic-35`, `topic-38`, `topic-43`, and `topic-45`, plus competitor baselines `competitor-cursor`, `competitor-kiro`, `competitor-vscode`, and `competitor-jetbrains`.
- Source-specific research may be delegated to read-only sub-agents for `/code/issue/community` sources, but the main coordinator owns ledger updates and anonymized synthesis; sub-agents must not perform concurrent ledger writes.

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
- Searching Web: <query>
- Fetching Site: <url> (via <provider>)
- Extracting Site: <url>
- Researching Web: <task summary>
- Crawling Site: <root_url>
- Mapping Site: <root_url>
- root_url
- cache_policy
- change_tracking
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

Compatibility/source-lineage disposition: this extract preserves web routing source tokens for operation names, provider labels, payload keys, display labels, and routing rules. Treat each token by typed role through the Tools Core rules and referenced storage/contracts/browser owners; do not read the `Fields:` list as one standalone schema.
## 13. Batch operations

This section defines the canonical contract for this surface.

Core rules:
- Batch semantics must preserve the explicit false branch for continue_on_error.
- Batch audit/event canon must preserve a parent audit event for the batch plus child audit events per URL.
- Batch approval and timeout behavior already restored in section 13 must survive unchanged.
- Batch webfetch canon includes exact batch inputs, concurrency limits, shared-host permission flow, and the locked batch timeout formula.
- Each batch per-URL result carries `provenance_badge` and `execution_path` because individual URLs may route differently. It also carries `summary`, `links`, `images`, and `pdf_artifact` when the corresponding formats are requested; `action_results` stays excluded because actions are per-page interactive and batch operations are for bulk static content.

Fields:
- continue_on_error: false
- stop on the first failure
- return completed results plus failure detail
- parent audit event for the batch
- child audit events per URL
- tool.invoked
- continue_on_error
- `cache_policy?: object`
- `change_tracking?: boolean`
- `schema_mode?: string`
- `detail_hint?: string`

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
- mixed-host URL batches use that single confirmation prompt and show every unique domain in the batch; PM does not issue per-host prompts.
- For Session grants all listed domains for that session

Rules:
- one approval prompt covers the full batch and lists all unique domains in scope
- mixed-host, per-domain, and per-host permission wording resolves to the same single-prompt rule; no per-host separate prompts are created.
- For Session grants the listed domains for that session
- individual_timeout × min(url_count, 5)
- 600s
- `urls: string[]` (required; min 1, max 50)
- `formats?: string[]` (same as single `webfetch`; applied to ALL URLs)
- batch webfetch accepts `cache_policy?: object`, `change_tracking?: boolean`, and `pdf_mode?: string`; each uses the same semantics as single-URL webfetch and is applied to ALL URLs in the batch.
- batch webextract accepts `urls: string[]` (required; min 1, max 10), `prompt?: string`, and `schema?: object`; prompt and schema use the same shape as single-URL extraction and are applied to ALL URLs in the batch.
- batch webextract accepts `schema_mode?: string` / `schema_mode` and `detail_hint?: string` / `detail_hint`; each uses the same semantics as single-URL webextract.
- `concurrency?: number` (default 3; max 10)
- batch webfetch maxes at 50 URLs with `concurrency?: number` default 3 and max 10; batch webextract maxes at 10 URLs.
- batch webextract `concurrency?: number` defaults to 3 and maxes at 10; older max 5 wording is stale source-lineage only.
- `continue_on_error?: boolean` (default true)
- With `continue_on_error?: boolean` default true, a batch succeeds if at least one URL succeeds; setting `continue_on_error: false` stops on the first failure and returns completed results plus failure detail.
- "For Session" grants all listed domains for that session
- Batch-level timeout is LOCKED as `individual_timeout × min(url_count, 5)`, cap 600s (10 min)

Compatibility/source-lineage disposition: this extract preserves batch payload fields, permission fragments, labels, and routing rules. `continue_on_error: false`, `stop on the first failure`, and completion/failure detail stay exact source tokens while canonical typing follows the batch Core rules.
## 14. Web content caching layer

This section defines the canonical contract for this surface.

ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/storage-plan.md#8. Web content caching persistence

Core rules:
- The PM-owned web cache contract must preserve two-phase lookup, state vocabulary, and per-project cache sizing.
- Two-phase cache-check is locked: before provider selection, PM checks `(url, formats_hash)` only as an adapter-agnostic lookup; after provider selection, PM validates `adapter_id`, discards a mismatched hit, and fetches fresh.
- Cache routing must skip read-time cache for requests with actions, may still store the post-action result, and must preserve PM-cache precedence over Firecrawl cache with diff-reuse audit states.
- Web content caching is per-project with a 500 MB default cache budget, per-operation TTL defaults, LRU eviction for bounded storage, stable cache key ordering, and change detection persistence for later `change_tracking` comparison.
- When `change_tracking: true` and a cached entry exists, even if expired, PM fetches fresh content, compares `content_hash` against the cached entry, returns `change_status: "changed"` with `diff_summary` when content differs, returns `change_status: "same"` and may extend TTL when content matches, and returns `change_status: "removed"` when the previous URL entry existed but the fresh fetch resolves to 404.

Fields:
- hit
- miss
- bypassed
- expired_used_for_diff
- normalized_url
- formats_hash
- adapter_id
- 500 MB
- TTL
- LRU
- per-project
- per-operation
- cache key ordering
- change detection persistence

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
- Question/questionnaire session state persistence and TODO schema persistence are storage-owned carry-through requirements that web cache and activity payloads must not overwrite.

Compatibility/source-lineage disposition: this extract preserves cache state values, provider labels, and storage carry-through rules as source tokens. Cache persistence and activity payload typing remain storage-owned while Tools owns cache-routing behavior.
## Canonical owner and consumer reconciliation

Tools are defined SSOT in this document. Consumers in other surfaces (UI, CLI, Help, Permissions) reference this document rather than restating tool definitions.

Tools is the single-owner SSOT for tool-level web operation behavior, provider capability tiers, Firecrawl routing, and cache-routing / cache routing decisions. `Plans/storage-plan.md` owns cache persistence and activity payload storage; `Plans/CLI_Bridged_Providers.md`, `Plans/Provider_OpenCode.md`, `Plans/newtools.md`, and OpenCode audit surfaces remain consumer or provider-adjacent references rather than competing tool owners.

OpenCode billing and /caching evidence confirms that extra abstraction layers make tracking HARDER, not easier; Tools therefore owns explicit tool-level cache-routing and provider-capability decisions while usage, storage, prompt-cache, and provider bridge owners keep their narrower accounting and persistence contracts.

- Firecrawl/web operations in `Plans/Tools.md` span `### 3.5C`, `### 3.5D`, `## 10`, `### 10.3`, `### 10.7`, `### 11.1`, and `## 14`. This document owns Firecrawl integration, TODO contract carry-through, provider placement, cache, audit/error mapping, and the traceability obligations `obl-013`, `obl-014`, `obl-041`, `obl-053`, `obl-054`, `obl-062`, `obl-066`, `obl-067`, `obl-029`, `obl-040`, `obl-043`, and `obl-068`.
- Stale permission, LSP, and web-output carry-through markers such as `/LSP/web-output`, `/web-output/LSP/permission`, and legacy `web-output` phrasing are retired as owner text; live tool canon points to the dedicated Contracts and storage owners for WebAction, common web output fields, and blocked-action payloads.

### Consumer propagation

#### Acceptance carry-through
- Expand blocked_notice beyond blocked_family and allowed_action_ids[]
- Carry escalation_level, action_available ownership, and usage observability through blocked surfaces
- Under `## Canonical owner and consumer reconciliation` -> `### Consumer propagation`, blocked surfaces must not stop at `blocked_family` plus `allowed_action_ids[]`.
- Consumer propagation must carry `escalation_level`, `action_available` ownership, and usage observability through blocked_notice handling.
- If `allowed_action_ids[]` remains in this subsection, it must be explicitly subordinate to the richer blocked_notice contract rather than the complete surface definition.

### Required data shape

#### Acceptance carry-through
- Share one attribution family across tool events, runtime artifacts, receipts, and usage records
- Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Carry usage switch-history and usage execution-role follow-through
- Under `## Canonical owner and consumer reconciliation` -> `### Required data shape`, define one attribution family shared across tool events, runtime artifacts, receipts, and usage records.
- Carry run/attempt/thread/node/artifact/provider/usage anchors together with execution/runtime identity fields in the tool record shape.
- Transfer `execution_role`, `requested_account_id`, `operational_identity`, account-switch ownership, pressure ownership, `blocked_sequence` minting, startup recovery handshake, and DAE jail/approval policy into the owner/consumer contract.
- Require usage switch-history and usage execution-role follow-through in the same reconciled owner data shape.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Tools.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### T-002 - Tools Document Authority And Owner Boundary

```yaml
plan_unit_id: T-002
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Plans/Tools.md is the canonical owner for built-in tools, custom tools, MCP registry and policy integration,
  permission-model context, provider routing, and thin runtime tool contracts; per-platform MCP config remains in Plans/newtools.md
  and AGENTS.md, while live MCP naming, authentication, and availability remain in Plans/MCP_Integration.md.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks:
- T-003
- T-004
- T-012
acceptance_criteria:
- Compliance, scope, SSOT references, and owner/consumer boundaries remain preserved.
- Tool/search contracts remain canonical here rather than a parallel chat-thread-only tool model.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0003
preserved_exact_tokens:
- Puppet Master
- built-in tools
- custom tools
- MCP
- allow/deny/ask
- '`question`'
- '`todowrite`'
- '`todoread`'
- '`web*`'
- '`skill`'
- '`task`'
- '`lsp`'
- '`/tool/search`'
negative_constraints:
- Do not use `tool.invoked.index_used` for fuzzy/path discovery; it remains only grep/Search sparse-n-gram disclosure.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host tool-context obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### T-166 - Host Capability Context For Tools Shells And Integration Commands

```yaml
plan_unit_id: T-166
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Tools, shells, and integration commands may consume containerized-host context through PM-owned host capability
  references and HostCapabilityCommand dispatch envelopes, but tool availability never grants host execution authority by
  itself. Tool calls, bounded shell-like actions, and service/database/API integration commands carry
  host_capability_ref, host_profile_id, host_assignment_id, execution_unit_context_ref, permission_snapshot_id,
  FileSafe scope, network_access_policy, secret_access_policy, destructive_command_policy, transcript policy,
  required receipt refs, cleanup expectations, and redaction profile where applicable. Provider tools receive host
  capability as context/capability input rather than direct provider authority, and all container exec or runtime
  operations remain mediated by Executor, Run Modes, Permissions, FileSafe, UI_Command_Catalog, and Runtime Artifacts
  receipt projection.
gui_related: false
gui_classification_reason: Tool capability context and dispatch policy are backend/tooling behavior, not user-visible visual presentation.
depends_on: [CV-303, CV-304, EP-109, RM-048, PS-126, F2-194]
unblocks: [MI-031, CBP-023, GRS-032, OSI-431]
acceptance_criteria:
  - Tools can reference host_capability_ref and host_profile_id without using backend runtime ids as PM identity.
  - Tool invocation events preserve permission_snapshot_id, host_preflight_receipt, host_execution_receipt, cleanup or blocker refs, and redaction policy where host resources are involved.
  - Provider tools, shells, and integration commands are denied or blocked with explicit blocker payloads when authority, FileSafe, secret, egress, or runtime gates fail.
  - Host-side commands such as lint, typecheck, format, git, package installs, static analysis, and browser tests stay host/worktree-side unless runtime services are required.
  - Container-runtime commands are used for service context, database/API/integration work, runtime-specific tests, logs, exec, and artifact capture only through PM-owned command and receipt paths.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future tool invocation and HostCapabilityCommand policy fixtures
risk_class: host_tool_authority_drift
reasoning_tier: high
context_scope: containerized_host_tool_context
implementation_surfaces:
  - Plans/Tools.md
  - future tool registry and shell/integration command dispatch
node_compile_hint:
  mode: host_capability_tool_context
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0023
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0081
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#execution_lane_matrix
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#control_plane_contract
source_atom_ids: [atom-0023, atom-0040, atom-0044, atom-0047, atom-0053, atom-0064, atom-0069, atom-0073, atom-0081]
preserved_exact_tokens:
  - "provider tools"
  - "shells"
  - "integration commands"
  - "host_capability_ref"
  - "host_profile_id"
  - "HostCapabilityCommand"
  - "tool invocation event"
  - "permission_snapshot_id"
  - "host_preflight_receipt"
  - "host_execution_receipt"
negative_constraints:
  - Do not let tool availability grant host execution authority.
  - Do not let container exec bypass Executor, Permissions, FileSafe, UI_Command_Catalog, Tools policy, or receipts.
  - Do not route every command through a container just because a host exists.
  - Do not expose raw secrets or unredacted provider, registry, SSH, or environment credentials through tool context.
owner_hints:
  - Plans/Tools.md
  - Plans/Executor_Protocol.md
  - Plans/Run_Modes.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into tool capability and provider-native tool requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### T-164 - Provider Native Tool Mediation And Capability Scope

```yaml
plan_unit_id: T-164
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Provider-native tool calls and hosted/client tool capabilities must be mediated through PM tool policy and permission custody. Tool availability is caller-scoped and must include provider_entry_id, account_profile_ref, model_id, capability_id, caller_scope, execution_role, enabled_on_instance, usable_now, blocked_reason, permission_snapshot_id, redaction_profile, and verification_state. Cursor client tools such as `providerIdentifier: client` / `toolName: pm_echo` are evidence for route-specific capability handling, not permission bypasses.
gui_related: false
gui_classification_reason: Tool policy/capability mediation contract rather than visual presentation.
depends_on: [CV-294, PS-119]
unblocks: []
acceptance_criteria:
  - Provider-native tools pass through PM permission/capability policy before use.
  - Tool availability is caller-scoped and does not infer usable_now from provider enablement alone.
  - Provider tool evidence does not store secrets or provider-native hidden state.
  - Tool result records can link to runtime artifacts without re-owning artifact schema.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_tool_permission_bypass
reasoning_tier: high
context_scope: provider_native_tools
implementation_surfaces: [Plans/Tools.md, Plans/Permissions_System.md, Plans/Contracts_V0.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: provider_native_tool_mediation, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0117
  - pldg-20260624-001-provider-updates:atom-0120
source_atom_ids: [atom-0117, atom-0120, atom-0121, atom-0131]
preserved_exact_tokens: ["provider-native tools", "providerIdentifier: client", "toolName: pm_echo", "enabled_on_instance", "usable_now", "blocked_reason", "caller_scope", "execution_role", "permission_snapshot_id"]
negative_constraints:
  - Do not bypass PM permission custody for provider-native tools.
  - Do not infer `usable_now` from provider enablement alone.
  - Do not store provider secret material in tool records.
owner_hints: [Plans/Tools.md, Plans/Permissions_System.md, Plans/Contracts_V0.md, Plans/Runtime_Artifacts_Panel.md]
```

### T-003 - Tool GUI Settings And Usage Visibility

```yaml
plan_unit_id: T-003
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The GUI exposes tool support through Settings > Advanced > MCP Configuration, Settings > Permissions, required
  MVP presets, built-in plus MCP-discovered permission rows, and Usage-page tool metrics from seglog rollups.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: false
depends_on:
- T-002
unblocks: []
acceptance_criteria:
- Settings bind to the same central registry config used by runs.
- Presets Read-only, Plan mode, and Full are implemented but optional to apply.
- Usage shows tool name, invocation count, latency p50/p95, and error rate.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_owner_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: gui_contract_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0004
preserved_exact_tokens:
- Settings > Advanced > MCP Configuration
- Settings > Permissions
- Read-only
- Plan mode
- Full
- Usage page
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-004 - Permission Summary Consumes Permissions SSOT

```yaml
plan_unit_id: T-004
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools summarizes permission actions, precedence, and persistence for registry context only; canonical permission
  semantics remain in Plans/Permissions_System.md.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-002
unblocks:
- T-006
- T-007
acceptance_criteria:
- '`allow`, `ask`, and `deny` meanings stay aligned with Permissions_System.'
- Precedence order and TOML/redb paths remain summary references, not duplicate ownership.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_policy_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0007
preserved_exact_tokens:
- 'ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules'
- allow
- deny
- ask
- Mode override > Session cache > Persona overrides > Project-level > Global-level > Defaults
- '`tool_permissions`'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-005 - Canonical Child Run Identity For Subagents

```yaml
plan_unit_id: T-005
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: A PM subagent is a child run with canonical identity fields and requested/effective Persona/runtime fields;
  provider-native subagent, child-session, or plain-run paths are adapter differences that do not change PM child-run canon.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-004
unblocks:
- T-015
acceptance_criteria:
- All child-run identity fields remain preserved.
- Disposable-by-default lifecycle is retained.
- Provider invocation kind stays additive adapter metadata.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_identity_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: child_run_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0008
preserved_exact_tokens:
- child_run_id
- parent_run_id
- thread_id
- batch_id?
- subgroup_id?
- attempt_id?
- requested/effective Persona
- effective provider invocation kind
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Models_System.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-006 - FileSafe And Embedded Review Guard

```yaml
plan_unit_id: T-006
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: FileSafe applies after tool permission and may still block an allowed tool invocation; embedded document review
  is not a hidden mutation channel.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-004
unblocks:
- T-007
acceptance_criteria:
- Permission answers whether the agent may call the tool; FileSafe answers whether the invocation may proceed.
- No direct `patch-apply` or `/suggested-change` mode is introduced for `embedded-document-pane` without a separate tool,
  permission, FileSafe, and audit contract.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hidden_mutation_channel
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: policy_guard_constraint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0009
preserved_exact_tokens:
- FileSafe
- '`embedded-document-pane`'
- '`patch-apply`'
- '`/suggested-change`'
negative_constraints:
- Embedded document review is not a hidden tool mutation channel.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-007 - Central Policy Engine And Result Taxonomy

```yaml
plan_unit_id: T-007
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Every agent-usable tool attempt passes through one canonical policy engine for identity, permission, approval/HITL,
  FileSafe, validation, terminal or shell binding, execution or rejection, and normalized result persistence.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-004
- T-006
unblocks:
- T-008
acceptance_criteria:
- Canonical order 1-7 remains preserved.
- Shell-backed execution binds to canonical terminal-session state when execution occurs.
- Denied or blocked shell calls do not mint fake live terminal sessions.
- Result taxonomy includes all required values.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: policy_order_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_policy_runtime_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0010
preserved_exact_tokens:
- allowed_succeeded
- allowed_runtime_error
- permission_denied
- user_declined
- headless_ask_denied
- filesafe_blocked
- validation_blocked
- cancelled
- timed_out
- post_scan_failure
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/CLI_Bridged_Providers.md'
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-008 - Tool Routing Audit Gap Carry-Through

```yaml
plan_unit_id: T-008
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool route activations are persistence-aware, audit records preserve unresolved exact_items gap lineage, blocked-packet
  consumers preserve runtime blocked terms, and recovery/validation/project-state consumers keep lineage explicit without
  reviving stale request shapes.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-007
unblocks: []
acceptance_criteria:
- Historical-run navigation may update stored `focused_run_id`; hover previews, comparisons, and pivots must not.
- gap-001, gap-002, gap-004, gap-005, gap-006, and broken-anchor lineage remain visible until owner docs close them.
- '`{ tool_name, invocation_summary, options }` is not revived as a canonical ask shape.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: audit_lineage_loss
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: audit_lineage_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0011
preserved_exact_tokens:
- exact_items
- gap-001
- gap-002
- gap-004
- gap-005
- gap-006
- blocked_notice
- blocked-episode
- Last updated
- /freshness
- /recovery
- '`allowed_action_ids` / `allowed_action_ids[]`'
negative_constraints:
- Do not revive `{ tool_name, invocation_summary, options }` as canonical ask shape.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Unresolved gap and broken-anchor names remain visible until owner docs close them.
owner_hints:
- Plans/Tools.md
```

### T-009 - Tool Side-Effect Identity And Governance Authority

```yaml
plan_unit_id: T-009
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool export, side-effect, GitHub/Source Control, and runtime-governance records carry operational identity,
  trust, multi-context repo scope, account re-resolution, blocked-governance, pre-dispatch interception, and shared attention/status
  payloads.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-007
unblocks: []
acceptance_criteria:
- Tool consumers do not assume one `/current` repo context.
- '`/tool`, `operational_identity`, and `trust_state_at_export` remain preserved.'
- Remote side-effect approval honors runtime governance before execution.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: side_effect_authority_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: side_effect_authority_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0011
preserved_exact_tokens:
- multi-repo
- multi-context
- DAE
- /restart
- re-resolution
- blocked_owner
- /governance
- pre-dispatch
- info
- warning
- attention_required
- blocked
- system_notification
negative_constraints:
- GitHub and Source Control tool consumers must not assume one `/current` repo context.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-010 - Tool Widgets Scope And Node-Native Evidence

```yaml
plan_unit_id: T-010
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool-facing widgets and command routing expose scope/identity mismatches, normalize command target variants
  through a shared target model, preserve blocked-sequence identity, and treat node-native evidence as authority while tier
  fields survive only as compatibility/grouping projections.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-007
unblocks: []
acceptance_criteria:
- Page-global, app-global, project-scoped, and `/run-centric` scope remain distinct.
- Missing `IDs` are structural.
- '`tier-native` and `tier-aligned` never remain execution authority.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_runtime_scope_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: gui_runtime_consumer_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0011
preserved_exact_tokens:
- cmd.*.open_*
- object_kind
- '`Executor_Protocol` / `Executor_Protocol.md`'
- '`/attempt/blocked-sequence`'
- '`node-native`'
- '`tier-native`'
- '`tier-aligned`'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Any `tier-native` or `tier-aligned` fields survive only as compatibility/grouping projections.
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-011 - Cross-Plan Tool Permission Reference Map

```yaml
plan_unit_id: T-011
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools keeps a consumer reference map to Permissions_System, FileSafe, FileManager, assistant-chat-design,
  orchestrator-subagent-integration, and interview-subagent-integration for permission, FileSafe, workspace, approval, and
  run-config alignment.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: false
depends_on:
- T-004
- T-006
- T-007
unblocks: []
acceptance_criteria:
- Each plan relation is preserved without re-owning adjacent docs.
- Permissions_System remains canonical for GUI and persistence permission behavior.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_reference_staleness
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: owner_reference_map
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0012
preserved_exact_tokens:
- Permissions_System.md
- FileSafe.md
- FileManager.md
- assistant-chat-design.md
- orchestrator-subagent-integration.md
- interview-subagent-integration.md
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-012 - Built-In Tool Registry Target Set

```yaml
plan_unit_id: T-012
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The central registry holds canonical built-in tool names, permission keys, limits, and provider-neutral semantics
  for shell, file, search, web, and question tools; provider/native mappings do not alter registry names or policy evaluation.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-002
- T-004
- T-007
unblocks:
- T-013
- T-016
acceptance_criteria:
- Each table tool and permission key remains preserved.
- OpenCode-compatible evidence is adapter context, not a PM owner override.
- Plan agents ask before `bash` by default unless policy grants it.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_registry_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_registry_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0013
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0014
preserved_exact_tokens:
- bash
- edit
- write
- read
- grep
- glob
- list
- patch
- multiedit
- webfetch
- websearch
- webextract
- webresearch
- webcrawl
- webmap
- question
- '`opencode` split-terminal behavior'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions:
- The grep stale snapshot/fallback note remains product canon for registry behavior until a later owner pass moves or supersedes
  it.
owner_hints:
- Plans/Tools.md
```

### T-013 - Debug-Capable Tool Classification

```yaml
plan_unit_id: T-013
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`debug_capable` is metadata on a tool or capability and classifies cross-surface debug families without creating
  new tool IDs or bypassing permission, artifact, visibility, or stale-runtime safeguards.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-012
unblocks: []
acceptance_criteria:
- Debug groups and usage tags remain preserved.
- Assistant Debug Mode is an entrypoint, not an ownership silo.
- Stale recoverable runtime identity enters `attention_required` with `session_reconnect_required`.
- No hidden evidence ingress or permission bypass is authorized.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_authorization_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_metadata_classification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0015
preserved_exact_tokens:
- debug_capable
- debug.target_discovery
- debug.browser_automation
- debug.logs_and_console
- debug.dap
- debug.agent_session_trace
- debug.bundle_export
- attention_required_reason_code = session_reconnect_required
negative_constraints:
- Classifying a tool as debug-capable does not authorize hidden evidence ingress or bypass the normal permission model.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/newtools.md'
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-014 - Edit Group And Ignore Pattern Semantics

```yaml
plan_unit_id: T-014
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`edit`, `write`, `patch`, and `multiedit` share the single `edit` permission, while grep/glob/list respect
  `.gitignore` by default with project `.ignore` explicit allow support.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-012
unblocks: []
acceptance_criteria:
- File mutation controls remain one permission knob.
- Ignore behavior preserves `.gitignore`, `.ignore`, and `!node_modules/` examples.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_fragmentation
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_permission_grouping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0016
preserved_exact_tokens:
- edit
- write
- patch
- multiedit
- .gitignore
- .ignore
- '!node_modules/'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-015 - Provider Platform Mapping Uses Canonical Names

```yaml
plan_unit_id: T-015
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Providers map PM canonical tool names to platform-native equivalents in platform_specs or runner code, while
  the registry and permission engine use canonical names only.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-012
unblocks: []
acceptance_criteria:
- Adding a provider does not require changing permission config.
- The `edit` to Claude "Edit" / Cursor edit tool example remains adapter context.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_mapping_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: provider_mapping_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0017
preserved_exact_tokens:
- canonical names only
- platform_specs
- '`edit` -> Claude "Edit"'
- Cursor edit tool
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-016 - LSP MVP Tool Operations And Compatibility Aliases

```yaml
plan_unit_id: T-016
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The `lsp` tool is MVP with nine read-only operations plus one approval-gated `rename`; `lsp_rename`, `definition`,
  `references`, and `implementation` are compatibility/source aliases normalized to canonical operations and parameter shapes.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-012
unblocks: []
acceptance_criteria:
- Operation inventory and parameter requirements remain preserved.
- '`rename` / `lsp_rename` requires `path` + `position` + `newName` and approval gating.'
- '`workspaceSymbol` requires `query`.'
- Status values remain `ok | partial | unavailable | error`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_alias_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0019
preserved_exact_tokens:
- 10 read-only + 1 write-gated (lsp_rename)
- nine read-only operations plus one approval-gated `rename`
- '`lsp_rename`'
- '`lsp.rename`'
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- rename
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- '`lsp_rename` is a legacy/source alias, not a second tool key.'
- '`definition`, `references`, and `implementation` are compatibility aliases.'
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-017 - Shared Built-In Tool Contract Envelope

```yaml
plan_unit_id: T-017
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Core tool-contract adapters default to sync semantics unless async handles are explicit, blocked/unavailable
  results include structured recovery action, previews use mini-card families, and concrete I/O/limit/error, unknown-tool,
  GUI permission/preset, and usage token linkage remains discoverable.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-007
- T-012
unblocks: []
acceptance_criteria:
- Sync default and explicit async-handle rule remain preserved.
- Blocked permission, FileSafe, or service cases include structured recovery action.
- Non-terminal previews expose source/result mini-cards and diff cards without treating preview as final mutation.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_preview_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: shared_tool_contract_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0020
preserved_exact_tokens:
- '`/tool-contract`'
- '`/service`'
- '`/diffs`'
- '`/presets`'
- '`/token`'
- '`/tokens`'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-018 - Bash Tool Runtime Contract

```yaml
plan_unit_id: T-018
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`bash` accepts command execution parameters, returns shell-bound sync/async results, emits structured errors,
  and applies default wait and hard timeout behavior without fabricating terminal state.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-007
- T-017
unblocks: []
acceptance_criteria:
- Parameters `command`, `mode`, `initial_wait`, `shellId`, and `detach` remain preserved.
- Output shapes for completed sync, still-running sync, and async launch remain preserved.
- All error codes and timeout behavior remain preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shell_binding_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0021
preserved_exact_tokens:
- sync
- async
- initial_wait
- shellId
- detach
- 30s
- 30m
- validation_error
- permission_denied
- filesafe_blocked
- shell_not_found
- spawn_failed
- output_limit_exceeded
- timeout
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-019 - Edit Tool Runtime Contract

```yaml
plan_unit_id: T-019
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`edit` performs atomic exact-string replacement inside allowed workspace roots, reports affected line spans
  and byte/line changes, and fails atomically for validation, permission, FileSafe, path, replacement, encoding, or timeout
  errors.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-014
- T-017
unblocks: []
acceptance_criteria:
- Parameters `path`, `old_str`, and `new_str` remain preserved.
- '`old_str` must be found exactly once.'
- Timeout returns `timed_out` without partial file rewrite.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: atomic_edit_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0022
preserved_exact_tokens:
- old_str
- new_str
- replace_miss
- replace_conflict
- encoding_error
- 10s
- line_count_changed
- bytes_changed
negative_constraints:
- On timeout, edit must fail atomically with no partial file rewrite.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-020 - Read View Tool Runtime Contract

```yaml
plan_unit_id: T-020
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Provider-native `view` maps to canonical `read`; it reads files or directories with optional inclusive 1-based
  ranges, preserves numbered text and structured line arrays, and returns structured errors/timeouts without fabricating missing
  lines.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, or
  visible rendering behavior.
split_recommended: true
depends_on:
- T-017
unblocks: []
acceptance_criteria:
- The `view` to `read` canonical mapping remains preserved.
- '`view_range` semantics, including `-1` to end of file, remain preserved.'
- File and directory result shapes stay distinct.
- Timeout does not fabricate missing lines.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: read_rendering_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0023
preserved_exact_tokens:
- '`view`'
- '`read`'
- '`view_range`'
- '`-1`'
- '`binary_unsupported`'
- '`too_large`'
- do not fabricate missing lines
negative_constraints:
- On timeout, do not fabricate missing lines.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-021 - Grep Tool Runtime Contract

```yaml
plan_unit_id: T-021
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`grep` accepts pattern, path, glob, output-mode, and flags inputs; returns one of the locked match result
  shapes; preserves all error codes; and times out with a structured `timed_out` response where `partial: true` is allowed
  only when verified.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-007
- T-017
unblocks: []
acceptance_criteria:
- '`content`, `files_with_matches`, and `count` output modes remain preserved.'
- The default timeout remains `30s`.
- All grep error codes remain preserved, including backend and result-limit failures.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: search_result_shape_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0024
preserved_exact_tokens:
- pattern
- glob
- output_mode
- line_numbers
- head_limit
- 'partial: true'
- content
- files_with_matches
- count
- 30s
- backend_unavailable
- result_limit_exceeded
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-022 - Glob Tool Runtime Contract

```yaml
plan_unit_id: T-022
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`glob` accepts a pattern and optional root path, returns deterministic normalized paths after ignore-rule
  filtering, and preserves validation, policy, FileSafe, path, and timeout errors.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-007
- T-017
unblocks: []
acceptance_criteria:
- '`paths: string[]` remains the successful result shape.'
- Returned paths remain normalized and deterministic after ignore-rule filtering.
- The recommended default timeout remains `10s`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: file_enumeration_nondeterminism
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0025
preserved_exact_tokens:
- '**/*.md'
- ignore-rule filtering
- 'paths: string[]'
- 10s
- validation_error
- permission_denied
- filesafe_blocked
- path_not_found
- timeout
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-023 - Create Write Tool Runtime Contract

```yaml
plan_unit_id: T-023
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Provider-native `create` maps to canonical `write`; it writes full file text under write-scope policy, reports
  created/overwritten state and byte/line counts, and fails atomically on timeout or write rejection.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-006
- T-007
- T-017
unblocks: []
acceptance_criteria:
- '`path`, `file_text`, `created: boolean`, `bytes_written`, and `line_count` remain preserved.'
- Timeout and rejected writes fail atomically.
- Overwrite policy remains explicit through `created` and `already_exists`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: write_atomicity_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_contract_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0026
preserved_exact_tokens:
- create
- write
- path
- file_text
- 'created: boolean'
- bytes_written
- line_count
- parent_missing
- already_exists
- io_error
- '{ status: "timed_out", path, error: { code: "timeout" } }'
negative_constraints:
- On timeout, the write must fail atomically.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-024 - Skill Runtime Registry Boundary

```yaml
plan_unit_id: T-024
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools exposes only `skill-runtime` metadata as a consumer pointer to Plans/Skills_System.md; richer runtime
  refs resolve through the shared tool-contract boundary rather than ad hoc skill-local schemas.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-006
- T-017
unblocks: []
acceptance_criteria:
- The structured skill envelope remains preserved.
- FileSafe-constrained resource access remains under the shared tool-contract boundary.
- Tools does not duplicate Skills_System ownership of richer skill runtime behavior.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: duplicate_skill_schema_ownership
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: skill_runtime_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0027
preserved_exact_tokens:
- skill-runtime
- Plans/Skills_System.md
- skill_id
- arguments?
- context?
- content
- source_type
- resource_base_dir?
- resource_entries_sample?
- metadata?
- ready_with_warnings
- Agent Config
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
- Plans/Skills_System.md
```

### T-025 - Question Tool Envelope And Compatibility Normalization

```yaml
plan_unit_id: T-025
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The question tool uses the locked multi-question envelope, canonical `QuestionItem` names and enums, object-array
  options, answer source metadata, and normalized answer arrays; legacy single-question and string-answer shorthands are compatibility-only.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-017
unblocks:
- T-026
- T-027
acceptance_criteria:
- '`mode?: "single_question" | "questionnaire"` remains preserved.'
- '`questions: Array<QuestionItem>` and `options?: Array<{id, label, description?}>` remain the canonical shapes.'
- 'Output statuses and `source?: "option" | "other" | "freeform"` remain preserved.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: legacy_question_shape_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: question_tool_contract_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0028
preserved_exact_tokens:
- 'mode?: "single_question" | "questionnaire"'
- 'questions: Array<QuestionItem>'
- 'options?: Array<{id, label, description?}>'
- 'source?: "option" | "other" | "freeform"'
- QuestionItem
- answer_text?
negative_constraints:
- '`prompt` is envelope/header-only compatibility text; it is not the per-question field name.'
preserved_contractrefs: []
compatibility_only_notes:
- '`string[]` options, `allow_other`, `allow_multi_select`, `text: string`, `answer: string`, `questions: [...]`, and `mode|header|prompt|questions[]`
  are compatibility shorthands normalized before storage or rendering.'
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
- Plans/storage-plan.md
```

### T-026 - Question Card Flow And Headless Outcome

```yaml
plan_unit_id: T-026
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Question-card behavior stays aligned across Assistant, Interviewer, document-builder, and visual-module flows;
  required items block completion until answered, dismiss pauses, `Other` remains freeform, headless returns unavailable,
  and subagent access is denied by default.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: false
depends_on:
- T-025
unblocks: []
acceptance_criteria:
- Required-by-default items keep the flow incomplete until answered.
- Dismiss-to-pause returns an explicit dismissed or paused status.
- Headless/HITL-unavailable returns unavailable with reason `headless` and no GUI-only recovery action.
- Subagent question tool access remains denied by default.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_headless_question_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: question_card_flow_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0028
preserved_exact_tokens:
- Other
- freeform
- default_values
- draft_value
- headless_unavailable
- 'status: "unavailable", reason: "headless"'
- Subagent question tool access is DENIED by default
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-027 - TODO Tool Schema Persistence And Access Policy

```yaml
plan_unit_id: T-027
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`todowrite` and `todoread` use the normalized TODO schema for Plan and Deep Plan, persist explicit revision
  states, emit `chat.plan_todo_updated`, and must not be blanket-denied in ask/plan mode unless stricter presets apply.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-007
- T-017
- T-025
unblocks:
- T-028
acceptance_criteria:
- TODO schema fields, statuses, and revision states remain preserved.
- Auto-use behavior and ask-mode approval prompts remain explicit.
- Deep Plan edits resync the normalized TODO projection before execution begins.
- '`todoread` remains non-mutating and must not survive as a `source_surface` mutation source.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: todo_state_duplication
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: todo_tool_contract_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0029
preserved_exact_tokens:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- pending
- in_progress
- completed
- blocked
- skipped
- superseded
- draft
- approved
- executing
- chat.plan_todo_updated
- todowrite
- todoread
negative_constraints:
- Ask/Plan presets must not carry inherited blanket-denies or a blanket-deny rule for `question`, `todowrite`, `todoread`,
  or the six web operation tools.
- '`todoread` must not survive as a `source_surface` mutation source.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3
  Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-028 - TODO Execution Tracker UI Boundary

```yaml
plan_unit_id: T-028
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: TODO remains the SSOT across single-agent, crew, and subagent runs; sticky-card and execution-tracker own
  the full TODO UI while inline-progress chat messages remain compact links, not a second TODO state model.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: false
depends_on:
- T-027
unblocks: []
acceptance_criteria:
- The full TODO list, status badges, focused item behavior, delegated owner display, and post-approval edit restrictions remain
  preserved.
- '`/revise` creates an explicit draft/revision instead of mutating approved history invisibly.'
- Inline-progress chat messages stay compact and link back to the sticky panel.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: todo_ui_competing_state
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: todo_ui_state_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0029
preserved_exact_tokens:
- sticky-panel-vs-inline-progress
- sticky-card / execution-tracker
- inline-progress
- /revise
- full TODO list
- status badges
- delegated owner display
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3
  Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-029 - Web Operation Ownership Dispatch And Adapter Routing

```yaml
plan_unit_id: T-029
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The web operation family is PM-owned above providers, dispatches each invocation to one canonical operation,
  validates before adapter routing, and rejects malformed or unsupported inputs with `invalid_input`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-007
- T-017
unblocks:
- T-030
- T-031
- T-032
- T-034
- T-038
acceptance_criteria:
- Operations `search`, `extract`, `research`, `crawl`, `map`, and `fetch`/`read` remain preserved.
- Support tiers remain routing metadata, not provider ownership replacement.
- Malformed or unsupported inputs return `invalid_input` or `unsupported_operation` before adapter dispatch.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_ownership_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_operation_dispatch_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- search
- extract
- research
- crawl
- map
- fetch
- read
- native
- PM-composed
- unavailable
- unsupported_operation
- invalid_input
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-030 - Web Permission And Support-Tier Visibility

```yaml
plan_unit_id: T-030
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Web permission and GUI/help consumers expose support tier, provider availability, URL/domain/query/task visibility,
  and wildcard versus host-scoped approvals instead of hiding fan-out behind generic `webfetch`.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: false
depends_on:
- T-007
- T-029
unblocks: []
acceptance_criteria:
- '`websearch` and `webresearch` use wildcard operation approvals because URLs are not known before discovery.'
- '`/extract/crawl/map` and `webfetch` use host/site-scoped approvals when targets are known.'
- GUI/help surfaces expose operation support tiers and activity labels.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_permission_opacity
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_permission_support_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- /web
- /help/autocomplete
- Settings
- Searching Web
- Reading Site
- Extracting Site
- Researching Web
- Crawling Site
- Mapping Site
- wildcard-only operation approvals
- host/site-scoped approvals
negative_constraints:
- Provider-doc `/classes`, provider-internal grouping, and provider row layout are not locked PM canon.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-031 - Web Input Shapes And Compatibility Aliases

```yaml
plan_unit_id: T-031
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Canonical web input shapes remain stable across adapters for `websearch`, `webfetch`, `webextract`, `webresearch`,
  `webcrawl`, and `webmap`, while source shorthand and legacy formats normalize before dispatch.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-029
unblocks:
- T-032
- T-035
- T-037
- T-041
acceptance_criteria:
- All listed operation parameters, defaults, source/category behavior, and unsupported-operation behavior remain preserved.
- Source shorthand and legacy formats normalize into typed fields before dispatch.
- Provider/API-side hints remain advisory unless a future provider contract reintroduces explicit mapping.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: adapter_shorthand_schema_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_input_contract_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
- limit?
- /news/images/code/academic
- /research/pdf
- /auto/ocr
- /API-side
- /html/rawHtml/screenshot/pdf/summary/links/images
- /PDF/summary
- 'formats?: string[]'
- /docs/*
- /api/**
- '!/internal/*'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- '`limit?`, source/category slash shorthand, `/auto/ocr`, `/API-side`, provider slash shorthand formats, `/PDF/summary`,
  and `formats?: string[]` are compatibility aliases normalized before dispatch.'
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-032 - Web Research Execution Recipes

```yaml
plan_unit_id: T-032
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webresearch` supports bounded autonomous and deterministic PM-composed recipes with optional seed URLs,
  capped search/read cycles, citations, and no page interaction in the non-autonomous branch.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-029
- T-031
unblocks:
- T-033
acceptance_criteria:
- '`starting_urls?: string[]` remains capped at five URLs.'
- Autonomous research remains bounded to at most three search iterations and a 120s total runtime unless narrower limits apply.
- The deterministic non-autonomous branch searches, reads/extracts, and synthesizes without page interaction.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unbounded_autonomous_browsing
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_research_runtime_recipe
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- 'starting_urls?: string[]'
- 'autonomous: true'
- max_sources
- 120s
- auto_read_cap
- Firecrawl `/v2/agent`
- Tavily
- 'Searching Web: <refined query>'
- 'Reading Site: <url>'
negative_constraints:
- 'When `autonomous: false` or omitted on `webresearch`, the agent does NOT navigate or interact with pages.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-033 - Agent Web Activity And Audit Evidence Surface

```yaml
plan_unit_id: T-033
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Agent-web-research is shared by Assistant, Interview, Orchestrator, requirements-doc-builder, and doc-builder
  surfaces; activity cards and audit trails expose search plus `/fetch/read` steps and browser-interaction sub-annotations
  when needed.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: true
depends_on:
- T-030
- T-032
unblocks: []
acceptance_criteria:
- Activity labels and audit-trail visibility remain preserved.
- '`Reading Site: <url> (with browser interaction)` remains explicit when browser interaction is involved.'
- Web operation child payload refs remain visible through `tool.invoked` and `tool.denied`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_evidence_hidden
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_activity_audit_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- /brittle
- /fetch/read
- tool.invoked
- tool.denied
- payload.meta
- warnings_count
- error_code
- 'Reading Site: <url> (with browser interaction)'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Research-session action subset remains bounded to web-operation evidence access, not a full visible browser-session product
  surface.
owner_hints:
- Plans/Tools.md
```

### T-034 - WebAction Browser Action And Safety Contract

```yaml
plan_unit_id: T-034
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: WebAction and browser testing use named action IDs, exact aliases, sequential execution, timing caps, explicit
  safety layers, and degraded-capability reason codes rather than arbitrary browser-code execution.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: true
depends_on:
- T-029
- T-030
unblocks: []
acceptance_criteria:
- Action enum, aliases, everyday/advanced IDs, 5000ms default, 30000ms max, and 30s total cap remain preserved.
- Action execution remains sequential in array order.
- Degraded or blocked browser capabilities return explicit reason codes.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_automation_overreach
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: browser_action_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- press key
- press_key
- select option
- select_option
- fill form
- fill_form
- file upload
- upload_file
- dialog handle
- handle_dialog
- session_granted
- /safety
- platform_unsupported
- runtime_unavailable
- permission_not_granted
- 5000ms
- 30000ms
- 30s
negative_constraints:
- WebAction/browser testing uses named action IDs rather than arbitrary browser-code execution.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-035 - Web Extraction Schema Validation Contract

```yaml
plan_unit_id: T-035
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Schema-backed `webextract` and `webresearch` use JSON Schema draft-07, strict/lenient validation modes, explicit
  empty/invalid/too-large errors, and prompt+schema two-phase behavior without silently rewriting prompts.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-031
unblocks: []
acceptance_criteria:
- '`schema_mode?: "strict" | "lenient"` remains preserved with default `"lenient"`.'
- 'Strict and lenient output behavior remains preserved, including `_schema_violation: true`.'
- Schema size and schema validation errors remain explicit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: schema_prompt_mutation
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_extraction_schema_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- 'schema_mode?: "strict" | "lenient"'
- '"lenient"'
- '_schema_violation: true'
- extraction_schema_mismatch
- extraction_empty
- schema_too_large
- schema_invalid
- 50KB
- JSON Schema draft-07
negative_constraints:
- Schema validation must not silently rewrite the LLM prompt.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-036 - Web Formats Firecrawl Mapping And Retired Claims

```yaml
plan_unit_id: T-036
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Web format semantics preserve browser artifact behavior, adapter-internal Firecrawl mappings, and retired/unconfirmed
  claims without making them PM canon.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: true
depends_on:
- T-031
- T-034
- T-035
unblocks: []
acceptance_criteria:
- Screenshot/PDF runtime warnings and browser-runtime requirements remain preserved.
- '`html` versus `rawHtml` semantics remain preserved.'
- '`detail_hint -> scrapeOptions depth` remains removed as unconfirmed.'
- The Firecrawl PDF `LlamaParse` claim remains retired as unconfirmed.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: adapter_internal_overlock
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_format_adapter_disposition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- capability_unavailable
- 'formats: ["pdf"]'
- '"rawHtml"'
- scripts/nav/ads
- 'onlyMainContent: true'
- detail_hint → scrapeOptions depth
- LlamaParse
- export_pdf
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- '`export_pdf` is retired for research access; trace/video are excluded from `research_session`; Firecrawl PDF `LlamaParse`
  is retired as unconfirmed.'
stale_retired_dispositions:
- Firecrawl PDF processing does not make `LlamaParse` PM canon.
owner_hints:
- Plans/Tools.md
```

### T-037 - Web Crawl Map Scope Change Tracking And Dedup

```yaml
plan_unit_id: T-037
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webcrawl` and `webmap` preserve scope filters, effective depth reporting, content-hash dedup, robots/change-tracking
  inputs, per-page change status, and structured warnings for narrowed provider behavior.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-031
unblocks: []
acceptance_criteria:
- Scope filters, effective depth, and per-page change status remain preserved.
- Content-hash dedup and `dedup_skipped` behavior remain preserved.
- Provider narrowing returns structured warnings rather than silent drift.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: crawl_scope_ambiguity
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_crawl_map_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- depth_limit?
- include_paths
- exclude_paths
- dedup
- respect_robots
- change_status
- change_summary
- new|same|changed|removed
- /docs/*
- /api/**
- '!/internal/*'
- /exclude_paths
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-038 - Web Result Envelope Cache And Audit Payload

```yaml
plan_unit_id: T-038
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Web outputs share locked execution-path, cache, common envelope, operation-specific result fields, citation
  provenance, semantic audit values, default limits, and child payload refs.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-029
- T-031
unblocks: []
acceptance_criteria:
- TTL defaults, `cache_state`, and `execution_path` remain preserved.
- The common result envelope and operation-specific extensions remain preserved.
- Semantic audit `read` maps to the canonical `webfetch` tool.
- '`web_input` remains the canonical structured routing/audit input.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_audit_cache_extras_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_result_cache_audit_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0030
preserved_exact_tokens:
- provider_search_native
- pm_search_plus_site_reader
- provider_extract_native
- pm_extract_composed
- pm_site_reader
- provider_firecrawl_scrape
- pm_fetch_fallback
- provider_firecrawl_agent
- pm_research_composed
- 'provenance_badge?: string'
- cache_state
- web_input
- web_input_preview
- denial_reason_code
negative_constraints:
- '`web_input_preview` must not replace structured `web_input`.'
preserved_contractrefs: []
compatibility_only_notes:
- Legacy child payload `blocked_reason_code?` aliases normalize to `denial_reason_code`.
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-039 - Site Reader Structured Runtime And PageRepresentation

```yaml
plan_unit_id: T-039
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Site Reader is the native structured browser-reading runtime behind `webfetch` and `Reading Site`; it builds
  typed `PageRepresentation`, handles iframes, returns rendered representations after navigation, and owns page/session state.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-029
- T-031
unblocks:
- T-040
- T-041
acceptance_criteria:
- The representation preserves accessibility tree, layout bounds, landmarks, headings, interactive elements, forms, and optional
  iframes.
- Iframe discovery remains bounded to 3 levels with warning behavior for blocked content.
- Navigation returns a rendered page representation with default detail level `minimal`.
- Page/session state remains owned by the Site Reader runtime.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: untyped_page_dump_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: structured_site_reader_runtime
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0031
preserved_exact_tokens:
- Site Reader
- PageRepresentation
- accessibility tree
- layout bounds
- landmarks
- headings
- interactive elements
- forms
- iframe
- 3 levels deep
- CDP sessions
- minimal
- PageManager
negative_constraints:
- Site Reader is not a browser-display feature, thin search helper, full built-in browser, click-to-context, DevTools-linked
  capture, or visible browser-session product surface.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-040 - Site Reader Product Boundary And Vocabulary

```yaml
plan_unit_id: T-040
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Site Reader remains the default structured-reader engine; `/raw` is fallback, read/observe stays separate
  from act/interact, and PM product vocabulary excludes non-PM implementation/source names.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: false
depends_on:
- T-039
unblocks: []
acceptance_criteria:
- Token-efficient summaries, stable element identity, and frame-level/per-frame CDP handling remain preserved.
- Canonical PM vocabulary remains preserved.
- Legacy Skills page labels normalize to Agent Config > Skills.
- External editor architecture remains non-normative inspiration.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: external_vocabulary_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: site_reader_product_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0031
preserved_exact_tokens:
- Site Reader
- Searching Web
- Reading Site
- visual module
- visual card
- Skill Store
- /text/markdown
- /observe
- /interact
- /interaction
- /raw
- Agent Config > Skills
- skill-management
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Legacy `Skills page` labels normalize to `Agent Config > Skills`; external `skill-management` labels do not replace PM vocabulary.
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-041 - Webfetch URL Cache And Change Tracking Contract

```yaml
plan_unit_id: T-041
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webfetch` rejects non-HTTP(S) and malformed URLs, normalizes routing, defaults bare domains to `https://`,
  enforces max content length, defaults cache policy, and reports hash-based change tracking.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: true
depends_on:
- T-029
- T-031
- T-039
unblocks:
- T-042
acceptance_criteria:
- Non-HTTP(S) schemes and malformed URLs return `invalid_input`.
- Bare domains default to `https://`.
- The default max content length remains 5 MB.
- 'Cache policy defaults to `{ max_age_seconds: 14400, store: true }`.'
- Hash-based change tracking status values remain preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unsafe_scheme_or_cache_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: webfetch_runtime_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0032
preserved_exact_tokens:
- file://
- ftp://
- 'javascript:'
- invalid_input
- https://
- max_content_length
- 5 MB
- '{ max_age_seconds: 14400, store: true }'
- new|same|changed|removed
- change_tracking
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-042 - Webfetch Binary Attachment And Output Contract

```yaml
plan_unit_id: T-042
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webfetch` detects binary non-text responses by `Content-Type`, returns supported image types as capped inline
  attachments, returns unsupported large media as metadata only, and keeps non-text responses out of HTML-to-Markdown conversion.'
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, preview, settings, usage, routing, browser,
  activity, or visible rendering behavior.
split_recommended: false
depends_on:
- T-041
unblocks: []
acceptance_criteria:
- Supported image MIME types and source shorthands remain preserved.
- Unsupported or large binary media returns metadata only without downloading the body.
- Non-text responses do not enter HTML-to-Markdown conversion.
- Markdown remains the default content view for text fetches.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unsafe_media_download_or_rendering_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: webfetch_binary_output_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0032
preserved_exact_tokens:
- image/png
- image/jpeg
- image/gif
- image/webp
- image/svg+xml
- /png
- /jpeg
- /gif
- /webp
- /svg
- /non-text
- /large
- MIME type
- content-length
- pm_site_reader
- provider_firecrawl_scrape
- pm_fetch_fallback
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-043 - LSP Expanded Tool Operations And Boundaries

```yaml
plan_unit_id: T-043
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`lsp` widens beyond the minimal MVP read trio with additional read operations, retains `rename` as write-like
  with explicit approval before apply, complements context bundling, and does not require provider-native skill installation
  for MVP.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-016
- T-017
unblocks: []
acceptance_criteria:
- All listed LSP read operations remain preserved.
- '`rename` remains write-like and requires explicit approval before apply.'
- The LSP tool complements but does not replace context compiler bundling.
- MVP operation does not require provider-native skill installation.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lsp_context_compiler_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_182
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: lsp_runtime_reconciliation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0033
preserved_exact_tokens:
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- rename
- context compiler
- provider-native skill installation
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-044 - Chatsearch Project Index Contract

```yaml
plan_unit_id: T-044
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`chatsearch` is project-scoped with `query: string`, optional `filters: { thread_id?, time_range? }`, optional
  `k?: number`, hit shape `{ thread_id, message_id, ts, role, snippet, score }`, project Tantivy scope, strict secret scrubbing,
  and Context Lens muted-message exclusion or annotation.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Input and output schema are preserved.
- Per-project Tantivy scope is enforced.
- Muted `message_ids` do not enter agent context.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: chatsearch_project_index_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- chatsearch
- 'query: string'
- 'filters: { thread_id?, time_range? }'
- 'k?: number'
- '{ thread_id, message_id, ts, role, snippet, score }'
- Tantivy
- PolicyRule:no_secrets_in_storage
- INV-002
- message_ids
- Context Lens
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md, Invariant:INV-002'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-045 - Codesearch Multi-Lane Boundary

```yaml
plan_unit_id: T-045
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`codesearch` uses Tantivy primary, LSP symbol secondary, and `grep` fallback while remaining distinct from
  direct `lsp` operations and raw regex `grep`.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-016
- T-021
- T-043
unblocks: []
acceptance_criteria:
- Backend ordering, output shape, ignore handling, environment-file exclusion, and secret-scrubbed snippets are preserved.
- '`codesearch` remains distinct from direct `lsp` and raw regex `grep`.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: codesearch_multilane_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- codesearch
- Tantivy
- workspace/symbol
- documentSymbol
- grep fallback
- /keyword
- /phrase/symbol
- '{ path, line_or_range, snippet, kind? }'
- .gitignore
- .env
- .env.*
- .env.example
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-046 - Grep Ownership Compatibility Scope And Correctness

```yaml
plan_unit_id: T-046
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools owns `grep` fallback, `/sparse-n-gram`, degradation, filtering, freshness, and event-field semantics
  while external callers keep `{ pattern, path?, glob? }`, the 1000 result limit, the 30s timeout, read-only posture, and
  final ripgrep verification.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-021
unblocks:
- T-047
- T-048
- T-049
- T-050
- T-051
- T-052
acceptance_criteria:
- No new user-facing or agent-facing tool name is introduced.
- Sparse index candidate narrowing never changes final correctness.
- Project indexes are not merged across projects.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_sparse_owner_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- grep
- /sparse-n-gram
- tool.invoked.index_used
- '{ pattern, path?, glob? }'
- 'matches: Array<{ path, line_number, line }>'
- '1000'
- 30s
- MUST NOT change final correctness
- ripgrep
- no cross-project index merging
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-047 - Grep Sparse N-Gram Extraction And Frequency Table

```yaml
plan_unit_id: T-047
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Grep index build extracts all sparse n-grams through `build_all`; query time extracts a `minimal-covering`
  set; boundary weighting uses the shipped 256x256 `u16` table and `effective[a][b] = α × base[a][b] + (1-α) × project[a][b]`;
  extraction stays byte-level.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-046
unblocks: []
acceptance_criteria:
- Fixed-width 3-gram fallback remains available when boundary weighting cannot place sparse boundaries.
- CRLF stripping and ASCII-only lowercase normalization are preserved.
- Non-ASCII bytes pass through unchanged.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_sparse_ngram_algorithm_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- build_all
- minimal-covering
- 256x256
- u16
- The Stack Smol
- effective[a][b] = α × base[a][b] + (1-α) × project[a][b]
- frequency_table.bin
- fixed-width 3-gram
- raw bytes
- u8::to_ascii_lowercase()
- "CRLF `\r`"
- hash("fo")
- hash("Fo")
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-048 - Grep Query Planning Alternation And Skip Rules

```yaml
plan_unit_id: T-048
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Regex HIR/literal extraction feeds xxh3 lookup, Roaring postings, branch intersection/union, file-map resolution,
  path/glob filtering, dirty paths, and ripgrep verification.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-047
unblocks: []
acceptance_criteria:
- Alternation uses union-of-intersections, not pure intersection.
- Index is skipped for no-literal queries, non-ASCII case-insensitive literals, and covering sets above 64 n-grams.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_query_planner_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- regex-syntax
- regex_syntax
- HIR
- regex_syntax::literal
- regex_syntax::literal::Seq
- xxh3
- lookup.bin
- Roaring Bitmap
- file_map.bin
- git cat-file --batch
- foo|bar
- .*
- '[a-z]+'
- \d{3}
- '>64 n-grams'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-049 - Grep Freshness Dirty Layer And Watcher Recovery

```yaml
plan_unit_id: T-049
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: PM-mediated writes update the dirty layer synchronously; watcher overflow marks indexed files dirty and re-anchors;
  stale snapshots remain queryable while refresh or re-anchor work runs.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-046
- T-047
unblocks: []
acceptance_criteria:
- Deleted dirty paths suppress stale base-index hits.
- Raw fallback remains reserved for missing, corrupted/building, disabled, or query-skip paths.
- Per-file verification races do not fail the whole query.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_freshness_recovery_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- dirty layer
- generation-aware path records
- IN_Q_OVERFLOW
- FSEvents "must scan"
- Windows RDCW
- 64 KB
- no stale-threshold cutoff
- no commit-count-based fallback threshold
- /corrupted/building
- ENOENT
- skip-and-continue
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-050 - Grep Filtering And Path Safety

```yaml
plan_unit_id: T-050
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Grep indexing respects ignore baselines, mandatory secret-path exclusions, binary detection, large-file thresholds,
  generated-file exclusions, path canonicalization, and project/cache containment.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-046
unblocks: []
acceptance_criteria:
- The generated-file exclusion default list is preserved.
- Paths from `.gitmodules`, dirty staging, and remote events are canonicalized and contained.
- Submodule paths containing `..` are rejected with a logged warning.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_filtering_path_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- .gitignore
- .ignore
- secret-path exclusions
- null-byte
- default 10 MB
- package-lock.json
- yarn.lock
- pnpm-lock.yaml
- '*.min.js'
- '*.min.css'
- '*.map'
- '*.generated.*'
- '*.g.dart'
- '*.pb.go'
- starts_with(project_root)
- starts_with(cache_root)
- .gitmodules
- ..
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-051 - Grep Indexing And Search GUI Consumers

```yaml
plan_unit_id: T-051
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The user-facing Search regex mode and optional Indexing setting consume the same sparse-n-gram path without
  weakening backend safeguards.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on:
- T-046
- T-050
unblocks: []
acceptance_criteria:
- '`Follow symlinks` remains off by default.'
- Enabled symlink targets are still canonicalized and project-root-contained.
- Search panel regex mode inherits dirty-layer guarantees and fallback causes.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_search_panel_gui_consumer
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- Search panel regex toggle is ON
- Indexing settings
- Follow symlinks
- OFF by default
- --no-follow
- no-follow
- starts_with(project_root)
- dirty-layer freshness guarantee
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-052 - Grep Performance Publication And Rust Foundation

```yaml
plan_unit_id: T-052
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Grep index targets <20 ms queries, bounded build and storage envelopes, generation publication with flush,
  cancellation checks, and Rust crate foundations without treating study references as dependencies.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-047
- T-048
- T-049
unblocks: []
acceptance_criteria:
- Generation publication and cancellation handoff are preserved.
- Rust crate list and scheduling notes are preserved.
- '`trigrep` and `fast-grep-rust` remain study references only.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: grep_performance_publication_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- <20 ms
- <2 minutes
- <=500 MB
- <10 minutes
- <=5 GB
- <30 minutes
- <=50 GB
- 1.5x index size
- RSS contribution typically <500 MB
- 1-10%
- thread-priority
- regex-syntax
- roaring
- memmap2
- xxhash-rust
- arc-swap
- ThreadPriority::Min
- pthread_set_qos_class_self_np(QOS_CLASS_UTILITY)
- gen-{N+1}/
- File::sync_all();
- sync_all
- CancellationToken
- O(index_size)
- trigrep
- fast-grep-rust
- Cursor
- ClickHouse
- GitHub Code Search
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-053 - Logsearch Logread Project Logs Contract

```yaml
plan_unit_id: T-053
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`logsearch` indexes summaries and snippets; `logread` fetches bounded full payloads by `event_id` or `blob_ref`;
  full payload remains out of the index and all persisted or returned log material is strictly scrubbed.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Input and output shapes are preserved.
- Full log payload is fetched out-of-index through `logread`.
- '`blob_ref` path ownership remains under storage blobs.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: logsearch_logread_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- logsearch
- logread
- 'query: string'
- 'filters: { time_range?, run_id?, thread_id?, tool_name?, level? }'
- '{ event_id? | blob_ref? }'
- '{ content, truncated?: boolean, truncation_reason? }'
- summaries/snippets only
- blob_ref
- storage/blobs/projects/{project_id}/logs/...
- PolicyRule:no_secrets_in_storage
- INV-002
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-054 - Repo Import External Repository Contract

```yaml
plan_unit_id: T-054
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`repo.import` imports external repositories as `new_project`, `add_workspace_root`, or lifecycle-bound `temporary_mount`
  without half-registering failed imports.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- FileSafe, path traversal, repo size, clone timeout, and network/provider permissions are enforced.
- Temporary mounts return bounded `mount_ref` and remain excluded from durable project identity until promoted.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: repo_import_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0034
preserved_exact_tokens:
- repo.import
- 'source: string'
- dest_path?
- new_project
- add_workspace_root
- temporary_mount
- mount_ref
- invalid_source
- permission_denied
- filesafe_blocked
- repo_too_large
- clone_failed
- auth_required
- destination_exists
- network_unavailable
- no half-registered project
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-055 - Task Public Discovery Boundary

```yaml
plan_unit_id: T-055
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The public `task` contract describes delegated work, not a user-curated agent catalog; hidden, unavailable,
  or policy-blocked subagents stay out of public discovery and success-shaped fallbacks.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-005
unblocks: []
acceptance_criteria:
- Public task discovery excludes blocked, hidden, or inaccessible subagents.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_public_discovery_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0035
preserved_exact_tokens:
- task
- 42 subagents
- delegated work
- hidden
- unavailable
- policy-blocked
- success-shaped fallbacks
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-056 - Task Request Schema And Registry Validation

```yaml
plan_unit_id: T-056
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Task input schema includes `goal`, `context?`, `owner_hint?`, `subagent_type?`, `resume?`, and `timeout_s?`;
  accepted `subagent_type` validates against the 42-entry `subagent_registry` before launch.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-055
unblocks: []
acceptance_criteria:
- Unknown subagent types are rejected before launch.
- '`owner_hint` exact-match fallback is preserved.'
- Hidden, inaccessible, or policy-blocked subagents stay out of selectable public inputs.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_request_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0036
preserved_exact_tokens:
- goal
- context?
- owner_hint?
- subagent_type?
- resume?
- timeout_s?
- subagent_registry
- 42 subagent types
- crew.roles
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-057 - Task Result Envelope And Resume Compatibility

```yaml
plan_unit_id: T-057
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Task results return stable `delegated_session_id`, lifecycle `status`, optional summary, artifacts, and failure
  detail; resume reuses identity and provider compatibility fields normalize back to PM shape.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-055
unblocks: []
acceptance_criteria:
- Resume does not mint a fresh child identity.
- Provider-facing compatibility fields remain compatibility-only.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_result_resume_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0037
preserved_exact_tokens:
- delegated_session_id
- pending | running | completed | failed | cancelled | timed_out
- summary?
- artifacts[]?
- failure_detail?
- 'resumed: boolean'
- task_id
- subagent_type
- result_text
- runtime_snapshot?
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-058 - Task Permission Public Input And MCP Dependency Boundary

```yaml
plan_unit_id: T-058
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Task subagents inherit parent permissions with enforced overrides; nested `task`, `todowrite`, and `todoread`
  remain denied unless run config re-enables them; MCP runtime deps reference shared MCP auth/config without copying secrets.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-055
unblocks: []
acceptance_criteria:
- The public contract does not expose `agent_type`, `name`, or optional `agent_id` as canonical user-facing inputs.
- Unavailable providers surface an error instead of silent rerouting.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_permission_dependency_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0037
preserved_exact_tokens:
- todowrite
- todoread
- nested `task`
- denied by default
- agent_type
- name
- agent_id
- 'type: "local"'
- 'command: string[]'
- 'type: "remote"'
- shared MCP runtime /auth/config
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-059 - Task Delegation Transparency Surface

```yaml
plan_unit_id: T-059
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: GUI/chat transparency records which subagent or `/persona` was used, why when meaningful, what task it owned,
  TODO linkage, blocked or failure state, and lifecycle in thread history/storage.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on:
- T-055
unblocks: []
acceptance_criteria:
- User-asked subagent usage is honored when feasible.
- Aggressive read-heavy delegation requires specialist-fit and task-fit evidence.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_delegation_transparency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0037
preserved_exact_tokens:
- User-asked subagent usage
- aggressive-by-default
- read-heavy `task` delegation
- specialist-fit
- task-fit evidence
- /persona
- TODO linkage
- /blocked
- thread history/storage
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-060 - Task Launch Bounds Metadata And Timeout Clamp

```yaml
plan_unit_id: T-060
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`task` launches canonical child runs with requested/effective persona, runtime, account, capability, write-scope,
  effort, required/optional classification, inherited ceilings, and clamped `task_timeout_ms` metadata.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-005
- T-055
unblocks: []
acceptance_criteria:
- Children may narrow but must not widen parent bounds.
- Omitted timeout defaults to inherited remaining budget.
- Broader requested timeout is clamped and emits a structured diagnostic.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_launch_bounds_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0038
preserved_exact_tokens:
- canonical child runs
- subagent_registry
- requested and effective Persona
- required
- optional
- parent permission ceiling
- write scope
- remaining budget
- task_timeout_ms
- MUST NOT widen
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md,
  ContractName:Plans/Models_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-061 - Task No-Silent-Fallback And Copilot Strict Deny

```yaml
plan_unit_id: T-061
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Explicit child runtime requests fail or ask when unavailable; implicit orchestrator selections may fallback
  with recorded reason; Copilot-native subagent paths require a Copilot-rooted parent.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-060
unblocks: []
acceptance_criteria:
- Explicit unavailable runtime requests do not silently fallback.
- Implicit fallback records the fallback reason.
- A non-Copilot parent gets strict deny for Copilot-native subagent semantics.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_runtime_fallback_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0038
preserved_exact_tokens:
- No-silent-fallback
- explicit user or command requests
- implicit orchestrator-selected runtime surfaces
- fallback reason
- Copilot-rooted parent
- Copilot-native subagent path
- strict deny
- not silent downgrade
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Commands_System.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-062 - Task Child Lifecycle Unified Model

```yaml
plan_unit_id: T-062
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Retry, reroute, replacement, cancellation, and resume are lifecycle semantics of one canonical child-run model
  shared by command subtasks, interview children, crew members, and orchestrator children.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-060
unblocks: []
acceptance_criteria:
- Resume applies only to non-terminal interrupted or waiting children.
- Task does not create separate runtime classes for command, interview, crew, or orchestrator children.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: task_child_lifecycle_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0038
preserved_exact_tokens:
- retry
- reroute
- replacement
- cancellation
- resume
- non-terminal interrupted or waiting children
- command subtasks
- interview children
- crew members
- orchestrator children
- same canonical child-run model
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md,
  ContractName:Plans/Commands_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-063 - Delegated Debug Investigation Participation

```yaml
plan_unit_id: T-063
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Delegated task runs may join an existing investigation by inheriting `investigation_id` and a narrowed-or-equal
  permission snapshot, adding evidence, instrumentation updates, and verification results through canonical contracts only.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-055
unblocks: []
acceptance_criteria:
- No second mutation-capable investigation is created for the same project/worktree unless a higher-level isolation flow exists.
- Temporary instrumentation carries its `instrumentation_id` cleanup contract.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: delegated_investigation_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0039
preserved_exact_tokens:
- investigation_id
- narrowed-or-equal permission snapshot
- evidence
- instrumentation updates
- verification results
- second mutation-capable investigation
- project/worktree
- instrumentation_id
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/MiscPlan.md, ContractName:Plans/orchestrator-subagent-integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-064 - GitHubApiTool Sole HTTPS Interface

```yaml
plan_unit_id: T-064
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`GitHubApiTool` is the sole permitted interface for GitHub HTTPS API operations; `gh` is forbidden for auth,
  status, repo, fork, and PR operations.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- GitHub CLI is forbidden for auth/status/repo/fork/PR operations.
- Auth flows remain owned by `Plans/GitHub_API_Auth_and_Flows.md`.
- API version default remains configurable.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: github_api_tool_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0040
preserved_exact_tokens:
- GitHubApiTool
- GitHub HTTPS API calls
- repository
- fork
- PR
- issue
- status
- gh
- Spec_Lock.json#github_operations
- github.api_version
- '"2022-11-28"'
- Crosswalk.md §3.1
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ToolID:GitHubApiTool, SchemaID:Spec_Lock.json#github_operations, Primitive:Tool'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-065 - Custom Tool Registry And Event Normalization

```yaml
plan_unit_id: T-065
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Custom tools are user- or project-defined callable functions registered with name, description, input schema,
  permissions, and normalized invocation/result events in seglog.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Custom tools are not policy-exempt.
- 'Wildcard permissions such as `myproject_*: ask` remain valid.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: custom_tool_registry_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0041
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0042
preserved_exact_tokens:
- Custom tools
- Name
- description
- input schema
- Permission model
- allow/deny/ask
- wildcards
- 'myproject_*: ask'
- seglog
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-066 - Custom Tool Schema Discovery And Enablement

```yaml
plan_unit_id: T-066
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Custom tool schemas use JSON Schema or equivalent and discovery comes from project config, enabled lists,
  or explicit scans without arbitrary disk loading.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Prompt descriptions are preserved.
- Arbitrary code is not loaded from disk without explicit enablement.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: custom_tool_discovery_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0043
preserved_exact_tokens:
- JSON Schema
- description for model prompt
- project-level
- user-level
- enabled list
- scan
- explicit enablement
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-067 - Custom Tool Subprocess Safety FileSafe And Host Policy

```yaml
plan_unit_id: T-067
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: MVP custom tools run arbitrary code in subprocesses with configurable timeout and output caps, apply FileSafe
  where classifiable, use prefixes/namespaces, and obey enterprise host-policy before external host contact.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- MVP does not imply a network or filesystem sandbox.
- Offline cached results are read-only evidence, not live authority.
- Diagnostics distinguish host policy, proxy, TLS, offline-cache, and unsupported-host failures.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: custom_tool_safety_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0044
preserved_exact_tokens:
- subprocess
- 60s default
- 1 MiB
- No network or filesystem sandbox for MVP
- FileSafe
- custom_*
- myproject_*
- blocked_by_host_policy
- host_blocked_by_policy
- proxy_auth_required
- tls_untrusted
- offline_cached_only
- enterprise_host_unsupported
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-068 - MCP Integration Consumer Boundary

```yaml
plan_unit_id: T-068
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools is a consumer cross-reference for MCP registry and permission integration; MCP availability, credential
  binding, invalidation, and remote auth/debug/status evidence are owned by `Plans/MCP_Integration.md`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Underscore form remains canonical for MCP tool names.
- Slash-separated aliases do not remain live examples.
- Skill metadata consumes the central registry rather than becoming a competing tool model.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: mcp_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0045
preserved_exact_tokens:
- MCP canon
- requested versus effective MCP availability
- credential binding
- tool names
- '{server_slug}_{tool_name}'
- slash-separated aliases
- tool-resolution
- /remote/auth/debug/status
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-069 - Tool Addition Mechanisms And Central Registry Alignment

```yaml
plan_unit_id: T-069
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool addition mechanisms route through MCP servers, platform flags, and the central registry; implementation
  uses `platform_specs`, central MCP ownership, secretless derived adapter config, and storage-aligned events/search.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- DirectApi providers use the central registry directly.
- CliBridge receives derived adapter config only where required.
- Secrets resolve through env or credential store only.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_addition_registry_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0046
preserved_exact_tokens:
- MCP server
- Platform CLI flags
- Central tool registry
- platform_specs
- CliBridge
- DirectApi
- env/credential store
- no secrets in config files
- seglog
- redb
- Tantivy
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-070 - GUI Tool Catalog And MCP Settings Surfaces

```yaml
plan_unit_id: T-070
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: GUI tool catalog choices are offered in Interview and GUI MCP settings live under Settings -> Advanced ->
  MCP Configuration while still integrating through the central MCP/tool contract.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- GUI rows remain consumer surfaces over the central registry/MCP contract.
- '`Playwright`, `Context7`, `DRY:DATA:gui_tool_catalog`, and `newtools.md` owner hints are preserved.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_addition_gui_surfaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0046
preserved_exact_tokens:
- GUI tool catalog
- Interview
- DRY:DATA:gui_tool_catalog
- Playwright
- headless runners
- Settings → Advanced → MCP Configuration
- Context7
- newtools.md
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-071 - Per-Platform MCP Config Reference And Secretless Adapters

```yaml
plan_unit_id: T-071
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Per-platform MCP/tool config is reference material to reverify with Doctor or platform docs; Cursor and Claude
  configs/flags are compatibility details, while Codex, Gemini, and Copilot remain DirectApi provider/tool-boundary rows.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Derived adapter config contains no secrets.
- Cited web search normalizes through live web/provenance/tool contracts before consumer use.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: platform_mcp_config_reference
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0047
preserved_exact_tokens:
- Cursor
- .cursor/mcp.json
- ~/.cursor/mcp.json
- Claude Code
- .mcp.json
- ~/.claude.json
- --allowedTools
- --permission-mode
- Codex
- Gemini
- Copilot
- 'Authorization: Bearer <key>'
- websearch-cited
- websearch_cited
- usage.event
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-072 - Tool Event Payload And Index Used Disclosure

```yaml
plan_unit_id: T-072
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Blocked and denied tool packets expose the shared runtime-facing blocked payload fields and canonical `tool.invoked`
  / `tool.denied` events; grep/Search acceleration reports optional `index_used`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Escalation ladder is preserved.
- '`tool.invoked.index_used=true` means sparse-n-gram narrowing served the query; false means fallback or another unindexed
  path.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_event_payload_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0049
- pldg-20260622-001-fff:atom-0063
- pldg-20260622-001-fff:atom-0076
- pldg-20260622-001-fff:subagent_compile_proposals:Helmholtz
preserved_exact_tokens:
- blocked_sequence
- approval_scope_key
- action_available
- escalation_level
- tool.invoked
- tool.denied
- info
- warning
- attention_required
- blocked
- system_notification
- tool.invoked.index_used = true
- 'false'
negative_constraints:
- Do not use `tool.invoked.index_used` for fuzzy/path discovery; it remains only grep/Search sparse-n-gram disclosure.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-073 - Tool Permission Config Persistence And Snapshot

```yaml
plan_unit_id: T-073
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool permissions persist under `tool_permissions` in config with app defaults and project overrides; active
  runs use immutable snapshots and settings changes affect only the next run.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Project switching recomputes effective permissions.
- Mid-run Settings changes do not affect the active run.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_permission_config_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0050
preserved_exact_tokens:
- GuiConfig
- redb
- config:v1
- tool_permissions
- '"allow" | "deny" | "ask"'
- project-scoped overrides
- immutable snapshot
- next run
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-074 - Tool Dispatch Policy Order And Child Inheritance

```yaml
plan_unit_id: T-074
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: No tool implementation dispatches outside the canonical flow; child/helper work inherits parent policy, deadline,
  MCP effective availability, and registry-filtered tool set unless narrowed.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-007
- T-058
unblocks: []
acceptance_criteria:
- Child tool dispatch inherits parent policy, deadline, and MCP effective-availability snapshot unless explicitly narrowed.
- Helper/background work cannot bypass policy, schema validation, or timeout propagation.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_dispatch_policy_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0051
preserved_exact_tokens:
- policy.may_execute_tool()
- central tool registry
- effective MCP-discovered tools
- /helper/background
- schema validation
- timeout propagation
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-075 - MCP Schema OAuth Isolation And Stable Auth State

```yaml
plan_unit_id: T-075
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool dispatch consumes MCP-owned schema/OAuth facts, fails fast for auth or timeout evidence, uses owner-provided
  loopback binding, isolates schema cycles and mismatches, and serializes client/token state.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-068
- T-074
unblocks: []
acceptance_criteria:
- Tool layer does not mint hidden OAuth flows or extend run timeout.
- Callback listeners do not silently widen to wildcard or public-interface binds.
- Schema violations isolate per server/tool and do not poison other servers.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: mcp_schema_oauth_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0052
preserved_exact_tokens:
- /OAuth/timeout
- fail fast
- callback/listener failure
- bind-address
- bind-host
- WSL/container
- schema-cycle
- '{}'
- mcp_schema_mismatch
- finishReason=length
- no-dispatch
- client-id
- callback-listener
- token-write
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-076 - Dispatch Required Order And Revalidation Hooks

```yaml
plan_unit_id: T-076
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Dispatch order normalizes context, checks policy, applies FileSafe, applies allowed provider normalizers,
  validates schema, runs arg-touching hooks, revalidates changed args, and dispatches only after all checks pass.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-074
- T-075
unblocks: []
acceptance_criteria:
- Provider-specific normalizers run before schema validation only where the tool surface explicitly allows them.
- Hook-mutated arguments trigger permission and schema revalidation before dispatch.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_dispatch_required_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0052
preserved_exact_tokens:
- Normalize the invocation context
- policy.may_execute_tool()
- FileSafe/write-scope checks
- GLM quoted-JSON unquoting
- Qwen XML-wrapper stripping
- schema.validate_tool_args()
- arg-touching hooks
- Re-run permission and schema validation
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-077 - Tool Failure Error Result And Structured Retry Decisions

```yaml
plan_unit_id: T-077
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Invalid args and non-permission tool errors return structured `is_error=true` results without execution, best-effort
  repair, substring retry matching, or zero-value success-shaped results.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-076
unblocks: []
acceptance_criteria:
- Invalid payloads are rejected before dispatch.
- Provider-specific retry decisions use structured error classes or status codes.
- Non-permission tool errors surface as `is_error=true`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_failure_result_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0052
preserved_exact_tokens:
- is_error=true
- best effort
- empty `tool_result`
- PER error type
- structured error classes
- status codes
- substring matching
- OC-EXEC-106
- zero-value success-shaped result
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/CLI_Bridged_Providers.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-078 - Incomplete Tool Invocation Truncation Gate

```yaml
plan_unit_id: T-078
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Incomplete tool invocations truncated by provider output close with structured truncation errors and never
  synthesize missing, empty, minimal, or incomplete arguments.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-076
unblocks: []
acceptance_criteria:
- Truncated incomplete tool calls are closed before permission, schema, or execution paths.
- Missing or incomplete arguments are rejected rather than synthesized.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_truncation_no_dispatch_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0052
preserved_exact_tokens:
- finishReason=length
- stop_reason = length
- no-dispatch
- tool_result(ok=false, error=truncated_by_length)
- MUST NOT synthesize missing arguments
- empty
- /minimal
- structurally incomplete tool arguments
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-079 - Retry Classification And Bounded Recovery

```yaml
plan_unit_id: T-079
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Automatic retries are per-invocation, classed, capped at 3, use `1000ms`, `2000ms`, and `4000ms` backoff with
  `+/-25%` jitter, and only recreate helpers for recoverable classes.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-077
unblocks: []
acceptance_criteria:
- Retry caps are per invocation.
- Auth, permission, schema, validation, content-filter, and safety-stop classes are terminal.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_retry_bounded_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0053
preserved_exact_tokens:
- transient transport
- server-warming
- recoverable bootstrap failures
- 3 per invocation
- 1000ms
- 2000ms
- 4000ms
- +/-25%
- Retry-After
- helper/client recreation
- auth-required
- permission-denied
- schema-mismatch
- validation-failed
- content-filter
- safety-stop
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-080 - Deadline Propagation And Loop Suppression

```yaml
plan_unit_id: T-080
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Nested tool/helper work inherits the parent absolute deadline or remaining budget; retries clamp to remaining
  budget and loop suppression compares normalized fingerprint, target, error class/status, and near-match signatures.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-079
unblocks: []
acceptance_criteria:
- Parent deadline is never extended by retries or helper restarts.
- Exhausted remaining budget emits timeout/budget result without dispatch.
- Equivalent repeated failures stop further retries with a diagnostic.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_deadline_loop_suppression
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0054
preserved_exact_tokens:
- parent deadline
- remaining-budget snapshot
- MUST NOT extend
- timeout or budget result
- normalized tool fingerprint
- canonical target
- error class/status
- near-match argument
- stderr signatures
- diagnostic
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-081 - Shell Command Validation Escaping And One-Layer Dispatch

```yaml
plan_unit_id: T-081
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Shell dispatch validates the full rendered command string, prefers structured parsing where practical, uses
  exactly one shell interpretation layer, prohibits `eval`, and requires platform-correct path escaping.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-074
unblocks: []
acceptance_criteria:
- Banned-command checks scan the full rendered command string.
- Unix shell dispatch uses one shell interpretation layer.
- Individual tools do not implement competing escaping layers.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: shell_runtime_validation_dispatch
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0055
preserved_exact_tokens:
- full rendered command string
- ;
- '&&'
- '||'
- '|'
- subshell/grouping constructs
- $()
- backticks
- redirection operators
- structured parsing
- AST-aware validation
- exactly one shell interpretation layer
- never eval
- exec.Command("bash", "-c", command)
- /bin/bash
- cmd.exe
- PowerShell
- shellQuote
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-082 - Shell Instance Isolation Lifecycle And OC Evidence Labels

```yaml
plan_unit_id: T-082
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Shell instances are isolated per agent tree, lifecycle is mutex-guarded, queues are non-blocking, dead-shell
  writes return structured LIFE errors, and OC codes remain evidence labels only.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-081
unblocks: []
acceptance_criteria:
- Environment variables do not leak across session/agent boundaries.
- Alive-check occurs before queue writes.
- OC references do not replace canonical behavior.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_183
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: shell_lifecycle_error_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0055
preserved_exact_tokens:
- isolated per agent tree
- mutex-guarded
- /non-blocking
- dead shell
- structured LIFE error
- OC-LIFE-006
- OC-EXEC-101
- OC-EXEC-108
- OC-PROV-012
- OC-EXEC-106
- OC-LIFE-004
- OC-LIFE-005
- OC-PROV-006
- OC-PROV-005
- evidence labels only
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-083 - Tool CLI Flag Derivation

```yaml
plan_unit_id: T-083
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The registry and resolved tool policy derive platform-specific CLI flags for Claude, Copilot, and Gemini without
  runner hardcoding.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-069
- T-073
unblocks:
- T-102
acceptance_criteria:
- Allow, ask, and deny outcomes map to platform flags as specified.
- Gemini remains gated by PM policy rather than provider CLI flags.
- Runner logic uses registry and policy as the single source of truth.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_cli_flag_derivation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0056
preserved_exact_tokens:
- --allowedTools
- Read,Edit,Bash
- --allow-tool
- --allow-all-tools
- --deny-tool
- N/A
- no hardcoding in runner
- platform_specs
- tool policy → CLI args
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-084 - Tool Usage Rollup Schema

```yaml
plan_unit_id: T-084
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Analytics writes executed tool rollups under `rollups` / `tool_usage.{window}` with canonical windows and
  per-tool count, latency, error, and `index_used` fields.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Rollup schema matches the source value shape.
- Analytics aggregates `tool.invoked` events so the Usage page can render without scanning seglog.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_usage_rollup_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0057
preserved_exact_tokens:
- rollups
- tool_usage.{window}
- 5h
- 7d
- 24h
- 1h
- count
- p50_ms
- p95_ms
- error_count
- index_used
- tool.invoked
- latency_ms
- success
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-085 - Tool Usage Widget Freshness And Runtime Identity

```yaml
plan_unit_id: T-085
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The Usage widget consumes the same windows, excludes `tool.denied` and FileSafe blocks from executed-call
  rollups, preserves node-native runtime identity, and can show freshness metadata.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on:
- T-072
unblocks: []
acceptance_criteria:
- '`error_count` counts executed `tool.invoked` events where `success = false`.'
- Denied and FileSafe-blocked calls are excluded from executed-call rollups.
- '`tool_usage_meta.{window}` supports a Last updated timestamp.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_usage_widget_freshness_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0057
preserved_exact_tokens:
- node-native
- tier-native
- tier-aligned
- tool.denied
- FileSafe blocks
- success = false
- tool_usage_meta.{window}
- computed_at
- window_started_at
- window_ended_at
- Last updated
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- '`tier-native` and `tier-aligned` fields survive only as compatibility/grouping projections.'
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-086 - YOLO FileSafe Boundary

```yaml
plan_unit_id: T-086
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: YOLO treats all tools as allow for session prompting, removing ask prompts, but does not disable FileSafe
  or destructive/write-scope/sensitive-file guards.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Ask prompts are suppressed for the session.
- FileSafe remains enforced after YOLO allow behavior.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: yolo_file_safe_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0058
preserved_exact_tokens:
- YOLO
- allow
- ask
- FileSafe
- destructive commands
- write-scope
- sensitive-file guards
- does not disable FileSafe
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-087 - MCP Name Wildcard Permission Layering

```yaml
plan_unit_id: T-087
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: MCP tool names use `{server_slug}_{tool_name}`; wildcard rules match the underscore form and server-level
  permission rules apply before per-tool wildcard expansion.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Slash and mixed separator examples are retired.
- No `org` layer is added to canonical precedence.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: mcp_name_wildcard_permission_layering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0059
preserved_exact_tokens:
- '{server_slug}_{tool_name}'
- context7_*
- slash variants
- mixed `_` / `/` examples
- server-level permission rules
- project > global > org > default
- canonical `Plans/Permissions_System.md` precedence
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MCP_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Slash variants and mixed `_` / `/` examples are retired.
- Older `project > global > org > default` wording is non-canonical historical wording.
owner_hints:
- Plans/Tools.md
```

### T-088 - MCP Unavailable Runtime Contract

```yaml
plan_unit_id: T-088
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Unavailable MCP servers mark their tools unavailable, fail calls immediately with structured errors, use independent
  per-tool timeout, emit diagnostics, preserve safe stale identity, and retry once after cooldown.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- A transient `listTools()` failure does not permanently delete the MCP client or singleton state.
- Calls to unavailable tools fail immediately with structured errors.
- Reconnect behavior is bounded to one automatic attempt after cooldown.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: mcp_unavailable_runtime_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0060
preserved_exact_tokens:
- unavailable
- failure_class=provider_transient
- Per-tool MCP invocation timeout
- 30 seconds
- server_id
- reason
- last_healthy_at
- stale list
- listTools()
- one automatic reconnect attempt
- 60 seconds
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-089 - MCP Degraded User Surface

```yaml
plan_unit_id: T-089
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: User surfaces show MCP servers as `degraded` or `unavailable` and never silently hide a server after a single
  transient failure.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on:
- T-088
unblocks: []
acceptance_criteria:
- Visible degraded/unavailable state is emitted from runtime diagnostic evidence.
- A single transient failure does not remove the server from user surfaces.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: mcp_degraded_user_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0060
preserved_exact_tokens:
- degraded
- unavailable
- MUST NOT silently hide
- startup timeout
- transport failure
- auth loss
- schema mismatch
- repeated health-check failure
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-090 - Tool Gap Risk Register

```yaml
plan_unit_id: T-090
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The gaps table is preserved as risk/readiness metadata for platform semantics, MCP instability, defaults,
  sandboxing, HITL, FileSafe, retention, subagent overrides, LSP, web abuse, config, snapshots, MCP down, empty Usage, provider
  coverage, policy enforcement, and LSP crashes.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Rows remain risk/readiness mitigations, not WorkNodes or executable tasks.
- Mitigation labels are preserved for future implementation planning.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_gap_risk_register
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0061
preserved_exact_tokens:
- Platform tool semantics differ
- MCP tool names unstable
- Permission default ambiguity
- Custom tool sandboxing
- Ask vs HITL in orchestrator
- Edit permission vs write scope
- Tool latency in seglog
- Subagent tool defaults
- LSP tool when no server
- webfetch / websearch abuse
- Config key for tool permissions
- Permission change mid-run
- MCP server down
- Tool usage widget empty
- All providers in MCP GUI
- Policy application point
- LSP server crash mid-call
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-091 - Optional Tool Enhancement Backlog

```yaml
plan_unit_id: T-091
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Optional tool enhancements remain non-MVP backlog items covering rate limits, dashboard, presets, templates,
  allowlists, denied/ask audit, UI descriptions, and bash allowlists.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Optional enhancements do not redefine MVP scope.
- MVP remains defined by §3 built-in tools, §10 permission model, §8 events/rollups, and GUI Tool permissions.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: optional_tool_enhancement_backlog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0062
preserved_exact_tokens:
- optional
- not MVP
- Per-tool rate limits
- Tool usage dashboard
- Permission presets
- Custom tool templates
- MCP tool allowlist
- Audit log for denied/ask
- Tool description in UI
- Bash command allowlist
- Read-only
- Plan mode
- Full
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-092 - Permissions Implementation SSOT Boundary

```yaml
plan_unit_id: T-092
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools consumes `Plans/Permissions_System.md` as the permission SSOT while adding registry-specific FileSafe
  integration, CLI derivation, and preset implementation guidance.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Tools does not restate conflicting permission owner definitions.
- Mode override text does not imply blanket denial of help-family tools when the effective preset allows them.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: permissions_implementation_ssot_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0063
preserved_exact_tokens:
- SSOT
- Plans/Permissions_System.md
- FileSafe integration
- CLI derivation
- presets
- /question/skill/LSP/todo/subagent
- /search/skill/lsp/question/todo
- help-family tools
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-093 - Permission Config Schema Projection

```yaml
plan_unit_id: T-093
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Durable permission config uses global and project TOML files and projects the merged set to redb `tool_permissions`
  in `config:v1` for backward compatibility.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Global and project TOML locations are preserved.
- Merged permission projection to redb remains backward-compatible.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: permission_config_schema_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0064
preserved_exact_tokens:
- ~/.config/puppet-master/permissions.toml
- <project_root>/.puppet-master/permissions.toml
- tool_permissions
- config:v1
- backward compatibility
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-094 - Default Policy Table Consumer Summary

```yaml
plan_unit_id: T-094
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools mirrors the canonical default policy table for skill, question, web, batch web, todo, and child-agent
  question tool families while keeping defaults owned by Permissions_System §7.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Default table remains a consumer summary of Permissions_System §7.
- Child-agent `question` remains denied by default.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: default_policy_table_consumer_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0065
preserved_exact_tokens:
- skill
- question
- HITL
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
- batch_webfetch
- batch_webextract
- todoread
- todowrite
- child-agent `question`
- allow
- ask
- deny
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-095 - Permission Resolution Algorithm Summary

```yaml
plan_unit_id: T-095
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Permission resolution order is summarized as Mode override, Session cache, Persona, Project, Global, Defaults,
  Special guards, then FileSafe post-resolution application.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Summary does not compete with Permissions_System §8.
- FileSafe remains post-resolution per §10.6.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: permission_resolution_algorithm_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0066
preserved_exact_tokens:
- Mode override
- Session cache
- Persona overrides
- Project rules
- Global rules
- Defaults
- Special guards
- FileSafe applies
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-096 - Permission Preset Tool Mapping

```yaml
plan_unit_id: T-096
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`read_only`, `plan`, and `full` presets map to tool-facing availability without silently denying all web/help
  tools, and child-agent `question` denial remains architectural.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Preset semantics remain owned by Permissions_System §10.4.
- Plan preset does not silently auto-deny the whole web family.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: permission_preset_tool_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0067
preserved_exact_tokens:
- read_only
- plan
- full
- read/search/list
- mutation stays denied
- read-only web tools remain `ask`
- full
- Child-agent denial of `question`
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-097 - Permission GUI Config Serialization

```yaml
plan_unit_id: T-097
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The Permissions GUI is specified by Permissions_System and FinalGUISpec; the tool registry supplies known
  built-in and MCP-discovered tool names for the GUI per-tool list.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- GUI does not own permission semantics.
- Tool registry supplies known tool names for serialization/display.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: permission_gui_config_serialization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0068
preserved_exact_tokens:
- Permissions GUI
- Plans/Permissions_System.md §10
- Plans/FinalGUISpec.md §7.4
- Settings and inspectors
- built-in + MCP-discovered
- per-tool list
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-098 - FileSafe Policy API Order Summary

```yaml
plan_unit_id: T-098
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`policy.may_execute_tool(tool_name, invocation_context)` remains the permission entrypoint; FileSafe normalized
  checks run inside the canonical §8.2 flow and hook-mutated args require re-checks.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Subsection remains an API summary only.
- FileSafe runs on normalized arguments within the canonical dispatch order.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: filesafe_policy_api_order_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0069
preserved_exact_tokens:
- MUST NOT be read as a competing order definition
- policy.may_execute_tool(tool_name, invocation_context)
- Result<Allow | Deny(reason) | Ask, Error>
- check_bash_command(cmd)
- check_write_path(path)
- check_read_path(path)
- hook-mutated arguments
- required re-checks
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-099 - Assistant Ask Pending Approval Notice

```yaml
plan_unit_id: T-099
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Interactive Assistant ask-flow surfaces a `blocked_notice` pending approval with scoped actions and blocked
  metadata.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Pending approval notice includes scoped response options and blocked metadata.
- Ask-flow response semantics defer to Permissions_System §6.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: assistant_ask_pending_approval_notice
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0070
preserved_exact_tokens:
- Assistant (interactive)
- ask
- blocked_notice
- pending approval
- action_available
- blocked_reason_code
- blocked_sequence
- approval_scope_key
- deny
- once
- for session
- always
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-100 - Headless Ask Denial Or HITL

```yaml
plan_unit_id: T-100
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Headless Orchestrator and Interview contexts map `ask` to deny or to pending-HITL when HITL is enabled, avoiding
  invisible interactive waits.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Headless flows do not wait invisibly for interactive approval.
- HITL-enabled flows may enter pending-HITL instead of denial.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: headless_ask_denial_or_hitl
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0070
preserved_exact_tokens:
- Orchestrator / Interview
- headless
- ask → deny
- pending-HITL
- human-in-the-loop.md
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-101 - Web Operation Approval Summary Rules

```yaml
plan_unit_id: T-101
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Runner and UI integrations preserve web-operation approval summaries for search, fetch, extract, research,
  crawl, and map plus the correct session-approval scope.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Crawl/session approval remains host-pattern scoped.
- Webresearch approval does not broadly allow unrelated tools.
- Advanced query-pattern support requires a separate owner-defined matcher contract and validation evidence before use.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_operation_approval_summary_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0071
preserved_exact_tokens:
- websearch summary shows tool name + query preview
- webfetch/webextract summary shows tool name + target host/URL
- webresearch summary shows tool name + task summary + estimated source count when available
- webcrawl/webmap summary shows tool name + root URL + page/depth caps
- Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern
- Approving webresearch For Session does NOT create broad allow for unrelated tools
- MVP uses wildcard session approval for search/research
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md#3.4A Web-operation permission-key derivation, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-102 - Platform CLI Derivation Table

```yaml
plan_unit_id: T-102
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Resolved permissions derive platform-specific CLI args for Claude, Copilot, Gemini, Cursor, and Codex, with
  names sourced from registry and policy.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-083
unblocks: []
acceptance_criteria:
- Allow/ask/deny behavior matches the platform derivation table.
- Runner uses registry and policy for all names.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: platform_cli_derivation_table
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0072
preserved_exact_tokens:
- Claude
- Copilot
- Gemini
- Cursor
- Codex
- --allowedTools
- --allow-tool
- --deny-tool
- Tool disabled
- allow → forward
- deny → return
- ask → map to deny or HITL
- No hardcoded tool names
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-103 - HTE DAE Tool Enforcement Boundary

```yaml
plan_unit_id: T-103
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The before-forwarding tool-filter wording applies only to HTE; DAE requires deterministic pre-spawn restriction
  and post-run reconciliation because the provider executes tools inside a jail.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-102
unblocks: []
acceptance_criteria:
- Providers without deterministic restriction support cannot advertise `dae_allowed = true`.
- HTE and DAE enforcement boundaries remain distinct.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: hte_dae_tool_enforcement_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0072
preserved_exact_tokens:
- HTE
- DAE
- before forwarding
- provider executes tools inside a jail
- deterministic pre-spawn restriction
- post-run reconciliation
- dae_allowed = true
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-104 - Tools Owner Consumer Reference Map

```yaml
plan_unit_id: T-104
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The relationship table remains a consumer/owner map for rewrite tie-in, newtools, storage, agent context,
  orchestrator, interview, FileSafe, usage, LSP, HITL, and media capability docs.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The table does not re-own referenced docs.
- Media capability tool registration defers full contracts to the media capabilities doc.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tools_owner_consumer_reference_map
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0073
preserved_exact_tokens:
- rewrite-tie-in-memo.md
- newtools.md
- storage-plan.md
- agent-rules-context.md
- orchestrator-subagent-integration.md
- interview-subagent-integration.md
- FileSafe.md
- usage-feature.md
- LSPSupport.md
- human-in-the-loop.md
- Media_Generation_and_Capabilities.md
- 42 subagents
- subagent_registry
- capabilities.get
- media.generate
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-105 - Tool Implementation Readiness Checklist

```yaml
plan_unit_id: T-105
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The ordered implementation checklist is readiness metadata only; it preserves dependencies and gates without
  creating WorkNodes, tasks, or executable queues.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Checklist items remain ordered readiness metadata.
- No WorkNodes, NodeSeeds, executable tasks, or queues are created from this checklist.
- Addenda consolidation and machine verification remain gate/readiness language.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_implementation_readiness_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0074
preserved_exact_tokens:
- Config schema
- Default policy table as code
- Resolution function
- FileSafe and YOLO order
- Per-tool adapters
- Event emission
- GUI Tool permissions
- Usage widget and rollups
- Central registry and policy engine
- Registry → CLI derivation
- MCP integration
- Ask UI and headless
- LSP tool promotion
- Addenda consolidation gate
- merge-and-dedup
- Machine verification gates
- /gate
- Doctor and docs
- subagent_tool_overrides
negative_constraints:
- Do not interpret this checklist as a WorkNode manifest or executable build queue.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-106 - Tool Outcome Runtime Taxonomy Mapping

```yaml
plan_unit_id: T-106
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool-layer policy outcomes map deterministically to runtime blocked/failure classes, and non-executed calls
  are classified as blocked/denied rather than execution failures.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Outcome mappings are deterministic.
- Calls that never execute are not mislabeled as execution failures.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_outcome_runtime_taxonomy_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0077
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0078
preserved_exact_tokens:
- permission_denied
- user_declined
- headless_ask_denied
- filesafe_blocked
- validation_blocked
- blocked / `permission_denied`
- blocked/denied
- not execution failure
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-107 - Tool Blocked Recovery Metadata

```yaml
plan_unit_id: T-107
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Blocked tool outcomes carry guard or policy source, reason code, recovery options where applicable, and executed-at-all
  evidence for runtime recovery UI.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Runtime recovery UI receives enough metadata to bind recovery paths.
- Tool-layer outcomes map deterministically into the shared runtime taxonomy.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_blocked_recovery_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0079
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0080
preserved_exact_tokens:
- guard / policy source
- reason code
- recovery options
- whether the action executed at all
- UI/assistant/orchestrator surfaces
- Acceptance criteria
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-108 - Tool Denied Event Runtime Fields

```yaml
plan_unit_id: T-108
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: When `tool.denied` blocks progress, its event or mapped payload includes blocked reason, optional failure
  class, permission snapshot, allowed actions, headless flag, and remote side-effect metadata.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Blocking denial events collapse into canonical runtime taxonomy.
- Required fields remain available to UI and scheduling layers.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_denied_event_runtime_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0081
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0082
preserved_exact_tokens:
- tool.denied
- blocked_reason_code
- failure_class
- effective permission snapshot identifier
- allowed_action_ids[]
- headless_denied
- side-effect metadata
- remote mutation
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-109 - Tool Denial Canonical Action Alignment

```yaml
plan_unit_id: T-109
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Denied work must not return success-shaped fallbacks; runtime-facing denial paths preserve blocked state and
  use canonical action fields instead of a parallel `recovery_options[]` schema.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Scheduler, chat, and GUI inspect the blocked state.
- Runtime-facing paths use canonical action fields only.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_denial_canonical_action_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0083
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0084
preserved_exact_tokens:
- MUST NOT return success-shaped fallbacks
- blocked outcome
- scheduler
- chat
- GUI
- allowed_action_ids[]
- executed_at_all
- MUST NOT publish a parallel `recovery_options[]` schema
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Parallel `recovery_options[]` schema is retired for runtime-facing tool-denial paths.
owner_hints:
- Plans/Tools.md
```

### T-110 - Tool Denial Payload Consolidation

```yaml
plan_unit_id: T-110
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Runtime-facing tool denial payloads consolidate source mapping rules and preserve blocked state instead of
  converting denied work into success-shaped or generic-failure fallbacks.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, or
  visual tool surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Source mappings remain exact.
- Blocked state survives through UI and scheduler consumption.
- Denied work is not converted to generic failure.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_denial_payload_consolidation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0085
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0086
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0087
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0088
preserved_exact_tokens:
- Canonical runtime-facing payload
- blocked_reason_code
- allowed_action_ids[]
- executed_at_all
- permission-layer denial
- headless interactive denial
- FileSafe denial
- plugin_hook_blocked
- success-shaped
- generic-failure
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-111 - Tool Blocked Field Name Contract

```yaml
plan_unit_id: T-111
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool-originated blocked payloads use `allowed_action_ids[]` only and canonical `blocked_reason_code` values,
  including `validation_blocked`, for post-validation paths.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Deprecated names are absent from new tool contracts.
- Post-validation paths use canonical blocked reason codes.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_blocked_field_name_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0089
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0090
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0091
preserved_exact_tokens:
- allowed_action_ids[]
- Deprecated names MUST NOT appear
- blocked_reason_code
- validation_blocked
- Tool-originated blocked payloads
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Deprecated blocked-payload field names are retired from new tool contracts.
owner_hints:
- Plans/Tools.md
```

### T-112 - Tool Mutation Capability Recovery Contract

```yaml
plan_unit_id: T-112
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: 'Every tool definition includes `mutation_capable: bool` defaulting false, and recovery paths use the canonical
  runtime action family with prerequisite metadata rather than tool-private action arrays.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Tool definitions expose mutation capability.
- Recovery paths do not invent private action arrays.
- Blocked state is not converted to fallback output.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_mutation_capability_recovery_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0092
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0093
preserved_exact_tokens:
- 'mutation_capable: bool'
- default `false`
- planning
- safe-point
- recovery decisions
- MUST NOT invent tool-private action arrays
- MUST preserve the blocked state
- prerequisite metadata
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-113 - Firecrawl Owner Section Boundary

```yaml
plan_unit_id: T-113
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl is a distinct provider owner section; packet regeneration treats `## 10` as one coherent owner-section
  replacement unit and collapses stale parent/child duplicate canon.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Consumer summaries defer to this owner section and Contracts_V0 for payload fields.
- Stale peer Firecrawl owner bodies are not preserved beside current provider capability/routing canon.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_184
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_owner_section_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0094
preserved_exact_tokens:
- Firecrawl
- '## 10'
- '### 10.3'
- '### 10.7'
- single owner-level Firecrawl subtree
- distinct provider
- Packet regeneration
- stale parent
- child bodies
- peer canon
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md,
  ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Duplicate stale parent/child Firecrawl owner bodies are retired as peer canon.
owner_hints:
- Plans/Tools.md
```

### T-114 - Firecrawl Provider Identity And Defaults

```yaml
plan_unit_id: T-114
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl identity is provider ID `firecrawl`, display name `Firecrawl`, default priority below Exa/Tavily
  and above DDG, user-adjustable ordering, and disabled until API key or self-hosted URL configuration.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Firecrawl identity and defaults are preserved exactly.
- Stale cited-search/newtools residue remains retired from owner/provider canon.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_provider_identity_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0095
preserved_exact_tokens:
- firecrawl
- Firecrawl
- below Exa, Tavily; above DDG (user-adjustable)
- disabled (requires API key or self-hosted URL)
- '"stale cited-search framing and older `newtools` wording"'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Exact stale residue "stale cited-search framing and older `newtools` wording" is retired from Firecrawl owner/provider canon.
owner_hints:
- Plans/Tools.md
```

### T-115 - Firecrawl Configuration Field Boundary

```yaml
plan_unit_id: T-115
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: 'Firecrawl configuration preserves `enabled`, `api_key`, `base_url`, `timeout_ms`, `cache_enabled`, `proxy_mode?:
  "basic" | "enhanced" | "auto"` default `"auto"`, `timeout_ms?: number` default `60000`, and the self-hosted Fire Engine
  limitation.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-114
unblocks: []
acceptance_criteria:
- '`timeout_ms` remains provider-level configuration, not per-invocation `timeout`.'
- Provider-reference implementation notes stay non-normative unless Firecrawl documents them.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_config_timeout_proxy_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0095
preserved_exact_tokens:
- enabled
- api_key
- base_url
- timeout_ms
- cache_enabled
- 'proxy_mode?: "basic" | "enhanced" | "auto"'
- '"auto"'
- '60000'
- /enhanced/auto
- webfetch
- Fire Engine
- Node.js/TypeScript (Express)
- Redis
- playwright-service
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-116 - Firecrawl Method-Locked Endpoint Inventory

```yaml
plan_unit_id: T-116
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl endpoint inventory and PM operation routing are exact and method-locked for search, extract, research,
  crawl, map, fetch, and batch fetch.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-114
unblocks: []
acceptance_criteria:
- Every endpoint/method pair remains preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_endpoint_inventory_method_lock
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0096
preserved_exact_tokens:
- /v2/scrape
- /v2/crawl
- /v2/map
- /v2/search
- /v2/extract
- /v2/batch/scrape
- /v2/agent
- websearch -> POST /v2/search
- webextract -> POST /v2/extract
- webresearch -> POST /v2/agent
- webcrawl -> POST /v2/crawl
- webmap -> POST /v2/map
- webfetch -> POST /v2/scrape
- batch_webfetch -> POST /v2/batch/scrape
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-117 - Firecrawl Provider Capability Exclusion

```yaml
plan_unit_id: T-117
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Provider-side capability names are adapter-lineage only unless future provider contracts map them; PM does
  not add them to `WebAction` or expose arbitrary provider code execution as a first-class user tool.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- Provider capability labels do not expand the PM WebAction enum.
- Arbitrary provider code execution is not exposed as a first-class user tool.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_provider_capability_exclusion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0096
preserved_exact_tokens:
- executeJavascript
- scrape
- pdf
- adapter-lineage only
- WebAction
- arbitrary provider code execution
- first-class user tool
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-118 - Firecrawl Webextract Adapter Mapping

```yaml
plan_unit_id: T-118
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webextract` maps PM `url` to provider `urls: [url]`, maps JSON Schema to provider `schema`, keeps PM one-URL
  validation, and keeps provider options typed/audit-boundary only.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- No unconfirmed PM parameter is exposed.
- PM validates scope before adapter dispatch.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_webextract_adapter_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- webextract
- url
- 'urls: [url]'
- JSON Schema
- schema
- enableWebSearch
- urlTrace
- showSources
- strictConstrainToURLs
- URL wildcards
- domain-wide extraction
- one-URL constraint
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-119 - Firecrawl Webresearch Agent Mapping

```yaml
plan_unit_id: T-119
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webresearch` accepts `task: string`, maps PM `task` to provider `prompt`, returns `multi-source result +
  sources/provenance`, and treats `max_sources` only as approximate `maxCredits` for credit-limited provider routing.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- Mapping does not imply chaining, autonomous behavior, or a full behavioral spec beyond the web operation runtime contract.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_webresearch_agent_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- webresearch
- 'task: string'
- prompt
- multi-source result + sources/provenance
- max_sources
- maxCredits
- provider_firecrawl_agent
- pm_research_composed
- depth_hint
- spark-1-mini
- spark-1-pro
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-120 - Firecrawl Websearch Transform And Filters

```yaml
plan_unit_id: T-120
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`websearch` preserves supported source/category filters, flattens source-partitioned `{ web, images, news
  }` responses into PM `results`, tags each item with `source_type`, and keeps fixed merge order.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- Domain and time filter mappings remain exact.
- If Firecrawl cannot enforce include/exclude domains natively, PM applies filtering post-search.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_websearch_transform_filter_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- '["web", "news", "images"]'
- '["github", "research", "pdf"]'
- '{ web: [...], images: [...], news: [...] }'
- results
- source_type
- web results first, then news, then images
- include_domains
- exclude_domains
- scrapeOptions.includeTags
- time_range
- tbs
- 'formats: ["markdown"]'
- 'onlyMainContent: true'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/storage-plan.md#4.4
  Activity transparency payloads'
compatibility_only_notes: []
stale_retired_dispositions:
- Firecrawl search does not map PM `include_domains` to `scrapeOptions.includeTags`; that source mapping is retired as unconfirmed.
owner_hints:
- Plans/Tools.md
```

### T-121 - Firecrawl Crawl Map Cache Change Tracking

```yaml
plan_unit_id: T-121
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`webmap`, `webcrawl`, cache policy, and `changeTracking` preserve PM-owned limits, sitemap errors, cache
  defaults, adapter cache mapping, and PM-owned crawl diff persistence.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- '`changeTracking` cannot disappear silently.'
- Firecrawl provider `changeTracking` output is subordinate to PM persistence, comparison, and audit semantics.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_crawl_map_cache_change_tracking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- map_timeout
- map_no_sitemap
- 'use_sitemap?: "include" | "only" | "skip"'
- include|only|skip
- ignoreRobotsTxt
- delay
- webhook callback
- max_pages = 25
- limit of 10000
- 'cache_policy?: { max_age_seconds?: number, store?: boolean }'
- cache_ttl
- maxAge
- minAge
- storeInCache
- changeTracking
- change_status
- new
- same
- changed
- removed
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-122 - Firecrawl Browser Capability Endpoint Boundary

```yaml
plan_unit_id: T-122
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl interact/browser capabilities are sub-features through `/v2/scrape` `actions` or the interact-session
  flow, not standalone PM core endpoints or separate `/v2` endpoint families.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, activity,
  or browser/provider disclosure surfaces.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- No separate `/v2` endpoint family is invented for PM core web operations.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_browser_capability_endpoint_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- /v2/scrape
- actions
- interact-session flow
- not standalone PM core endpoints
- separate `/v2` endpoint families
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-123 - Firecrawl Batch Operation Row Coverage

```yaml
plan_unit_id: T-123
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl mapping coverage preserves all PM operation rows, including exact batch extraction and scrape rows.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- Batch webfetch and batch webextract mapping rows remain preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_batch_operation_mapping_coverage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0097
preserved_exact_tokens:
- batch_webfetch
- batch_webextract
- POST /v2/extract
- urls[]
- POST /v2/batch/scrape
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-124 - Firecrawl Async Polling And Timeout

```yaml
plan_unit_id: T-124
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Async Firecrawl operations use POST job creation, polling, terminal status mapping, provider `timeout_ms`,
  and partial-result survival on timeout.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-116
unblocks: []
acceptance_criteria:
- Webhooks remain non-MVP unless a future HMAC-verified completion path is enabled.
- Partial materialized results survive timeout.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_async_polling_timeout_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0098
preserved_exact_tokens:
- '{ success: true, id: "<job_id>" }'
- GET /v2/<operation>/<job_id>
- scraping
- processing
- completed
- failed
- cancelled
- timeout_ms
- partial `data`
- X-Firecrawl-Signature
- HMAC-SHA256
- 2s, 4s, 8s, 15s, 30s
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-125 - Firecrawl Progress Cancellation Activity

```yaml
plan_unit_id: T-125
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Long-running web operations emit structured progress, support activity-stream Stop cancellation, return partial
  results with cancellation, and do not render chat/activity complete before terminal status.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, activity,
  or browser/provider disclosure surfaces.
split_recommended: false
depends_on:
- T-124
unblocks: []
acceptance_criteria:
- 'Stop cancellation returns collected partial results with `cancelled: true`.'
- Chat/activity surfaces do not appear complete before terminal status.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_progress_cancellation_activity_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0098
preserved_exact_tokens:
- progress_event
- tool_use_id
- operation
- phase
- detail
- pages_completed
- pages_total
- elapsed_ms
- estimated_remaining_ms
- 'cancelled: true'
- Researching Web
- 'Fetching sites: 5/20 complete'
- appear-complete
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-126 - Firecrawl Cost-Aware Routing

```yaml
plan_unit_id: T-126
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl routing prefers lower `estimated_credit_cost` unless capability, policy, or freshness gives a stronger
  `adapter_selection_reason`; static priority alone is insufficient.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Estimates above 100 credits require cost confirmation before execution.
- The 500 credits cap remains aligned with routing.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_credit_cost_routing_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0099
preserved_exact_tokens:
- estimated_credit_cost
- adapter_selection_reason
- '>100 credits'
- 500 credits
- cost-aware selection
- static priority alone is insufficient
- provider endpoint
- estimated credit class
- ZDR modifier
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-127 - Firecrawl ZDR And Billing Disclosure

```yaml
plan_unit_id: T-127
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: 'Firecrawl costs are advisory routing inputs, ZDR is not MVP, global `firecrawl_zdr?: boolean` controls future
  ZDR, and self-hosted Firecrawl does not use hosted credit billing.'
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, activity,
  or browser/provider disclosure surfaces.
split_recommended: false
depends_on:
- T-126
unblocks: []
acceptance_criteria:
- Batch and agent credit warnings are explicit before dispatch.
- Self-hosted billing exception remains visible.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_zdr_self_hosted_billing_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0099
preserved_exact_tokens:
- 'zeroDataRetention: true'
- 'enterprise: ["zdr"]'
- PM cache is the ONLY persistence layer
- 'firecrawl_zdr?: boolean'
- url_count × per_url_credit_estimate
- estimated_credit_cost
- ignoreInvalidURLs
- maxConcurrency
- 20-2500
- batch_scrape
- batch_webfetch
- self-hosted Firecrawl does not use credit billing
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Legacy `batch_scrape` normalizes to `batch_webfetch`.
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-128 - Firecrawl Interact Session Lifecycle

```yaml
plan_unit_id: T-128
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`/interact` is a stateful multi-turn browser session with scrape, interact, repeated stateful calls, explicit
  cleanup, prompt/code modes, retry behavior, TTL, and non-MVP profile/live-view limits.'
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, activity,
  or browser/provider disclosure surfaces.
split_recommended: false
depends_on:
- T-122
unblocks: []
acceptance_criteria:
- PM does not expose raw provider code execution as a first-class user tool.
- PM does not surface live view URLs as first-class MVP UI.
- Provider interact cleanup remains explicit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_interact_session_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0100
preserved_exact_tokens:
- /interact
- /v2/scrape/{scrapeId}/interact
- scrapeId
- prompt | code
- DELETE /v2/scrape/{scrapeId}/interact
- DOM
- cookies
- scroll position
- codeOptions
- 'language: "nodejs" | "python" | "bash"'
- 2 credits/min
- 7/min
- 10-minute TTL
- 5-minute inactivity timeout
- liveViewUrl
- interactiveLiveViewUrl
- 'profile: { name: string, saveChanges: boolean }'
- /localStorage
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Tools.md#3.5D-web-operation-family-runtime-contract'
compatibility_only_notes:
- Persistent profiles are not MVP for this interact surface.
- Legacy `/localStorage` slash notation is retained only as lineage for canonical `localStorage`.
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-129 - Firecrawl Audit Traceability

```yaml
plan_unit_id: T-129
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Firecrawl audit payloads preserve provider lineage and requested/effective adapter disclosure fields used
  for routing, projection, and audit visibility.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Traceability fields remain contract-owned.
- Requested/effective adapter and execution path fields remain available for routing/audit disclosure.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_audit_traceability_adapter_selection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0101
preserved_exact_tokens:
- firecrawl_credits_used
- firecrawl_cache_state
- firecrawl_scrape_id
- 'firecrawl_scrape_id?: string'
- data.metadata.scrapeId
- requested_adapter_id
- effective_adapter_id
- adapter_selection_reason
- execution_path
- provider_search_native
- pm_search_plus_site_reader
- pm_site_reader
- provider_firecrawl_scrape
- pm_fetch_fallback
- provider_firecrawl_agent
- pm_research_composed
- projection_freshness
- projection_health
- warnings_count
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget, Plans/Contracts_V0.md#3.4 Tool-specific payload
  extensions, Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/Permissions_System.md#3.4A Web-operation permission-key
  derivation, Plans/Contracts_V0.md#3.4A Web error taxonomy and applicability'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-130 - Firecrawl Permission And Deployment Disclosure

```yaml
plan_unit_id: T-130
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: PM must not silently switch hosted/self-hosted Firecrawl, deployment mode remains visible, and web permission
  approval summaries defer to Permissions_System and approval-card owners.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, transparency, activity,
  or browser/provider disclosure surfaces.
split_recommended: false
depends_on:
- T-129
unblocks: []
acceptance_criteria:
- Six web tools remain independently visible and ask-gated unless stricter read-only/no-network presets deny them.
- Hosted/self-hosted deployment mode remains visible.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_permission_deployment_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0101
preserved_exact_tokens:
- PM MUST NOT silently switch
- no silent switch between self-hosted Firecrawl and hosted/cloud Firecrawl
- deployment-mode disclosure remains visible
- tool.denied
- tool.invoked
- websearch summary shows tool name + query preview
- webfetch/webextract summary shows tool name + target host/URL
- webresearch summary shows tool name + task summary + estimated source count when available
- webcrawl/webmap summary shows tool name + root URL + page/depth caps
- deny
- once
- for session
- always
- question default `allow` only when HITL is available
- read_only
- plan
- blocked_reason_code
- allowed_action_ids[]
- 'status: "unavailable"'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Permissions_System.md#3.4A Web-operation permission-key derivation'
- 'ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4A
  Web error taxonomy and applicability'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-131 - Firecrawl Error Taxonomy And Retired Aliases

```yaml
plan_unit_id: T-131
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: 'Firecrawl HTTP and provider errors map to PM canonical error codes; unmapped `success: false` preserves provider
  detail in `error_message`; `stealth` and legacy `scrape_id` are retired.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-129
unblocks: []
acceptance_criteria:
- '`autonomous_budget_exceeded` remains a soft error with partial results.'
- Original provider detail is preserved in `error_message` for otherwise unmapped provider errors.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_provider_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_185
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: firecrawl_error_taxonomy_retired_aliases
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0101
preserved_exact_tokens:
- HTTP 401/403 → `adapter_unavailable`
- HTTP 429 → `rate_limited`
- HTTP 402 → `rate_limited`
- HTTP 500/502/503 → `adapter_unavailable`
- Timeout → `timeout`
- crawl_timeout
- content_not_found
- invalid_input
- crawl_robots_blocked
- content_blocked
- content_too_large
- autonomous_budget_exceeded
- answer_summary
- sources_used_count
- research_steps
- stealth
- scrape_id (retired alias)
- error_message
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Legacy Firecrawl/browser `stealth` configuration is retired for PM web tools.
- Legacy `scrape_id` is retired as an incorrect canonical field name and may appear only as transfer lineage.
owner_hints:
- Plans/Tools.md
```

### T-132 - Provider Stack And Firecrawl Defaults

```yaml
plan_unit_id: T-132
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Global provider ordering is Settings-configurable, per-operation priority override is not MVP, and Firecrawl
  identity/default state carry through without overriding section 10 canon.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on:
- T-113
- T-114
unblocks: []
acceptance_criteria:
- Provider stack stays user-changeable in Settings.
- Firecrawl remains `firecrawl` / `Firecrawl`, below Exa/Tavily and above DDG, disabled until API key or self-hosted URL.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: provider_stack_firecrawl_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- global provider stack
- per-operation priority reordering is NOT MVP
- Provider ID
- firecrawl
- Display name
- Firecrawl
- Default priority
- disabled (requires API key or self-hosted URL)
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Exact stale residue "stale cited-search framing and older `newtools` wording" remains retired.
owner_hints:
- Plans/Tools.md
```

### T-133 - Capability Tier Preservation

```yaml
plan_unit_id: T-133
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Provider capability tier is separate from routing posture; real provider fetch, research, and crawl capability
  is not erased by Site Reader primacy.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Firecrawl/Tavily/Exa `webfetch` do not collapse to `fallback-only`.
- Anthropic/OpenAI search stays `native (model)` / model-native.
- DuckDuckGo partial crawl behavior remains preserved.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: provider_capability_tier_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- capability-tier
- fallback-only
- native (model)
- pm_composed
- pm-composed
- native-ish
- near-native
- partial
- unsupported
- Site Reader primacy
- Firecrawl `webfetch` capability is not erased
- Tavily `webfetch` capability is not erased
- Exa `webfetch` capability is not erased
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-134 - Exa Same-Operation Fallback Disclosure

```yaml
plan_unit_id: T-134
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Exa free-plan routing can run without a user key, but rate-limit or outage falls to the next eligible same-operation
  provider with visible chat and audit disclosure.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`numResults=8` is preserved.'
- Rate-limit fallback does not hard-stop the operation.
- '`provider_fallback_summary` appears in chat activity and audit.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: exa_same_operation_fallback_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- free tier
- without an API key
- numResults=8
- provider_fallback_summary
- same operation
- PM does NOT stop
- Settings > Providers
- DuckDuckGo
- rate-limit
- outage
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-135 - DDG And Google Adapter Boundary

```yaml
plan_unit_id: T-135
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: DuckDuckGo is best-effort/no-key and Google is an optional pluggable adapter slot, not a strategic hard dependency.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- DDG remains `native-ish` wrapper/scraping-based.
- Google display label stays `Google`.
- Official Google constraints and optional SERP adapter posture remain explicit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: ddg_google_adapter_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- DuckDuckGo
- /no-key
- Nipurn123/duckduckgo-mcp
- https://html.duckduckgo.com/html/?q=
- cheerio
- /nav/etc
- /strategic
- Google
- '2027-01-01'
- 100 free queries/day
- $5 per 1,000
- 10,000/day
- /search-provider
- Google Programmable Search / Custom Search JSON API
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-136 - Provider Settings Capability Disclosure

```yaml
plan_unit_id: T-136
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Settings, `/web` help, and autocomplete disclose provider availability, support tier, health/error, and last
  failure at row or badge level.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Help remains inline tooltip or below-field text, not a separate page.
- Provider classes remain `account-backed | API-backed | no-key`.
- Model-native providers do not expose a separate web-search API key field.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: provider_settings_capability_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- row-level health/error disclosure
- last-failure messaging
- contextual help text
- /web help/autocomplete
- support-tier badges
- /configuration/availability
- account-backed | API-backed | no-key
- enabled/disabled state
- provider priority / fallback order
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-137 - Tavily Settings Controls

```yaml
plan_unit_id: T-137
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tavily is an optional premium/official API-key provider with enable, API key, and provider priority at top
  level; advanced provider options stay behind an expandable Advanced section.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Top-level Settings expose only enable/disable, API key, and provider priority.
- Advanced section owns search depth, domain, time/news/topic/image/raw/chunk fields.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tavily_settings_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- Tavily
- API key
- Advanced
- search_depth
- max_results
- include_domains
- exclude_domains
- time_range
- /time-range
- topic
- include_images
- include_raw_content
- chunks_per_source
- provider priority ordering
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-138 - Tavily Search-Then-Extract Economics

```yaml
plan_unit_id: T-138
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tavily search returns candidate URLs/snippets first and may enrich later, but Tavily extract does not replace
  native Site Reader in MVP.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`include_raw_content` defaults conservative/false for discovery.'
- Free-tier/PAYG economics and `ultra-fast/fast/basic/advanced` values are preserved.
- Extract remains additive future enrichment only.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tavily_search_extract_economics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0103
preserved_exact_tokens:
- free tier = 1,000 credits/month
- $0.008/credit PAYG
- ultra-fast/fast/basic/advanced
- search-then-extract
- include_raw_content
- 'false'
- Tavily extract must NOT replace native Site Reader
- ADDITIVE
- not MVP
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-139 - Support Tier Vocabulary

```yaml
plan_unit_id: T-139
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Support tiers are canonical capability labels and `pm-composed` is display/source-lineage alias for stored
  `pm_composed`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All eight tier labels survive.
- Site Reader primacy remains routing posture, not capability erasure.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: support_tier_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0104
preserved_exact_tokens:
- native
- native (model)
- native-ish
- near-native
- pm_composed
- pm-composed
- fallback-only
- partial
- unsupported
- Site Reader primacy
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-140 - Provider Operation Capability Matrix

```yaml
plan_unit_id: T-140
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The Exa/Tavily/Firecrawl/Anthropic-OpenAI/Google/DDG operation matrix is canonical for `websearch` through
  `webmap`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-139
unblocks: []
acceptance_criteria:
- Matrix row values remain exact.
- '`fallback-only` cannot replace real fetch capability.'
- Unsupported map/crawl branches keep PM-composed conditions.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: provider_operation_capability_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0105
preserved_exact_tokens:
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
- partial native-ish / pm_composed
- unsupported unless PM composes it
- provider-native
- /deep-research
- search_and_crawl
- fallback-only
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-141 - Model-Native Auth And Tool-Key Boundary

```yaml
plan_unit_id: T-141
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Model-native web search reuses configured provider account, auth, and model; `web_search` remains provider
  convention, not the PM tool key.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on:
- T-140
unblocks: []
acceptance_criteria:
- No second auth silo is created for model-native search.
- Settings shows provider, effective account, model, auth, and rate-limit summary.
- PM tool key remains `websearch`.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: model_native_auth_tool_key_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0105
preserved_exact_tokens:
- web_search
- websearch
- enabled toggle
- capability badges
- effective account label
- effective model
- auth state
- rate-limit summary
- second auth silo
- model-native
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-142 - Web Routing Selection And Recovery

```yaml
plan_unit_id: T-142
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Routing normalizes operation/input, checks permissions and capability registry, chooses an eligible same-operation
  adapter, and returns setup guidance or `adapter_unavailable` when exhausted.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-140
unblocks: []
acceptance_criteria:
- '`search_provider` is not exposed as a tool parameter.'
- Fallback records `provider_fallback_occurred` and `provider_fallback_summary`.
- All-provider failure returns `adapter_unavailable`, not a success-shaped fallback.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_routing_selection_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- capability-unavailable terminal branch
- 'Step 1: NORMALIZE OPERATION'
- 'Step 5: QUERY CAPABILITY MATRIX'
- search_provider
- NOT exposed
- adapter_unavailable
- provider_fallback_occurred
- provider_fallback_summary
- /rate-limit/outage
- /unconfigured
- success-shaped fallback
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-143 - Site Reader Identity And Browser Labels

```yaml
plan_unit_id: T-143
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: '`Reading Site: <url>` is reserved exclusively for PM-native Site Reader with browser interaction metadata,
  while provider fetch uses `Fetching Site: <url> (via <provider>)`.'
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on:
- T-142
unblocks: []
acceptance_criteria:
- Provider-routed fetch never reuses Site Reader identity.
- Browser interaction is metadata/sub-annotation, not a new activity label.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: site_reader_identity_browser_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- 'Reading Site: <url>'
- 'Fetching Site: <url> (via <provider>)'
- reserved EXCLUSIVELY
- real browser-interaction capability
- 'interaction: true'
- (with browser interaction)
- seventh web activity label
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-144 - Web Provenance And Citation Strength

```yaml
plan_unit_id: T-144
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Final claims cite the actual read/extract/research/crawl/map path, with search snippets allowed only as visibly
  snippet-level provenance.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on:
- T-142
- T-143
unblocks: []
acceptance_criteria:
- Strongest provenance order is preserved.
- Repeated URLs and mapped page sets dedupe without losing strongest provenance badge.
- Snippet-only citations are labeled as snippet-level provenance.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_provenance_citation_strength
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- 'Searching Web: <query>'
- 'Extracting Site: <url>'
- 'Researching Web: <task>'
- 'Crawling Site: <url>'
- 'Mapping Site: <url>'
- site_reader
- site_extract
- research_synthesis
- crawl_result
- map_result
- search_snippet
- raw search snippets alone are not enough provenance
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-145 - Cost-Aware Routing And Completion Audit

```yaml
plan_unit_id: T-145
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Routing is cost-aware when providers are similar and completion records output, cache/diff, and audit metadata.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on:
- T-142
unblocks: []
acceptance_criteria:
- Static priority alone is insufficient.
- '`>100 credits` warning and `500 credits` cap stay aligned.'
- '`cache_policy` and `change_tracking` completion behavior is preserved.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: cost_aware_routing_completion_audit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- '>100 credits'
- 500 credits
- cost-aware selection
- static priority alone is insufficient
- cache_policy
- change_tracking
- tool output contract
- audit events
- routing metadata
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-146 - NL Dispatcher And Cited Search Workflow

```yaml
plan_unit_id: T-146
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Natural-language and slash web intents share dispatcher mappings, and cited web search performs search, selected
  read/fetch, then final cited answer.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-142
- T-143
- T-144
unblocks: []
acceptance_criteria:
- Reading intents resolve to `webfetch`, not `websearch`.
- Command tables and routing docs mirror the same mappings.
- Provider helper names do not become PM-owned tool names.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: nl_dispatcher_cited_search_workflow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- '"search the web for X" → `websearch`'
- '"extract this page" → `webextract`'
- '"read this URL" → `webfetch`'
- '"research topic" → `webresearch`'
- cited-web-search
- legacy `cited-search`
- 'Web search: <query>'
- /webfetch
- /citations
- site/page reading is not search
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes:
- '`cited-search` is legacy wording only.'
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-147 - Research Lineage And Subagent Boundary

```yaml
plan_unit_id: T-147
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Source-specific research may use read-only sub-agents, but the main coordinator owns ledger updates and anonymized
  synthesis.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-142
unblocks: []
acceptance_criteria:
- Sub-agents must not perform concurrent ledger writes.
- Topic and competitor lineage remains exact.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: research_lineage_subagent_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0106
preserved_exact_tokens:
- topic-01
- topic-02
- topic-03
- topic-07
- topic-08
- topic-09
- topic-10
- topic-11
- topic-13
- topic-18
- topic-19
- topic-21
- topic-24
- topic-26
- topic-28
- topic-29
- topic-34
- topic-35
- topic-38
- topic-43
- topic-45
- competitor-cursor
- competitor-kiro
- competitor-vscode
- competitor-jetbrains
- /code/issue/community
- must not perform concurrent ledger writes
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
- 'ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4
  Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-148 - Batch Error And Audit Semantics

```yaml
plan_unit_id: T-148
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: 'Batch operations preserve explicit `continue_on_error: false` behavior and parent/child audit event shape.'
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`continue_on_error: false` stops on first failure and returns completed results plus failure detail.'
- Per-URL results preserve route-specific provenance and execution fields.
- '`action_results` remains excluded from batch outputs.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: batch_error_audit_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0107
preserved_exact_tokens:
- 'continue_on_error: false'
- stop on the first failure
- return completed results plus failure detail
- parent audit event for the batch
- child audit events per URL
- tool.invoked
- provenance_badge
- execution_path
- action_results
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-149 - Batch Permission Session Grant

```yaml
plan_unit_id: T-149
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: One approval prompt covers all unique domains in mixed-host batches and `For Session` grants all listed domains
  for that session.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- No per-host prompts are created.
- Prompt lists every unique domain in scope.
- For Session grants all listed domains for that session.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: batch_permission_session_grant
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0107
preserved_exact_tokens:
- single confirmation prompt
- all unique domains
- mixed-host URL batches
- PM does not issue per-host prompts
- For Session
- per-host separate prompts
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-150 - Batch Inputs Concurrency And Timeout

```yaml
plan_unit_id: T-150
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Batch webfetch and batch webextract retain exact URL limits, shared option semantics, concurrency bounds,
  and locked timeout formula.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Batch webfetch maxes at 50 URLs with default concurrency 3 and max 10.
- Batch webextract maxes at 10 URLs with default concurrency 3 and max 10.
- Batch-level timeout remains `individual_timeout × min(url_count, 5)`, cap 600s.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: batch_inputs_concurrency_timeout
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0107
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:14
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:11
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:20
- Plans/Tools.md:623
- Plans/Tools.md:669
- Plans/Tools.md:2160
- Plans/Tools.md:2163
- Plans/Tools.md:2164
preserved_exact_tokens:
- 'urls: string[]'
- 'formats?: string[]'
- 'cache_policy?: object'
- 'change_tracking?: boolean'
- 'pdf_mode?: string'
- 'schema_mode?: string'
- 'detail_hint?: string'
- 'concurrency?: number'
- default 3
- max 10
- max 5
- individual_timeout × min(url_count, 5)
- 600s
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- The older batch_webextract max concurrency 5 line is stale; the accepted canonical max concurrency is 10.
owner_hints:
- Plans/Tools.md
```

### T-151 - Web Cache Two-Phase Adapter Validation

```yaml
plan_unit_id: T-151
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: PM web cache performs adapter-agnostic lookup before provider selection and validates `adapter_id` after selection,
  discarding mismatched hits.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`(url, formats_hash)` lookup precedes adapter choice.'
- Cache state vocabulary remains exact.
- Mismatched adapter hits are discarded before fresh fetch.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_cache_two_phase_adapter_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0108
preserved_exact_tokens:
- (url, formats_hash)
- adapter_id
- hit
- miss
- bypassed
- expired_used_for_diff
- normalized_url
- formats_hash
- 'cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"'
- two-phase cache-check
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/storage-plan.md#8. Web content caching persistence'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-152 - Web Cache Actions Diff And Storage Guardrails

```yaml
plan_unit_id: T-152
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Action requests bypass read-time cache but may store final results; PM cache precedes Firecrawl cache, and
  change tracking compares fresh content to prior entries.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on:
- T-151
unblocks: []
acceptance_criteria:
- Per-project 500 MB, TTL, LRU, stable ordering, and change detection persistence are preserved.
- Question/questionnaire and TODO storage carry-through are not overwritten by web cache/activity payloads.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: web_cache_actions_diff_storage_guardrails
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0108
preserved_exact_tokens:
- actions
- always fresh-execute
- Cache STORE
- PM cache takes precedence
- Firecrawl cache serves as provider-side optimization only
- 500 MB
- TTL
- LRU
- per-project
- 'change_tracking: true'
- content_hash
- 'change_status: "changed"'
- diff_summary
- 'change_status: "same"'
- 'change_status: "removed"'
- Question/questionnaire session state persistence
- TODO schema persistence
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/storage-plan.md#8. Web content caching persistence'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-153 - Tools Web Owner Consumer Boundary

```yaml
plan_unit_id: T-153
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tools remains the SSOT for tool-level web behavior, provider capability, and cache-routing while storage,
  provider bridge, newtools, and OpenCode surfaces remain narrower consumers or adjacent references.
gui_related: true
gui_classification_reason: This PlanUnit includes GUI, UI, user-visible presentation, settings, routing, help, activity, or
  provider disclosure surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Consumer docs reference Tools rather than restating tool definitions.
- Firecrawl/web obligations remain traceable.
- Stale permission/LSP/web-output markers are retired as owner text.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tools_web_owner_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0109
preserved_exact_tokens:
- Tools are defined SSOT
- UI, CLI, Help, Permissions
- cache-routing / cache routing
- OpenCode billing and /caching
- HARDER
- '### 3.5C'
- '### 3.5D'
- '## 10'
- '### 10.3'
- '### 10.7'
- '### 11.1'
- '## 14'
- obl-013
- obl-014
- obl-041
- obl-053
- obl-054
- obl-062
- obl-066
- obl-067
- obl-029
- obl-040
- obl-043
- obl-068
- /LSP/web-output
- /web-output/LSP/permission
- legacy `web-output`
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale permission, LSP, and web-output carry-through markers such as `/LSP/web-output`, `/web-output/LSP/permission`, and
  legacy `web-output` phrasing are retired as owner text.
owner_hints:
- Plans/Tools.md
```

### T-154 - Blocked Notice Consumer Propagation

```yaml
plan_unit_id: T-154
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Blocked surfaces must carry richer `blocked_notice` semantics beyond `blocked_family` and `allowed_action_ids[]`.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`escalation_level`, `action_available` ownership, and usage observability are carried through blocked_notice handling.'
- '`allowed_action_ids[]` remains subordinate to richer blocked_notice semantics if present.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: blocked_notice_consumer_propagation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0111
preserved_exact_tokens:
- blocked_notice
- blocked_family
- allowed_action_ids[]
- escalation_level
- action_available
- usage observability
- subordinate
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-155 - Tool Attribution Runtime Identity Shape

```yaml
plan_unit_id: T-155
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Tool records share one attribution family across tool events, runtime artifacts, receipts, and usage records.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Run, attempt, thread, node, artifact, provider, and usage anchors plus runtime identity fields are carried.
- Execution-role, account-switch, pressure, blocked-sequence, startup recovery, DAE, and usage switch-history ownership follow
  through.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_attribution_runtime_identity_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0113
preserved_exact_tokens:
- run/attempt/thread/node/artifact/provider/usage
- execution_role
- requested_account_id
- operational_identity
- account-switch
- pressure
- blocked_sequence
- startup recovery handshake
- DAE jail/approval policy
- usage switch-history
- usage execution-role follow-through
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-156 - Tools Migration Owner Map Boundary

```yaml
plan_unit_id: T-156
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Source-preserving standardization keeps Tools owner/consumer boundaries in the original body text while cross-doc
  ownership follows ContractRefs and boundary notes.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- '`Plans/Tools.md` remains owner for preserved behavior.'
- Plan Document System and Bootstrap Migration refs stay attached.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_provider_routing_contract_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_186
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tools_migration_owner_map_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0114
preserved_exact_tokens:
- source-preserving standardization
- Plans/Tools.md remains the owner doc
- cross-doc ownership follows the ContractRefs
- Owner / Consumer Map
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```

### T-001 - Adding Tool Support Generated Artifact Residual

```yaml
plan_unit_id: T-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Tools.md
canonical_text: >-
  T-001 is retired as active source-preserving product coverage after Phase 2B batch 187. Tools-S0001 through
  Tools-S0115 are covered by fine-grained T-002 through T-156 or explicit structural/split coverage, while Tools-S0116
  through Tools-S0117 are generated PlanUnits and Migration Coverage audit material. T-001 remains only a generated-artifact
  residual for migration lineage and must not override implementation-facing Tools PlanUnits.
gui_related: true
gui_classification_reason: >-
  The retired generated residual preserves GUI-bearing historical bridge metadata from Tools-S0116, but the live T-001
  disposition is migration/audit lineage rather than product GUI coverage.
split_recommended: false
depends_on:
- T-002
- T-003
- T-004
- T-005
- T-006
- T-007
- T-008
- T-009
- T-010
- T-011
- T-012
- T-013
- T-014
- T-015
- T-016
- T-017
- T-018
- T-019
- T-020
- T-021
- T-022
- T-023
- T-024
- T-025
- T-026
- T-027
- T-028
- T-029
- T-030
- T-031
- T-032
- T-033
- T-034
- T-035
- T-036
- T-037
- T-038
- T-039
- T-040
- T-041
- T-042
- T-043
- T-044
- T-045
- T-046
- T-047
- T-048
- T-049
- T-050
- T-051
- T-052
- T-053
- T-054
- T-055
- T-056
- T-057
- T-058
- T-059
- T-060
- T-061
- T-062
- T-063
- T-064
- T-065
- T-066
- T-067
- T-068
- T-069
- T-070
- T-071
- T-072
- T-073
- T-074
- T-075
- T-076
- T-077
- T-078
- T-079
- T-080
- T-081
- T-082
- T-083
- T-084
- T-085
- T-086
- T-087
- T-088
- T-089
- T-090
- T-091
- T-092
- T-093
- T-094
- T-095
- T-096
- T-097
- T-098
- T-099
- T-100
- T-101
- T-102
- T-103
- T-104
- T-105
- T-106
- T-107
- T-108
- T-109
- T-110
- T-111
- T-112
- T-113
- T-114
- T-115
- T-116
- T-117
- T-118
- T-119
- T-120
- T-121
- T-122
- T-123
- T-124
- T-125
- T-126
- T-127
- T-128
- T-129
- T-130
- T-131
- T-132
- T-133
- T-134
- T-135
- T-136
- T-137
- T-138
- T-139
- T-140
- T-141
- T-142
- T-143
- T-144
- T-145
- T-146
- T-147
- T-148
- T-149
- T-150
- T-151
- T-152
- T-153
- T-154
- T-155
- T-156
unblocks: []
acceptance_criteria:
- Tools-S0001 through S0115 remain mapped to fine-grained Tools PlanUnits or explicit structural dispositions rather than
  T-001.
- Tools-S0116 through S0117 remain available as generated PlanUnits and Migration Coverage audit material only.
- T-001 no longer uses node_compile_hint.mode source_preserving_planunit; that token is preserved only as migration lineage.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source
  code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: tools_generated_residual_tail
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: generated_artifact_residual
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0116
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0117
preserved_exact_tokens:
- source_preserving_planunit
- generated_artifact_residual
- Migration Coverage
- PlanUnits
- Tools-S0116
- Tools-S0117
- T-001 - Adding Tool Support -- Research & Plan Source-Preserving PlanUnit
- T-001 - Adding Tool Support Generated Artifact Residual
- Migration Coverage
negative_constraints:
- T-001 must not provide product implementation coverage for Tools-S0001 through Tools-S0115 after Phase 2B batch 186.
- T-001 must not override T-002 through T-156 or later fine-grained Tools PlanUnits.
- T-001 must not use source_preserving_planunit compile mode after Phase 2B batch 187.
preserved_contractrefs:
- Generated PlanUnits and Migration Coverage material remain preserved by span_map and coverage_map as migration-lineage audit
  material.
compatibility_only_notes:
- The source_preserving_planunit token is preserved only as retired migration lineage and not as an active node_compile_hint
  mode.
- The old Tools T-001 bridge title is a compatibility alias for audit and search only.
stale_retired_dispositions:
- The former T-001 source-preserving bridge is retired as active product coverage; product coverage lives in T-002 through
  T-156 and coverage_map rows.
- Generated Tools-S0116 through Tools-S0117 are not product implementation canon.
owner_hints:
- Plans/Tools.md
```

## Migration Coverage

Original hash: `01fed36dead4538803197fcd86d37c352a3950e47715306fc216511d5f524f7f`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 181 atomized `Tools-S0001` through `Tools-S0023` into fine-grained PlanUnits `T-002` through `T-020`. Phase 2B batch 182 atomized `Tools-S0024` through `Tools-S0033` into fine-grained PlanUnits `T-021` through `T-043`. Phase 2B batch 183 atomized `Tools-S0034` through `Tools-S0055` into fine-grained PlanUnits `T-044` through `T-082` and structurally dispositioned `Tools-S0048`. Phase 2B batch 184 atomized `Tools-S0056` through `Tools-S0094` into fine-grained PlanUnits `T-083` through `T-113` and structurally dispositioned `Tools-S0075` and `Tools-S0076`. Phase 2B batch 185 atomized `Tools-S0095` through `Tools-S0101` into fine-grained PlanUnits `T-114` through `T-131` and structurally dispositioned `Tools-S0102`. Phase 2B batch 186 atomized `Tools-S0103` through `Tools-S0114` into fine-grained PlanUnits `T-132` through `T-156` and structurally dispositioned `Tools-S0110`, `Tools-S0112`, and `Tools-S0115`. Phase 2B batch 187 retired `T-001` from active `source_preserving_planunit` mode into `generated_artifact_residual` lineage for generated `Tools-S0116` through `Tools-S0117`; it must not override the fine-grained units. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## Ledger Compile Addendum - pldg-20260614-001

### T-157 - Tool Section And Subagent Registry Reference Recovery

```yaml
plan_unit_id: T-157
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Tools.md must repair missing Section 9 and duplicate Section 10 through Section 14 numbering as structural anchor cleanup, and task-tool
  subagent validation must consume the live subagent_registry instead of a stale inline or count-based subagent list. Count phrases such as
  42 subagent types are compatibility/source-lineage until registry generation proves them current.
gui_related: false
gui_classification_reason: Tool schema and section numbering are backend/tooling documentation contracts, not visual presentation.
depends_on: [T-055, T-056, T-104]
unblocks: []
acceptance_criteria:
  - Section references such as Tools.md Section 12 resolve unambiguously after cleanup.
  - task tool subagent_type validation routes through subagent_registry.
  - Stale count-based subagent lists do not become live registry authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual Tools heading/anchor review
risk_class: tool_anchor_and_registry_drift
reasoning_tier: standard
context_scope: tools_doc_structure_and_subagent_validation
implementation_surfaces: [Plans/Tools.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: tools_anchor_registry_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0020
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0034
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0040
  - source_ref:Plans/Tools.md:884
preserved_exact_tokens: ["Tools.md is missing §9", "duplicate §10–§14 numbering", "Tools.md §12", "subagent_type", "subagent_registry", "42 subagent types"]
negative_constraints:
  - Do not promote stale inline subagent lists over subagent_registry.
  - Do not change tool permission semantics during numbering repair.
owner_hints: [Plans/Tools.md, Plans/orchestrator-subagent-integration.md]
```

## Ledger Compile Addendum - pldg-20260615-001

### T-158 - Extract Block Semantics Normalization

```yaml
plan_unit_id: T-158
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Tools.md extract-style `Fields:`, `Labels and values:`, `Permission rules:`,
  and `Rules:` lists are implementation-ready only when each token is interpreted
  through the section Core rules and the tool owner boundary. Web, LSP, batch,
  caching, provider routing, change-tracking, capability-unavailable, and
  search-then-read behavior must preserve exact field names, operation names,
  provider labels, enum/status values, compatibility aliases, and rule fragments
  without mixing them into one untyped schema list. Tools owns web tool/routing
  semantics and tool-level behavior; assistant-chat-design and FinalGUISpec consume
  chat cards and GUI presentation, and storage/contracts own persistence and event
  envelopes.
gui_related: false
gui_classification_reason: This unit defines tool-routing and schema interpretation; GUI/chat consumers are referenced but do not make Tools the visual owner.
depends_on: []
unblocks: []
acceptance_criteria:
  - Tools implementers can distinguish tool input fields, provider labels, enum/status values, aliases, and lifecycle/routing rules.
  - "`Serper-backed Google-result behavior`, `sources`, `categories`, Firecrawl routing, LSP operation names, and search-then-read behavior remain exact and auditable."
  - Chat and GUI presentation stay in assistant-chat-design and FinalGUISpec rather than becoming Tools-owned display canon.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, Rust/Slint app scaffolds, legacy Iced app files, or production build tasks are created; explicit governance/index/evidence refreshes are recorded in the repair/seal artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260615-001-part-4-fable-cleanup
risk_class: tools_extract_semantic_loss
reasoning_tier: high
context_scope: tools_extract_block_cleanup
implementation_surfaces:
  - Plans/Tools.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: tools_extract_block_semantics_normalization
  create_worknodes: false
source_lineage:
  - pldg-20260615-001-part-4-fable-cleanup:atom-0008
  - pldg-20260615-001-part-4-fable-cleanup:atom-0009
  - pldg-20260615-001-part-4-fable-cleanup:atom-0010
  - pldg-20260615-001-part-4-fable-cleanup:atom-0011
  - pldg-20260615-001-part-4-fable-cleanup:atom-0012
  - local:Plans/Tools.md:2039
  - local:Plans/Tools.md:2113
  - local:Plans/Tools.md:2169
preserved_exact_tokens:
  - "Fields:"
  - "Rules:"
  - "Labels and values:"
  - "Serper-backed Google-result behavior"
  - "sources"
  - "categories"
  - "goToImplementation"
  - "ok | partial | unavailable | error"
  - "websearch"
  - "webfetch"
  - "webextract"
  - "webresearch"
  - "webcrawl"
  - "webmap"
  - "search-then-read behavior"
negative_constraints:
  - Do not delete exact tokens or compatibility aliases during cleanup.
  - Do not turn Tools.md into a GUI display owner.
  - Do not move assistant-chat operation-card/question/TODO behavior into Tools.md.
compatibility_only_notes:
  - Remaining source extract lists marked as compatibility/source-lineage token banks preserve exact terms while typed field, label, action, and rule semantics route through Core rules and owner docs.
owner_hints:
  - Plans/Tools.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
```

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### T-159 - Automated Test Tool Capability Discovery Consumer

```yaml
plan_unit_id: T-159
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Tools consumes Automated_Testing_System capability discovery for browser automation, GUI automation, device/emulator automation, screenshot capture, logs, app launch, headless/headed modes, project-native test runners, and official testing option research. For web projects, once Puppet Master is built, Puppet Master built-in browser automation is the primary native web test automation path; Playwright can remain optional, fallback, or project-native. Slint live preview/live reload is a Puppet Master build example only and must not become the default testing assumption for all user projects.
  For web testing, Playwright optional remains fallback or project-native rather than the native default.
gui_related: true
gui_classification_reason: Browser automation, GUI automation, emulator sessions, screenshots, and visual evidence are user-visible tool surfaces.
depends_on: [ATS-001, ATS-002, ATS-004]
unblocks: [ATS-002, ATS-004, RAP-029]
acceptance_criteria:
  - Tools can report browser, GUI, device/emulator, screenshot, log, launch, headless/headed, and native runner capabilities to Automated_Testing_System.
  - Built-in browser automation is the preferred native path for web testing once available.
  - Playwright remains optional/fallback/project-native and Slint remains an example only.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future tool capability discovery tests
risk_class: testing_tool_assumption_drift
reasoning_tier: standard
context_scope: automated_test_tool_capabilities
implementation_surfaces: [Plans/Tools.md, Plans/Automated_Testing_System.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: test_tool_capability_discovery, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0028
  - pldg-20260617-001-plans-to-code-handoff:atom-0030
  - pldg-20260617-001-plans-to-code-handoff:atom-0031
  - pldg-20260617-001-plans-to-code-handoff:dec-0014
  - pldg-20260617-001-plans-to-code-handoff:corr-0008
preserved_exact_tokens:
  - "browser automation"
  - "emulator"
  - "Puppet Master built-in browser automation"
  - "Playwright optional"
  - "Slint"
  - "example only"
negative_constraints:
  - Do not hyper-focus automated testing around Slint.
  - Do not default native Puppet Master web testing to Playwright when the built-in browser can do it.
owner_hints:
  - Plans/Tools.md
  - Plans/Automated_Testing_System.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md

## Ledger Compile Addendum - pldg-20260622-001-fff

### T-160 - Native DiscoveryService Shared Substrate

```yaml
plan_unit_id: T-160
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Puppet Master owns a native fff-inspired DiscoveryService as one shared substrate for agent tools and GUI surfaces from day one. DiscoveryService provides ranked path/context candidates under the same FileSafe, permissions, ignore, freshness, fallback, remote/cache/SSH, and no-leak policy envelope for Assistant Chat, Planning Wizard, PRD Builder, Orchestrator, Executor, File Manager, Quick Open, and compatible path-picking surfaces. Direct fff remains reference/evidence/prototype-only; product canon does not depend on a direct fff runtime dependency and does not create separate agent and GUI rankers.
gui_related: false
gui_classification_reason: This defines the shared backend/tool substrate; GUI consumers are covered in their owner docs.
depends_on: [T-012, T-014, T-015, T-046, T-050, T-051]
unblocks: [T-161, T-162, CV-291, F3-399, ACD-422, OSI-429]
acceptance_criteria:
  - Agent and GUI discovery consumers can route to the same DiscoveryService contract.
  - The same FileSafe, permissions, ignore, freshness, fallback, remote/cache/SSH, and no-leak policy envelope applies to every consumer.
  - Direct fff and OpenCode details remain source-lineage/reference/prototype-only.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: shared_tool_contract_drift
reasoning_tier: standard
context_scope: cross_surface_discovery
implementation_surfaces: [Plans/Tools.md, future DiscoveryService, future discover_paths tool route]
node_compile_hint: {mode: discovery_service_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0012
  - pldg-20260622-001-fff:atom-0014
  - pldg-20260622-001-fff:atom-0018
  - pldg-20260622-001-fff:atom-0019
  - pldg-20260622-001-fff:atom-0020
  - pldg-20260622-001-fff:atom-0022
  - pldg-20260622-001-fff:atom-0026
  - pldg-20260622-001-fff:atom-0031
  - pldg-20260622-001-fff:atom-0034
  - pldg-20260622-001-fff:atom-0046
  - pldg-20260622-001-fff:atom-0047
  - pldg-20260622-001-fff:atom-0048
  - pldg-20260622-001-fff:state/doc_impact_matrix.json#DIM-002
  - pldg-20260622-001-fff:state/subagent_compile_proposals.json#Helmholtz
source_atom_ids: [atom-0012, atom-0014, atom-0018, atom-0019, atom-0020, atom-0022, atom-0026, atom-0031, atom-0034, atom-0046, atom-0047, atom-0048]
preserved_exact_tokens: ["native PM-owned", "fff-inspired", "DiscoveryService", "one shared substrate", "agent tools", "GUI surfaces", "FileSafe", "permissions", "ignore", "freshness", "fallback", "direct fff", "OpenCode"]
negative_constraints:
  - Do not add a direct fff runtime dependency as the product direction.
  - Do not create separate undisclosed agent and GUI rankers.
  - Do not bypass FileSafe, permission, ignore, freshness, fallback, or no-leak policy envelopes.
owner_hints: [Plans/Tools.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/FinalGUISpec.md]
```

### T-161 - discover_paths Operation And Request/Result Behavior

```yaml
plan_unit_id: T-161
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  The agent-facing discovery operation is discover_paths, delegating to DiscoveryService. DiscoveryRequest carries request_id, consumer_id, surface_type, project/worktree or remote identity, query_text, intent, target_kind, limit, budget_ms, current_context, policy_context, redaction_profile, and permission/approval/SSH trust fields where applicable. DiscoveryResult returns ranked candidates with result_id, rank, canonical_path_identity, display_path, path_kind, target_kind, score_total, score_breakdown, match_type, policy-filtered matched_ranges when available, provenance, freshness_state, fallback_state, policy_decision, source_index_generation, requires_exact_verification, and verification_handoff. Discovery receipts use discovery.invoked, discovery.candidates_returned, discovery.selected, discovery.fallback, discovery.verified, discovery.disabled, discovery.unsupported, and discovery.backpressure. The allowed values for discover_paths request, result, receipt_event, and error_code fields come from the CV-291 canonical exact value registry.
gui_related: false
gui_classification_reason: This is the tool/API behavior contract; GUI presentation is owned by GUI docs.
depends_on: [T-160, CV-291, T-072]
unblocks: [OSI-429, EP-106, ATS-011, RAP-031]
acceptance_criteria:
  - discover_paths requests/results use discovery-local enum values from the CV-291 canonical exact value registry.
  - Result payloads always carry freshness_state, fallback_state, policy_decision, provenance, and requires_exact_verification.
  - Ambient invocation is bounded to materially useful repo/source-location tasks and skipped for exact verified paths, pure chat, user denial, policy blocks, disabled/unsupported, or backpressure states.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: tool_schema_drift
reasoning_tier: standard
context_scope: discovery_tool_contract
implementation_surfaces: [Plans/Tools.md, Plans/Contracts_V0.md, future discover_paths tool route]
node_compile_hint: {mode: discover_paths_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0023
  - pldg-20260622-001-fff:atom-0035
  - pldg-20260622-001-fff:atom-0036
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0076
  - pldg-20260622-001-fff:atom-0051
  - pldg-20260622-001-fff:atom-0088
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:state/precision_contract.json
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#shared_agent_tool_discover_paths
source_atom_ids: [atom-0023, atom-0035, atom-0036, atom-0051, atom-0063, atom-0076, atom-0088, atom-0092]
preserved_exact_tokens: ["discover_paths", "DiscoveryRequest", "DiscoveryResult", "request_id", "consumer_id", "surface_type", "intent", "target_kind", "path_kind", "match_type", "score_breakdown", "freshness_state", "fallback_state", "policy_decision", "error_code", "receipt_event", "requires_exact_verification", "verification_handoff", "discovery.invoked", "discovery.candidates_returned", "discovery.selected", "discovery.fallback", "discovery.verified", "discovery.disabled", "discovery.unsupported", "discovery.backpressure"]
negative_constraints:
  - Do not make discover_paths a grep replacement.
  - Do not expose raw private frecency/query/open history to agents by default.
  - Do not interpret ambient discovery as search-everything-every-turn behavior.
owner_hints: [Plans/Tools.md, Plans/Contracts_V0.md]
```

### T-162 - Path Discovery Versus Content Search Boundary

```yaml
plan_unit_id: T-162
unit_type: constraint
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  DiscoveryService is path/context discovery, not a second content regex engine. MVP discovery covers file, directory, file_or_directory, module, test, doc, config, content_candidate, and mixed target kinds for locating candidate paths or context. content_candidate is a handoff hint only and never verified content-search output. Exact content verification remains with Instant Grep, grep, codesearch, AST/LSP, tests, or domain-specific checks before edits, root-cause claims, verifier pass, or final summaries.
gui_related: false
gui_classification_reason: This is a tool boundary and verification rule, not visual presentation.
depends_on: [T-046, T-050, T-051, T-160, T-161]
unblocks: [EP-106, ATS-011]
acceptance_criteria:
  - Search panel path narrowing may use DiscoveryService only to narrow path/context candidates.
  - Final content results and correctness claims come from content-search, AST/LSP, tests, or domain verification owners.
  - content_candidate is never treated as verified text content.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: content_search_boundary_drift
reasoning_tier: standard
context_scope: tools_search_boundary
implementation_surfaces: [Plans/Tools.md, future DiscoveryService, future grep/codesearch/Instant Grep routes]
node_compile_hint: {mode: boundary_constraint, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0031
  - pldg-20260622-001-fff:atom-0041
  - pldg-20260622-001-fff:atom-0050
  - pldg-20260622-001-fff:atom-0060
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0076
  - pldg-20260622-001-fff:atom-0088
  - pldg-20260622-001-fff:state/doc_impact_matrix.json#DIM-003
source_atom_ids: [atom-0031, atom-0041, atom-0050, atom-0060, atom-0063, atom-0076, atom-0088]
preserved_exact_tokens: ["content_candidate", "Instant Grep", "grep", "codesearch", "AST/LSP", "exact verification", "path/context discovery", "not a second content regex engine"]
negative_constraints:
  - Do not create a second regex/content-search canon beside Instant Grep, grep, or codesearch.
  - Do not allow DiscoveryService ranking to substitute for exact content verification.
owner_hints: [Plans/Tools.md, Plans/LSPSupport.md]
```

### T-163 - Discovery Rollout Scheduler And Backpressure Guardrails

```yaml
plan_unit_id: T-163
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  DiscoveryService adoption uses one shared rollout surface with project/user discovery.enabled, a developer/operator kill switch, explicit discovery.disabled and discovery.unsupported receipt behavior, and no silent behavior drift. Discovery scheduling deduplicates equivalent requests, cancels superseded GUI queries quickly, bounds index refresh concurrency, preserves fairness between GUI and background/agent work, prevents thundering-herd refreshes, and emits over_budget or discovery.backpressure receipts when budgets or resource caps require degraded behavior.
gui_related: true
gui_classification_reason: Scheduler and rollout behavior affect GUI cancellation, visible disabled/unsupported/backpressure states, and user-facing degraded behavior.
depends_on: [T-160, T-161, CV-291]
unblocks: [F3-399, ATS-011]
acceptance_criteria:
  - Disabled, unsupported, over-budget, and backpressure states produce explicit receipts or visible degraded states instead of silent fallback.
  - Superseded GUI discovery queries cancel within the configured cancellation target.
  - Agent/background discovery cannot starve GUI queries or trigger unbounded refresh storms.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future scheduler tests for dedupe, cancellation, fairness, concurrency, and backpressure.
  - Future Assistant Chat and GUI degraded-state tests.
risk_class: rollout_scheduler_drift
reasoning_tier: standard
context_scope: discovery_runtime_guardrails
implementation_surfaces: [Plans/Tools.md, future DiscoveryService scheduler, future GUI query surfaces]
node_compile_hint: {mode: scheduler_guardrail_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0024
  - pldg-20260622-001-fff:atom-0081
  - pldg-20260622-001-fff:atom-0084
  - pldg-20260622-001-fff:atom-0089
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:state/implementation_gap_defaults.json
  - pldg-20260622-001-fff:state/precision_contract.json#performance_resource_budgets
source_atom_ids: [atom-0024, atom-0081, atom-0084, atom-0089, atom-0092]
preserved_exact_tokens: ["discovery.enabled", "kill switch", "discovery.disabled", "discovery.unsupported", "dedupe", "GUI cancellation", "bounded index refresh concurrency", "GUI/background fairness", "over_budget", "backpressure", "thundering herd"]
negative_constraints:
  - Do not create a parallel discovery canon or bypass the shared DiscoveryService substrate.
  - Do not silently degrade disabled, unsupported, over-budget, or backpressure states into success-shaped results.
owner_hints: [Plans/Tools.md, Plans/FinalGUISpec.md, Plans/Automated_Testing_System.md]
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### T-165 - PM Native Vision Bridge Tool Contract

```yaml
plan_unit_id: T-165
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: PM exposes a native vision_bridge / see_image tool or capability for non-vision models. It automatically
  runs when the selected model lacks image input and can be manually rerun when the user or model needs a fresh
  image description. The tool adapts the opencode-see-image pattern, including tool invocation and never-guess guidance,
  but does not install, vendor, or depend on the OpenCode plugin, OpenCode provider defaults, OpenCode auth/database/CLI
  surfaces, Bun, or dangerous OpenCode permission flags. Failures are explicit and fail closed rather than fabricating
  image contents.
gui_related: true
gui_classification_reason: The tool processes images/screenshots and exposes user-visible fallback and degraded
  states.
depends_on:
- MGAC-099
- MS-116
- PP-055
- PS-121
unblocks:
- RAP-035
- ACD-425
- ATS-013
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_bridge_tool_drift
reasoning_tier: high
context_scope: vision_bridge_tool_contract
implementation_surfaces:
- Plans/Tools.md
- future vision_bridge tool
- future see_image tool
node_compile_hint:
  mode: vision_bridge_tool_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0069
- pldg-20260626-001-feature-name:atom-0070
- pldg-20260626-001-feature-name:atom-0071
- pldg-20260626-001-feature-name:atom-0072
- pldg-20260626-001-feature-name:atom-0073
- pldg-20260626-001-feature-name:atom-0081
- pldg-20260626-001-feature-name:atom-0086
- chat:opencode-see-image-request
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- local:/tmp/pm-ext-opencode-see-image
- Plans/Provider_OpenCode.md
- chat:vision-bridge-defaults-answer
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/Prompt_Pipeline.md
- Plans/FinalGUISpec.md
source_atom_ids:
- atom-0069
- atom-0070
- atom-0071
- atom-0072
- atom-0073
- atom-0081
- atom-0086
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- opencode-see-image
- see_image
- models models without vision
- adopt it to PM
- image
- screenshot
- https://github.com/alfaoz/opencode-see-image
- cde1615f6dfc9039c58da6813112ee53391b5b49
- 1.1.0
- MIT
- bun
- /tmp/pm-ext-opencode-see-image
- experimental.chat.system.transform
- OpenCode SQLite
- part
- screenshotSearchDirs
- SEE_IMAGE_MODEL
- SEE_IMAGE_PROVIDER
- minimax-m3
- opencode-go
- mimo-v2.5-free
- never guess image contents
- that is for Opencode
- OpenCode plugin APIs
- auth.json
- opencode.db
- Bun
- opencode run
- --dangerously-skip-permissions
- vision_bridge
- image input
- automatically
- manually rerun
- 1. yes
- permission denied
- no eligible vision route
- provider unavailable
- auth expired
- timeout
- unsupported/corrupt/too-large image
- missing file/artifact
- empty clipboard
- ambiguous recent screenshot
- redaction blocked
- 'yes'
- structured prompt/output contract
- bounded question/task
- uncertainty
- notable text/OCR
- limitations
- safety/redaction notes
- source refs
- not raw image bytes
negative_constraints:
- Do not let non-vision models guess image contents when a bridge is available.
- Do not treat image input as image generation.
- Do not compile this requirement to canonical Plans without a future explicit compile request.
- Do not vendor or import the external repo into PM as canonical code during this ledger-only planning thread.
- Do not assume the repo's OpenCode-specific runtime dependencies are PM requirements.
- Do not claim local selftests passed because `bun` was unavailable.
- Do not copy OpenCode's SQLite/session model as PM's source of truth.
- Do not hardcode `opencode-go`, `minimax-m3`, or `mimo-v2.5-free` as PM defaults without an explicit provider-routing
  decision.
- Do not carry over OpenCode-specific prompt injection unchanged.
- Do not make OpenCode the owner of PM media tools.
- Do not use OpenCode provider capability reporting as a substitute for PM-native media capability records.
- Do not introduce a provider-specific dependency where a PM-native tool/capability can serve all provider routes.
- Do not force every model route through the bridge when the active model already has reliable native image input.
- Do not hide from the user that derived visual context came from a separate model/tool route.
- Do not let the non-vision model fabricate visual details if bridge execution fails or is denied.
- Do not let the non-vision model infer or guess image contents after bridge failure.
- Do not serialize failed, revoked, blocked, expired, or omitted image artifacts as successful prompt content.
- Do not show a generic failure when PM can provide a concrete reason code and next action.
- Do not pass raw image bytes into non-vision model context when artifact refs plus bounded derived text are the
  contract.
- Do not omit uncertainty or limitations from bridge output when the image is ambiguous or low-confidence.
- Do not let image text/OCR become hidden, unsourced prompt material.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
- Plans/MCP_Integration.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/Contracts_V0.md
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### T-167 - P0-TOOL-RESULT-SETTLEMENT

```yaml
plan_unit_id: T-167
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P0-TOOL-RESULT-SETTLEMENT (P0) is compiled as canonical Puppet Master intent for Partial/truncated/nullable provider tool turns cannot count as success: Add no-lossy-success rule: a tool/model turn is not successful until required content/result/error/truncation metadata is retained and normalized. Length truncation is `partial_truncated`, not success. The preserved PM gap/delta is: Need explicit `ToolTurnSettlement` state machine for provider native turns: success, partial, truncated, malformed, nullable-content, redacted, retained, retryable, fatal. The observed external-repo signal remains source-lineage evidence: Agent Zero issue list reports finish_reason=length treated as success and causing unbounded retry; Cline issue list reports large MCP tool_result crash; Pi issue list reports null content/reasoning during tool use; Codex issue list has redaction-hook timing for tool output.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- finish_reason=length with tool call is classified partial_truncated.
- nullable reasoning/content arrays are normalized without crashing and without dropping provider-native metadata.
- large MCP tool_result is stored as managed output ref or rejected with explicit retention failure.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- finish_reason=length with tool call is classified partial_truncated.
- nullable reasoning/content arrays are normalized without crashing and without dropping provider-native metadata.
- large MCP tool_result is stored as managed output ref or rejected with explicit retention failure.
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
- Plans/Models_System.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p0_tool_result_settlement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0009
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0009
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0005/P0-TOOL-RESULT-SETTLEMENT@line=5
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0005/P0-TOOL-RESULT-SETTLEMENT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:5
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0009
external_atom_id: extrepo-20260703-0005
source_row_id: P0-TOOL-RESULT-SETTLEMENT
priority: P0
finding_family: Partial/truncated/nullable provider tool turns cannot count as success
source_repos:
- agent0ai/agent-zero
- cline/cline
- earendil-works/pi
- openai/codex
target_docs:
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
- Plans/Models_System.md
- Plans/storage-plan.md
owner_hints:
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
- Plans/Models_System.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0005
- P0-TOOL-RESULT-SETTLEMENT
- P0
- Partial/truncated/nullable provider tool turns cannot count as success
- agent0ai/agent-zero
- cline/cline
- earendil-works/pi
- openai/codex
negative_constraints: []
observed_signal: Agent Zero issue list reports finish_reason=length treated as success and causing unbounded retry; Cline issue list reports large MCP tool_result crash; Pi issue list reports null content/reasoning during tool use; Codex issue list has redaction-hook timing for tool output.
pm_current_coverage: PM has normalized tool outcomes and provider bridge output preservation requirements.
pm_gap_or_delta: 'Need explicit `ToolTurnSettlement` state machine for provider native turns: success, partial, truncated, malformed, nullable-content, redacted, retained, retryable, fatal.'
proposal_or_recommendation: 'Add no-lossy-success rule: a tool/model turn is not successful until required content/result/error/truncation metadata is retained and normalized. Length truncation is `partial_truncated`, not success.'
compile_disposition: create_new_planunit
```

### T-168 - P2-CACHEABLE-TOOL-OUTPUT-REFS

```yaml
plan_unit_id: T-168
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P2-CACHEABLE-TOOL-OUTPUT-REFS (P2) is compiled as canonical Puppet Master intent for Hash-addressed cache refs for stable large tool outputs: Large stable outputs use refs with TTL/redaction; secrets are never cached; model-visible preview references complete retained output.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Large stable outputs use refs with TTL/redaction
- secrets are never cached
- model-visible preview references complete retained output.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Large stable outputs use refs with TTL/redaction
- secrets are never cached
- model-visible preview references complete retained output.
risk_class: p2_context_cache_coverage
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/Tools.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: p2_cacheable_tool_output_refs
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0056
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0056
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0052/P2-CACHEABLE-TOOL-OUTPUT-REFS@line=16
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0052/P2-CACHEABLE-TOOL-OUTPUT-REFS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:16
source_atom_ids:
- atom-0056
external_atom_id: extrepo-20260703-0052
source_row_id: P2-CACHEABLE-TOOL-OUTPUT-REFS
priority: P2
finding_family: Hash-addressed cache refs for stable large tool outputs
target_docs:
- Plans/Tools.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
owner_hints:
- Plans/Tools.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
preserved_exact_tokens:
- extrepo-20260703-0052
- P2-CACHEABLE-TOOL-OUTPUT-REFS
- P2
- Hash-addressed cache refs for stable large tool outputs
negative_constraints: []
proposal_or_recommendation: Large stable outputs use refs with TTL/redaction; secrets are never cached; model-visible preview references complete retained output.
compile_disposition: create_new_planunit
```

### T-169 - P0-TOOL-CALL-MALFORMATION-GATE

```yaml
plan_unit_id: T-169
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P0-TOOL-CALL-MALFORMATION-GATE (P0) is compiled as canonical Puppet Master intent for Malformed/truncated/partial tool-turn admission: Add ProviderToolTurnAdmissionGate. Only settled tool calls with valid schema, args, IDs, provider-native metadata, and truncation state can enter replayable history. Rejected turns become provider_turn_malformed records with raw-redacted reference and loop policy. The preserved PM gap/delta is: Malformed provider output must be stopped before durable history admission, not only before actual tool execution. The observed external-repo signal remains source-lineage evidence: OpenCode, Cline, Agent Zero, and Pi all show broken tool-call deltas, XML/JSON fragments, nullable reasoning/content, stringified MCP params, truncation, empty tool calls, and loops when malformed turns reach history or repair logic.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Partial streamed JSON/tool XML never becomes replayable assistant history.
- A length finishReason on tool-call deltas blocks/retries under typed policy, not as ordinary no-tool response.
- Replayed history never includes malformed or duplicate tool_call IDs.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Partial streamed JSON/tool XML never becomes replayable assistant history.
- A length finishReason on tool-call deltas blocks/retries under typed policy, not as ordinary no-tool response.
- Replayed history never includes malformed or duplicate tool_call IDs.
risk_class: p0_mcp_tools_and_tool_settlement_hardening
reasoning_tier: high
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p0_tool_call_malformation_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0065
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0065
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0061/P0-TOOL-CALL-MALFORMATION-GATE@line=7
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0061/P0-TOOL-CALL-MALFORMATION-GATE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:7
source_atom_ids:
- atom-0065
external_atom_id: extrepo-20260703-0061
source_row_id: P0-TOOL-CALL-MALFORMATION-GATE
priority: P0
finding_family: Malformed/truncated/partial tool-turn admission
source_repos:
- OpenCode
- Cline
- Agent Zero
- Pi
target_docs:
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/storage-plan.md
owner_hints:
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- Plans/Provider_OpenCode.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0061
- P0-TOOL-CALL-MALFORMATION-GATE
- P0
- Malformed/truncated/partial tool-turn admission
- OpenCode
- Cline
- Agent Zero
- Pi
negative_constraints: []
observed_signal: OpenCode, Cline, Agent Zero, and Pi all show broken tool-call deltas, XML/JSON fragments, nullable reasoning/content, stringified MCP params, truncation, empty tool calls, and loops when malformed turns reach history or repair logic.
pm_current_coverage: Tools already has invalid arg/truncated invocation structured failures and a rich tool outcome taxonomy.
pm_gap_or_delta: Malformed provider output must be stopped before durable history admission, not only before actual tool execution.
proposal_or_recommendation: Add ProviderToolTurnAdmissionGate. Only settled tool calls with valid schema, args, IDs, provider-native metadata, and truncation state can enter replayable history. Rejected turns become provider_turn_malformed records with raw-redacted reference and loop policy.
compile_disposition: create_new_planunit
```

### T-170 - P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS

```yaml
plan_unit_id: T-170
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS (P1) is compiled as canonical Puppet Master intent for Token efficiency for tools, skills, MCP, and docs: Define CapabilityCatalogMaterialization: L0 names/descriptions, L1 selected metadata, L2 full schema/instructions, L3 runtime docs/examples; all permission-filtered and cache-stable. The preserved PM gap/delta is: PM needs an explicit L0/L1/L2 materialization policy for tool, skill, MCP, media, terminal, browser, and memory capabilities. The observed external-repo signal remains source-lineage evidence: Codex Skills use progressive disclosure; OpenCode/Cline show tool/MCP schema bloat; Agent Zero issue notes full tool descriptions repeated into prompts.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Default context never includes all full MCP schemas.
- Tool search can materialize a selected tool without losing rich-result parser path.
- Permission changes invalidate catalog slice.
- Token budget reports catalog materialization cost.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Default context never includes all full MCP schemas.
- Tool search can materialize a selected tool without losing rich-result parser path.
- Permission changes invalidate catalog slice.
- Token budget reports catalog materialization cost.
risk_class: p1_mcp_tools_and_tool_settlement_hardening
reasoning_tier: standard
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Tools.md
- Plans/MCP_Integration.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: p1_progressive_disclosure_tools_skills
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0072
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0072
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0068/P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS@line=14
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0068/P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:14
source_atom_ids:
- atom-0072
external_atom_id: extrepo-20260703-0068
source_row_id: P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS
priority: P1
finding_family: Token efficiency for tools, skills, MCP, and docs
source_repos:
- Codex
- OpenCode
- Cline
- Agent Zero
target_docs:
- Plans/Tools.md
- Plans/MCP_Integration.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
owner_hints:
- Plans/Tools.md
- Plans/MCP_Integration.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
preserved_exact_tokens:
- extrepo-20260703-0068
- P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS
- P1
- Token efficiency for tools, skills, MCP, and docs
- Codex
- OpenCode
- Cline
- Agent Zero
negative_constraints: []
observed_signal: Codex Skills use progressive disclosure; OpenCode/Cline show tool/MCP schema bloat; Agent Zero issue notes full tool descriptions repeated into prompts.
pm_current_coverage: PM has MCP schema caps, tool registry, skill/tool GUI surfaces, and tool usage rollups.
pm_gap_or_delta: PM needs an explicit L0/L1/L2 materialization policy for tool, skill, MCP, media, terminal, browser, and memory capabilities.
proposal_or_recommendation: 'Define CapabilityCatalogMaterialization: L0 names/descriptions, L1 selected metadata, L2 full schema/instructions, L3 runtime docs/examples; all permission-filtered and cache-stable.'
compile_disposition: create_new_planunit
```

### T-171 - P0-COMMAND-INVOCATION-CONTRACT

```yaml
plan_unit_id: T-171
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P0-COMMAND-INVOCATION-CONTRACT (P0) is compiled as canonical Puppet Master intent for Command intent shape: shell-string vs argv vs PowerShell wrapper vs PTY/TUI command: Imported external-repo finding extrepo-20260703-0077 / P0-COMMAND-INVOCATION-CONTRACT (P0): None The preserved PM gap/delta is: Terminal protocol/paste safety was covered, but PM still needs an explicit CommandInvocationContract separate from terminal rendering and tool settlement. The observed external-repo signal remains source-lineage evidence: Cline issue #12047 reports structured {command: 'ls -la foo'} being posix_spawned as the entire executable, causing ENOENT. | Codex recent issues include one-shot approval for inspected PowerShell wrappers and command-safety hardening prevents unsafe helpers/hooks/parser execution. | Ghostty paste security fixes show terminal input can become command execution unexpectedly.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Every command tool call states invocation_kind=shell_string|argv|powershell_script|pty_input|tui_automation and interpreter identity.
- Approval UI displays the exact effective command form and quoting/escaping interpretation.
- A shell string cannot be silently executed as argv[0], and argv cannot be silently routed through a shell.
- PowerShell wrapper execution requires inspected-wrapper receipts and one-shot approval when configured.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Every command tool call states invocation_kind=shell_string|argv|powershell_script|pty_input|tui_automation and interpreter identity.
- Approval UI displays the exact effective command form and quoting/escaping interpretation.
- A shell string cannot be silently executed as argv[0], and argv cannot be silently routed through a shell.
- PowerShell wrapper execution requires inspected-wrapper receipts and one-shot approval when configured.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: p0_command_invocation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0081
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0081
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0077/P0-COMMAND-INVOCATION-CONTRACT@line=4
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0077/P0-COMMAND-INVOCATION-CONTRACT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:4
source_atom_ids:
- atom-0081
external_atom_id: extrepo-20260703-0077
source_row_id: P0-COMMAND-INVOCATION-CONTRACT
priority: P0
finding_family: 'Command intent shape: shell-string vs argv vs PowerShell wrapper vs PTY/TUI command'
target_docs:
- Tools.md
- Terminal_Integration.md
- Executor_Protocol.md
- Permissions_System.md
- Contracts_V0.md
owner_hints:
- Tools.md
- Terminal_Integration.md
- Executor_Protocol.md
- Permissions_System.md
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0077
- P0-COMMAND-INVOCATION-CONTRACT
- P0
- 'Command intent shape: shell-string vs argv vs PowerShell wrapper vs PTY/TUI command'
negative_constraints: []
observed_signal: 'Cline issue #12047 reports structured {command: ''ls -la foo''} being posix_spawned as the entire executable, causing ENOENT. | Codex recent issues include one-shot approval for inspected PowerShell wrappers and command-safety hardening prevents unsafe helpers/hooks/parser execution. | Ghostty paste security fixes show terminal input can become command execution unexpectedly.'
pm_gap_or_delta: Terminal protocol/paste safety was covered, but PM still needs an explicit CommandInvocationContract separate from terminal rendering and tool settlement.
relationship_to_prior_reports: New P0; complements terminal and tool-call settlement.
compile_disposition: create_new_planunit
```

### T-172 - P0-SESSION-TOOL-NAMESPACE-ACTIVATION

```yaml
plan_unit_id: T-172
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P0-SESSION-TOOL-NAMESPACE-ACTIVATION (P0) is compiled as canonical Puppet Master intent for Runtime-valid plugins/tools that are not actually injected into the session: Imported external-repo finding extrepo-20260703-0078 / P0-SESSION-TOOL-NAMESPACE-ACTIVATION (P0): None The preserved PM gap/delta is: Capability catalogs and tool registries were covered, but not the final active-session namespace proof that a tool family is both configured and injected into this run. The observed external-repo signal remains source-lineage evidence: Codex issue #31023 described a Computer Use/plugin/cache/runtime configuration that was valid, but session tools were not injected and node_repl did not start. | Warp and Codex changelogs show explicit tool/plugin/runtime capability stages and immediate tool refreshes. | Cline and Warp both expose imported third-party agent/tool configs and custom model/provider flows.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Each session has ActiveToolNamespaceReceipt with configured, allowed, injected, visible_to_model, visible_to_ui, and startup status per tool namespace.
- Computer-use/browser/device/media tools are denied with explicit reason if model/provider/session does not receive them.
- Tool mentions, UI chips, and model-visible tool schemas are reconciled from the same session namespace snapshot.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Each session has ActiveToolNamespaceReceipt with configured, allowed, injected, visible_to_model, visible_to_ui, and startup status per tool namespace.
- Computer-use/browser/device/media tools are denied with explicit reason if model/provider/session does not receive them.
- Tool mentions, UI chips, and model-visible tool schemas are reconciled from the same session namespace snapshot.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: p0_session_tool_namespace_activation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0082
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0082
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0078/P0-SESSION-TOOL-NAMESPACE-ACTIVATION@line=5
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0078/P0-SESSION-TOOL-NAMESPACE-ACTIVATION
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:5
source_atom_ids:
- atom-0082
external_atom_id: extrepo-20260703-0078
source_row_id: P0-SESSION-TOOL-NAMESPACE-ACTIVATION
priority: P0
finding_family: Runtime-valid plugins/tools that are not actually injected into the session
target_docs:
- Tools.md
- MCP_Integration.md
- Browser_Integration.md
- Media_Generation_and_Capabilities.md
- FinalGUISpec.md
- Contracts_V0.md
owner_hints:
- Tools.md
- MCP_Integration.md
- Browser_Integration.md
- Media_Generation_and_Capabilities.md
- FinalGUISpec.md
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0078
- P0-SESSION-TOOL-NAMESPACE-ACTIVATION
- P0
- Runtime-valid plugins/tools that are not actually injected into the session
negative_constraints: []
observed_signal: 'Codex issue #31023 described a Computer Use/plugin/cache/runtime configuration that was valid, but session tools were not injected and node_repl did not start. | Warp and Codex changelogs show explicit tool/plugin/runtime capability stages and immediate tool refreshes. | Cline and Warp both expose imported third-party agent/tool configs and custom model/provider flows.'
pm_gap_or_delta: Capability catalogs and tool registries were covered, but not the final active-session namespace proof that a tool family is both configured and injected into this run.
relationship_to_prior_reports: Sharpens CapabilityCatalogMaterialization and MultimodalInputSettlement.
compile_disposition: create_new_planunit
```

### T-173 - P0-TOOL-RESULT-TRUTHFULNESS-GATE

```yaml
plan_unit_id: T-173
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  P0-TOOL-RESULT-TRUTHFULNESS-GATE (P0) is compiled as canonical Puppet Master intent for Tool result truthfulness gate: Imported external-repo finding extrepo-20260703-0094 / P0-TOOL-RESULT-TRUTHFULNESS-GATE (P0): None The preserved PM gap/delta is: ToolTurnSettlement must forbid fabricated placeholders and non-lossy success when resource retention/parse fails. The observed external-repo signal remains source-lineage evidence: Empty tool output can fabricate image placeholder; malformed JSON/tool-call and raw history pollution issues recur.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Empty output remains empty with reason
- Missing image does not become fake caption
- Malformed JSON records parse error and raw captured bytes
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Empty output remains empty with reason
- Missing image does not become fake caption
- Malformed JSON records parse error and raw captured bytes
risk_class: p0_mcp_tools_and_tool_settlement_hardening
reasoning_tier: high
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: p0_tool_result_truthfulness_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0098
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0098
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0094/P0-TOOL-RESULT-TRUTHFULNESS-GATE@line=7
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0094/P0-TOOL-RESULT-TRUTHFULNESS-GATE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:7
source_atom_ids:
- atom-0098
external_atom_id: extrepo-20260703-0094
source_row_id: P0-TOOL-RESULT-TRUTHFULNESS-GATE
priority: P0
finding_family: Tool result truthfulness gate
source_repos:
- Pi
- Agent Zero
- Cline
- OpenCode
preserved_exact_tokens:
- extrepo-20260703-0094
- P0-TOOL-RESULT-TRUTHFULNESS-GATE
- P0
- Tool result truthfulness gate
- Pi
- Agent Zero
- Cline
- OpenCode
negative_constraints: []
observed_signal: Empty tool output can fabricate image placeholder; malformed JSON/tool-call and raw history pollution issues recur.
pm_gap_or_delta: ToolTurnSettlement must forbid fabricated placeholders and non-lossy success when resource retention/parse fails.
compile_disposition: create_new_planunit
```

### T-174 - tool_output_retention

```yaml
plan_unit_id: T-174
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  tool_output_retention (P0) is compiled as canonical Puppet Master intent for tool_output_retention: Add ToolManagedOutputRef and retention-failure semantics The preserved PM gap/delta is: No hard no-lossy-success rule for managed tool output retention The observed external-repo signal remains source-lineage evidence: OpenCode v2 Tool output bounding/managed storage; large body issues
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Large output fixtures
- retention failure returns ToolFailure/runtime blocker
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Large output fixtures
- retention failure returns ToolFailure/runtime blocker
risk_class: p0_mcp_tools_and_tool_settlement_hardening
reasoning_tier: high
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
node_compile_hint:
  mode: tool_output_retention
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0108
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0108
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0104/tool_output_retention@line=6
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0104/tool_output_retention
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:6
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0108
external_atom_id: extrepo-20260703-0104
source_row_id: tool_output_retention
priority: P0
finding_family: tool_output_retention
target_docs:
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
owner_hints:
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0104
- tool_output_retention
- P0
negative_constraints: []
observed_signal: OpenCode v2 Tool output bounding/managed storage; large body issues
pm_current_coverage: Timeouts and content_ref/map_ref patterns exist
pm_gap_or_delta: No hard no-lossy-success rule for managed tool output retention
proposal_or_recommendation: Add ToolManagedOutputRef and retention-failure semantics
compile_disposition: create_new_planunit
```

### T-175 - tool_heartbeat

```yaml
plan_unit_id: T-175
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  tool_heartbeat (P0) is compiled as canonical Puppet Master intent for tool_heartbeat: Add ToolProgressHeartbeat contract The preserved PM gap/delta is: Need uniform ProgressHeartbeat, max silent interval, visible stalled state The observed external-repo signal remains source-lineage evidence: OpenCode indefinite task/tool hang issues; MCP progress timeout reset fixes
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Long-running MCP/subagent/browser/device tests
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Long-running MCP/subagent/browser/device tests
risk_class: p0_mcp_tools_and_tool_settlement_hardening
reasoning_tier: high
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/MCP_Integration.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: tool_heartbeat
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0109
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0109
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0105/tool_heartbeat@line=7
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0105/tool_heartbeat
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:7
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0109
external_atom_id: extrepo-20260703-0105
source_row_id: tool_heartbeat
priority: P0
finding_family: tool_heartbeat
target_docs:
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/MCP_Integration.md
- Plans/Automated_Testing_System.md
owner_hints:
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/MCP_Integration.md
- Plans/Automated_Testing_System.md
preserved_exact_tokens:
- extrepo-20260703-0105
- tool_heartbeat
- P0
negative_constraints: []
observed_signal: OpenCode indefinite task/tool hang issues; MCP progress timeout reset fixes
pm_current_coverage: Timeouts for many tool classes exist
pm_gap_or_delta: Need uniform ProgressHeartbeat, max silent interval, visible stalled state
proposal_or_recommendation: Add ToolProgressHeartbeat contract
compile_disposition: create_new_planunit
```
