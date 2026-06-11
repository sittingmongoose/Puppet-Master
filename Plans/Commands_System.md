# Commands System (Canonical SSOT)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status


### 0.1 Command scope and legacy retirements

This document is the **single canonical source of truth** for the Puppet Master User Commands system — user-authored command presets that inject templated prompts into a run. All other plan documents MUST reference this document by anchor (e.g., `Plans/Commands_System.md#COMMAND-SCHEMA`) rather than restating command definitions, discovery paths, template syntax, or execution semantics.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

Command-system reconciliation also covers chat UX, context `/compaction`, Commands, skills `/plugins`, and provider-mapping seams only where they affect User Command invocation, validation, or child-run launch. Plugin installation and skill runtime ownership remain with their own SSOTs; this document owns only whether commands can surface, invoke, or validate those entries without rebinding provider or plugin identity.

User Commands may surface `/resume` only by reference to the Assistant Chat and storage SSOTs; they MUST NOT define a separate restore/resume storage schema.

Legacy `phase_subagents` and provider-native `command-name` assumptions are `/replace`-only migration labels. They MUST NOT remain active beside the Persona-stage command contract.

### SSOT references (DRY)


- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- UICommand dispatch IDs: `Plans/UI_Command_Catalog.md`
- Reserved slash commands: `Plans/assistant-chat-design.md` §5
- Run modes: `Plans/Run_Modes.md`
- Persona system: `Plans/Personas.md`
- Permissions system: `Plans/Permissions_System.md`
- Tool permissions + tool events: `Plans/Tools.md`
- OpenCode baseline (commands): `Plans/OpenCode_Deep_Extraction.md` §7D
- GUI specification: `Plans/FinalGUISpec.md`

### 0.2 Cross-owner consumer boundaries

User Commands consume, but do not re-own, several adjacent runtime and provider contracts. For MCP prompt or tool OAuth flows, command loading and invocation defer to `Plans/Tools.md` `### Schema isolation and OAuth state`; Commands may surface the selected provider/scope and stable `client-id`, but `/token` custody, refresh, retry, and shared local HTTP listener ownership remain keyed by provider+scope semantics in the Tools/MCP owner docs rather than by User Command file or server identity.

For context behavior, Commands defer to `Plans/Run_Modes.md` `## 0. Scope and SSOT status`, `### SSOT references (DRY)`, and `## 7. Mode effects on context management`: `LF-006` and `LF-007` are treated as stale-residue / wrong-owner-routing failures whenever command prose sends detailed context-compilation or `/compaction` readers to `Plans/FileSafe.md` instead of the `Plans/Prompt_Pipeline.md` owner. FileSafe remains the guard over compiled output, not the context-compilation SSOT.

For storage and migration paths, command execution uses the storage owner detection order `config > $PUPPET_MASTER_DATA_DIR > project dir > global dir`; Commands may display the resolved storage-root or pass it through execution context, but migration, persistence, and path-resolution semantics stay in `Plans/storage-plan.md`.

For retry and failure recovery, Commands may expose status and recovery actions, but `429`, `402`, and `/breaker` behavior are owned by the bridge/runtime failure taxonomy in `Plans/CLI_Bridged_Providers.md`, `Plans/Executor_Protocol.md`, and `Plans/Run_Modes.md`. A User Command cannot override no-retry, rate-limit, quota, or circuit-breaker decisions with command-local retry text.

For Assistant Chat message actions, Commands consume the owner-defined `Resend` semantics from `Plans/assistant-chat-design.md` and `Plans/UI_Command_Catalog.md`: `Resend` replays the latest user-authored message and discards later generated history/work, while command presets must not redefine it as a generic retry, rewind, or file-restore action.

For clarification-request and `question-flow` behavior, command presets and wizard entry points defer to the shared question system in `Plans/assistant-chat-design.md` and the planning flow consumer rules in `Plans/chain-wizard-flexibility.md`; Commands may launch or reference those flows but do not define a separate question lifecycle.

For process coordination, Commands consume the resolved project `lock-file` path from the storage/runtime owner contract. The lock location derives from the storage logical-root with any safe-local-fallback defined by `Plans/storage-plan.md`; command templates must not invent an alternate lock directory or persist a stale path beside the owner-derived value.

Command-visible provider context is a projection of provider owners. For bridged providers, `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`) owns the versioned correlation `/context` block and account-health semantics; Commands may surface those values when a command launches or resumes work, but account-health is stronger than auth lifecycle alone and must not be collapsed into command-local credential state. For OpenCode, `Plans/Provider_OpenCode.md` (`/Provider_OpenCode.md`) owns canonical `thread_id` mapping and upstream-account opacity; Commands may pass through the selected `thread_id`, but it cannot infer upstream-account identity when the provider marks it opaque.

Launcher and binary-location context is likewise owner-projected. `Plans/BinaryLocator_Spec.md` and `BinaryLocator_Spec` own OpenCode launcher ownership and binary discovery; Commands may invoke that resolved launcher, but it must treat rewrite-adjacent dead `four-tier` names, process-scope wording, and `/session-scope` wording as stale compatibility labels that cannot define command-local runtime identity.

Command-contract reconciliation is registry-facing, not prose-only. `Commands_System.md`, `Wiring_Matrix.md`, and `UI_Wiring_Rules.md` must keep command-contract `IDs` and validation hooks aligned: `/compact` stays reserved when `cmd.chat.compact_context` exists, `cmd.chat.run_user_command` cannot claim a phantom `chat.message.submitted` event unless the event owner registers it, `cmd.chat.branch_from_restore` remains invalid until it is either registered or marked `/superseded`, and `AC-CMD02`, `AC-CMD07`, and `AC-CMD10` all enforce the same `override_builtin`, reserved-name, `/catalog`, `/actions`, `/mutation`, and projection-freshness boundaries instead of leaving git/actions prefix prohibition as prose-only guidance. The same registry boundary owns slash-command reservation, the command execution seam for User Commands, runtime vs overlay mode semantics, and reverse-coverage enforcement for every normative `cmd.*` reference.

Route-like UICommands may be surfaced beside User Commands, but Commands does not let feature-local labels become private target models. In `Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`), `/UI` rows that still expose graph HITL `request_id` or `hitl_request_id` commands are a same-file contradiction when the same catalog centers canonical runtime recovery commands; those rows must resolve to runtime `blocked_sequence` before acting. First-class object-selection/navigation commands such as `cmd.source_control.select_worktree` must not remain `layout/UI state only` when they perform object-first worktree selection or object-selection. `cmd.artifacts.open_panel`, `cmd.artifacts.show_in_ledger`, `cmd.artifacts.show_in_usage`, `cmd.orchestrator.open_in_source_control`, `cmd.orchestrator.open_in_github_actions`, `cmd.orchestrator.open_in_docker_manager`, graph `/filter` focus commands, chat usage `/open` commands, and `cmd.source_control.select_worktree` must normalize through a shared `/route` route-target / `route_target` / `/subject` subject-open family before they carry object identity. Navigation commands that restore scope must carry `project_id`, `focused_run_id`, `thread_id`, or an equivalent derivation rule instead of being labeled `/UI-state` only. If `cmd.nav` or `cmd.nav.*` is introduced, surface-specific commands either wrap it with explicit `normalizes_to_contract` metadata or remain typed `navigation_wrapper` / `domain_action` specializations; pure `layout/UI state only` shell commands must not silently become object-first navigation commands. `cmd.panel.switch` and `cmd.source_control.switch_subview` stay pure `/view` /view-state commands with controlled destination vocabularies: they may consume normalized routing context, but they must not replace the canonical `route_target` model. `Plans/Contracts_V0.md` (`/Contracts_V0.md`) owns the route-target / `route_target` and subject-open contract family above individual surface commands, while this document owns whether a User Command can invoke or display repo-state inspection, hosted workflow inspection, or chat `/navigation` commands without rebinding them.

Command taxonomy is a three-way split, not a binary split: pure shell/view-state commands, route-consuming navigation commands, and domain mutation/runtime commands. Pure shell/view-state commands stay local and lightweight: they change what panel/subview/layout is visible, but they do not own canonical target identity. Route-consuming navigation commands reveal a specific object or scope and normalize through `route_target`; domain mutation/runtime commands act on canonical runtime or domain identity. `UICommand` remains the dispatch envelope, but `args` must carry a normalized target model when a command is navigation/open/focus-oriented instead of smuggling object identity through generic command-local payloads.

Command palette object results follow the same route model. Because `Plans/FinalGUISpec.md` (`/FinalGUISpec.md`) already defines the global command palette, Commands treats palette exposure as a consumer boundary. The command palette may expose Orchestrator object results, not just commands/pages or `/pages`, but selecting an object result must route through the same `deep-link` contract as Orchestrator search and through the shared `/route` `route_target` / `/subject` subject-open family, not through command-local argument shapes. When those results reference run graph items, `Plans/Run_Graph_View.md` (`/Run_Graph_View.md`) owns the distinction between base `view-model` shape and `runtime-lineage` evidence; Commands may surface the result, but it does not redefine graph state. `Run_Graph_View.md` remains a strong internal contradiction site when later addenda prove the old `tier_id` model is no longer enough, so command results must treat graph context as owner-projected runtime lineage rather than command-local graph state.

Subject-open and route-payload commands exposed from the palette must carry schema-level `argument-contract` requirements from `Plans/Contracts_V0.md`, `Plans/UI_Command_Catalog.md`, and `Plans/UI_Wiring_Rules.md` instead of hiding target identity in generic `args`. Commands may declare that a User Command invokes or displays those route-like UICommands, but the machine-verifiable argument shape remains owned by those route and wiring owners, not by User Command frontmatter.

`UI_Wiring_Rules.md` remains the wiring owner for reusable navigation commands and subject-open commands; Commands treats those as first-class wiring shapes with schema-level route-payload and `argument-contract` obligations, not as generic `args` smuggling.

Command-facing runtime identity is only a consumer of the owner split. `Plans/Prompt_Pipeline.md` defines requested/effective field meaning, `/runtime`, and dispatch presence; `Plans/storage-plan.md` defines persistence and `/projection`; executor docs define required dispatch/runtime boundaries; `Multi-Account.md` owns switch notification and `/history` semantics; and bridged-provider streams own bridged-provider account evidence. Projection trust/freshness and `/freshness` vocabulary must stay separate from preview `/browser` `trust_tier` language so command surfaces do not create a semantic collision between projection health and browser preview trust. Commands may pass or display those values, but it must not invent alternate requested/effective account history or erase switch notifications when launching a command, child run, or route-consuming UICommand.

`persona_override_owner_id` and requested account context are owner-projected runtime identity, not command-local state: shared runtime docs must not let `persona_override_owner_id` preserve `tier_id`-style ownership while wizard/interview flows move to non-tier execution semantics, and command consumers must read `requested_account_binding` so hard-vs-soft account intent is explicit instead of inferred from UI context or switch reasons.

Execution-core context remains owner-routed. `Plans/Executor_Protocol.md`, `Executor_Protocol`, `orchestrator-subagent-integration.md`, `WorktreeGitImprovement.md`, and their runtime owners must reconcile node-native and node-sharded ingest with legacy `tier_id`, tier-keyed, and tier-native execution constructs, including stale dispatch, agent tracking, and remediation paths plus scheduler and worktree isolation interaction. Commands may launch or display execution actions, but package/seam/corroboration/concern-aware execution hooks, lane/worktree-aware scheduling context, singular Overseer / Builder / Verifier retirement, and lane-awareness repairs belong to those runtime owners rather than to command frontmatter. Orchestrator live-context structs must rebase around node/attempt/worktree/permission-aware execution envelopes instead of tier-keyed adapters, and the runtime owners must introduce node/actor/lane-aware execution context into orchestrator runtime structs and active-agent tracking before Commands treats runtime context as canonical command input.

orchestration-core reconciliation is execution-core owner work, not command-surface cleanup. `Executor_Protocol.md` and `orchestrator-subagent-integration.md` are the execution-core outliers when they retain tier-era, tier-shaped `TierContext`, or `tier_runtime_record` canon; Commands treats graph/package/seam/lane/runtime-record and `/package/seam/lane/runtime-record` language, node-native execution, runtime blocked overlays, and `execution_unit_context` as upstream runtime owner contracts so runtime seams do not reappear as surface problems. `TierContext` and `tier_runtime_record` may survive only as derived decomposition/grouping/view/current-view, current-view/runtime-overlay, or `/runtime-overlay` projections; they must not act as the rewrite-era canonical execution context, a canonical execution owner, or a collapse of planner/decomposition helpers with runtime/audit objects.

Widget and native-surface state remains owner-routed when Commands exposes a command or checklist entry. `Plans/Widget_System.md` (`/Widget_System.md`) and `Widget_System` own chrome slots for `/trust-state`, projection-trust semantics, hostability, and tab-boundary direction. They also own the acceptable widget config / risky widget config boundary: acceptable widget config includes compact vs expanded view, item count, sort mode, and whether to show durations or cost; risky widget config includes a custom object model, custom state classification rules, widget-local definitions of blocked/completed/integration status, and slash-form `/completed/integration` labels. `Orchestrator_Page.md` and `Orchestrator_Page` own /page/native-surface behavior, no-active-run and `/historical-run` rendering, and any `/column/widget` table shape that still carries tier-era scoping. Commands may invoke or display these entries, but it must not define a parallel widget trust schema, widget-local state classification, or revive `Tiers` scope through command metadata.

Runtime artifact panels are also owner-routed when Commands exposes an artifact action. `Runtime_Artifacts_Panel.md` and `Runtime_Artifacts_Panel` own artifact-type semantics, panel behavior, schema family references, and the artifact evidence/provenance model; Commands may open or invoke the panel, but it must not redefine those families through command metadata.

Checklist references remain freshness-checked consumers. `Plans/Section15_MVP_Promoted_Features_Spec.md` (`/Section15_MVP_Promoted_Features_Spec.md`) is verification-only unless upstream reconciliation reveals direct stale references that require edits; it is not the storage, command, permission, or widget SSOT. Commands only relies on it for SSOT discipline and `/fail` checklist surfacing, and stale pass/fail references must be refreshed when upstream command, permission, storage, or widget specs move. `Plans/FinalGUISpec.md` (`/FinalGUISpec.md`) stays a GUI consumer for top-level navigation, so stale `Tiers`, `7.7 Tiers`, page-table, or settings-grouping references must be treated as GUI freshness issues rather than command-owned structure.

Mutation and deprecation gates are first-class command constraints. `GATE-010` must evaluate subject-open commands, wrapper commands over canonical navigation, route-payload completeness, alias `/deprecation`, blocked-action admissibility against `allowed_action_ids` and `allowed_action_ids[]`, and stale or `/degraded` projection revalidation before mutation. Commands reuse the event-side alias discipline from `Contracts_V0.md` and `Contracts_V0` for command `/migration` and deprecation states instead of inventing a weaker prose-only alias pattern.

Command availability and summary vocabulary are consumer constraints, not local decorations. Command definitions and UICommands must declare whether each action is `live-run only`, `historical-safe`, or `record-only/export-only` / `/export-only` before palette, shortcut, or route dispatch; Commands must not infer historical safety from a label alone. Project summaries and command-palette summaries preserve the distinction between user-attention problems and internal degraded-trust warnings, so title-bar project badges, Projects page cards, command-palette summaries, and attention-center rows reuse the same status vocabulary and precedence rules. Runtime-detail, queue-analysis, remediation-lineage, and safe-point-history commands remain surface-specific commands, not a generalized subject-open family; they may normalize through route/subject contracts only as typed wrappers.

Discoverability does not weaken confirmation. Any command palette, shortcut surface, or User Command surface that invokes a `strong`, `hard_gate`, `non_reversible`, or `compensating_action_only` action must preserve the owner-defined confirmation, gating, preview, and blocked-action checks before dispatch.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Executor_Protocol.md

### Debug and launcher command boundary

Command-facing Debug terminology must distinguish classical DAP debugging, agentic app/runtime investigation, and assistant-session inspection so slash commands, palette labels, and help text do not collapse them into one ambiguous "Debug" surface.

Debug instrumentation that edits wrapper scripts, `/launcher` files, or `/launch-command/env` state must record the exact revert path and restore from a restore point or generated revert patch during cleanup; command templates may request that workflow, but they do not themselves become persistent launcher owners.

External directory access outside the active policy `/allowlist`, and any action unavailable or degraded for the active runtime or `/browser` health state, must resolve through the central permission/capability gates before a User Command can inject file contents, shell output, or debug evidence.

---

## 1. Definitions

<a id="DEF-USER-COMMAND"></a>
### 1.1 User Command (preset)


A **User Command** is a user-authored or catalog-installed command preset stored as a Markdown file with YAML frontmatter. When invoked, the template body is resolved (placeholders expanded, file includes loaded, shell output injected) and submitted as a prompt to the active chat thread or run. User Commands are the user-facing automation surface — they let users package repeatable prompt workflows without writing code.

<a id="DEF-UICOMMAND-DISTINCTION"></a>
### 1.2 UICommand (internal dispatch) — distinction


A **UICommand** (`Plans/Contracts_V0.md#7-uicommand`, `Plans/UI_Command_Catalog.md`) is an internal UI dispatch identifier (e.g., `cmd.chat.model`, `cmd.lsp.goto_definition`). UICommands are stable IDs that bind UI elements to handlers. They are **not** user-authored; they are developer-defined, code-registered, and wiring-matrix-verified.

User Commands and UICommands are orthogonal:
- User Commands are **content presets** (prompt templates).
- UICommands are **internal dispatch actions** (UI handler bindings).

A User Command's invocation through the chat slash-command surface or command palette ultimately dispatches a UICommand (`cmd.chat.run_user_command`) to trigger execution, but the User Command itself is not a UICommand.

ContractRef: ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md

### 1.3 Invocation surfaces

Project-scoped universal search, left-panel content search, and file-manager search remain product/search surfaces, not User Commands. The command palette may expose runnable commands as one category inside project-local `/symbols/commands/other` search, but implementation-readiness seams such as desktop to `/file-manager` `/drop`, diff heat maps or scrollbar change markers, ignored-file dimming or `/hiding`, generated-vs-workspace-file distinctions, and `/open/save/export` behavior are owned by the file/editor/search/GUI specs named in `Plans/00-plans-index.md`.

File tree actions and editor/file operations use canonical UICommands, not user-authored command presets. `Plans/FileManager.md` owns tree context-menu and action semantics; `Plans/UI_Command_Catalog.md` owns `cmd.file.*` and `cmd.chat.add_file_reference`; this document only owns whether a user-authored command can invoke or appear beside those actions without rebinding their IDs.

`Commands_System` / `Commands_System.md` owns this user-authored slash and `/palette` boundary only. Internal `UICommand` modeling, registration, route arguments, and command-catalog migration remain separate from user command presets even when the same palette displays both categories.

User Commands are invocable from three surfaces:

| Surface | Mechanism | Details |
|---------|-----------|---------|
| **Assistant chat** | Slash-command prefix `/` | User types `/<command-name>` (or `/x-<command-name>` for custom). Autocomplete popup lists available commands alongside reserved slash commands (`Plans/assistant-chat-design.md` §5). |
| **Command palette** | Palette entry | Commands exposed to the palette appear as "Run command: \<name\>". |
| **Orchestrator shortcut trigger** | Optional keybinding | A User Command may be bound to a keyboard shortcut via Settings > Shortcuts. |

ContractRef: ContractName:Plans/assistant-chat-design.md#5, ContractName:Plans/FinalGUISpec.md

---

## 2. Storage and discovery

<a id="STORAGE-LAYOUT"></a>

User Command files are stored in a deterministic two-tier layout. Project-local commands override global commands by name.

ContractRef: PolicyRule:Decision_Policy.md§2

### 2.1 Project-local

```
<project_root>/.puppet-master/commands/<name>.md
```

Scoped to the project workspace root. Available only when that project is active.

### 2.2 Global

```
~/.config/puppet-master/commands/<name>.md
```

Available across all projects. Overridden by a project-local command with the same name.

### 2.3 Resolution order


When resolving a command by name:
1. Check `.puppet-master/commands/<name>.md` in the active project root.
2. If not found, check `~/.config/puppet-master/commands/<name>.md`.
3. If not found, the command is unresolved. The invocation surface MUST display an error: "Unknown command: \<name\>".

### 2.4 Name collision rules


### 2.4.1 Reserved namespace retirements

Reserved built-ins and their families cannot be overridden by provider, skill, or extension naming.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

Collision rules:
- `/web` reserves the family namespace for `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, and `/web map`
- `override_builtin: true` is `/forbid` for reserved Assistant Chat built-ins; if it survives for extension design, it is limited to `non-core` command namespaces and cannot override `/web`, `/skill`, `/cancel`, `/clear`, `/stop`, or other canonical chat commands.
- `/web` commands are network `/external-read` operations, not `/shell` mutation commands. Approval/help copy routes URL-host scoped `For Session` examples for `/web extract`, `/web crawl`, `/web map`, and the `/crawl/map` follow-on family through `Plans/Permissions_System.md`, while `/web search` and `/web research` use `tool-wide` session grants only for that web tool.
- `/worktree` is reserved and cannot be re-bound by a custom command
- `/skill` is part of the reserved built-in slash-command set and remains a built-in helper surface for skill discovery or invocation; it cannot be rebound by User Commands or `override_builtin`
- `/plugins` remains a plugin-management/navigation surface, not a User Command namespace that a project command may redefine
- natural-language and slash dispatch share the same underlying dispatcher, so collision handling is consistent across both entry points

Reserved-name validation is a command-system boundary shared with chat-design, chat-overlay, and command-catalog consumers. The runtime rejects command files, palette entries, or plugin/skill projections that collide with the reserved-name set before they can emit a canonical-event, and `/mode` must be disambiguated by owner context so chat-overlay display mode, runtime run mode, and User Command frontmatter do not share an untyped payload slot. GPT-era registry audits do not create new event names by observation: `chat.thread.created` and `chat.thread_created` cannot both be active names for the same event, and `chat.message.submitted` is not valid support for `cmd.chat.run_user_command` until the event registry owns that name.

Ask `/Plan` behavior for command-triggered tools follows `Plans/Run_Modes.md` (`/Run_Modes.md`) and `Plans/Permissions_System.md`: Plan remains read-only for project mutation, but information-gathering `/tool` families such as web search, fetch, extract, research, crawl, and map are ask-gated or policy-denied by explicit permission rows rather than blanket auto-denied as if they were shell/file mutation.

### 2.5 Name validation

**Name regex:** `^[a-z][a-z0-9_-]{0,48}[a-z0-9]$`
- Starts with a lowercase letter.
- Contains only lowercase letters, digits, hyphens, and underscores.
- Ends with a lowercase letter or digit.
- Length: 2–50 characters.

ContractRef: PolicyRule:Decision_Policy.md§2

---

## 3. Command schema

<a id="COMMAND-SCHEMA"></a>

A User Command file (`<name>.md`) consists of YAML frontmatter followed by a Markdown template body.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/DRY_Rules.md

### 3.1 YAML frontmatter

```yaml
---
description: "Run the project's test suite and report results"
persona: "rust-engineer"
mode: "regular"
model: "anthropic/claude-sonnet-4"
subtask: false
permissions_profile_override: null
override_builtin: false
---
```

### 3.2 Field definitions

| Field | Required | Type | Meaning |
|---|---|---|---|
| `name` | Required | `string` | Invocation name. Must pass validation and MUST NOT collide with reserved Assistant Chat built-ins or reserved git/GitHub prefixes. |
| `description` | Required | `string` | Short user-facing description. |
| `arguments` | Optional | `array<object>` | Positional argument schema for validation/help. |
| `persona_override` | Optional | `string` | Requested Persona override for the command execution context. |
| `mode_override` | Optional | `string` | Requested runtime mode override when allowed by the owning surface. |
| `model_override` | Optional | `string` | Requested model override. |
| `permissions_profile_override` | Optional | `string` | Permissions profile override, subject to the central permission system. |
| `override_builtin` | Optional | `boolean` | Reserved for future non-chat extension points. It MUST NOT override canonical Assistant Chat built-ins or reserved git/GitHub prefixes. |

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Prompt_Pipeline.md

### 3.3 Template body

The Markdown body following the frontmatter is the prompt template. It supports three dynamic features: placeholders, file includes, and shell output injection.

<a id="TEMPLATE-PLACEHOLDERS"></a>
#### 3.3.1 Placeholders

| Placeholder | Meaning |
|-------------|---------|
| `$ARGUMENTS` | All remaining text after the command name. |
| `$1`, `$2`, ... `$N` | Positional arguments, space-separated from the invocation text. |

Placeholder extraction: At load time, the template is scanned for `$ARGUMENTS` and `$N` patterns. The extracted list is stored as `hints` for autocomplete display.

Unresolved placeholders (no value provided) are replaced with empty string.

<a id="TEMPLATE-FILE-INCLUDE"></a>
#### 3.3.2 File includes (`@path`)

The pattern `@path/to/file` in the template body causes the referenced file's contents to be included at that position during template resolution. Directory references (`@path/to/dir`) include a listing of the directory contents.

**Permission guard:** File inclusion is checked against the `read` permission key (`Plans/Permissions_System.md` §5). If the active permission resolves to `deny` for the referenced path, the include is blocked and an error message is substituted. If `ask`, the approval UI is shown.

ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys

<a id="TEMPLATE-SHELL-INJECTION"></a>
#### 3.3.3 Shell output injection (`` !`command` ``)


The pattern `` !`shell-command` `` in the template body executes the shell command and injects its stdout at that position during template resolution.

**Permission guard:** Shell injection is checked against the `bash` permission key (`Plans/Permissions_System.md` §5). If the active permission resolves to `deny`, the injection is blocked and an error message is substituted. If `ask`, the approval UI is shown and the user's response (`deny`/`once`/`for session`/`always`) is respected per `Plans/Permissions_System.md` §6.

ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys, ContractName:Plans/Permissions_System.md#ASK-FLOW

---

## 4. Execution semantics


<a id="EXECUTION"></a>

### 4.1 Working directory

The active working directory for command execution resolves as follows:

1. If the active context has a bound worktree (`is_worktree` is true in execution context), use the **worktree root path**
2. Otherwise, use the **active project root**

This applies to all command execution contexts: Assistant Chat (all modes), Orchestrator DAE, terminal sessions, and file operations.

When a thread with a bound worktree is active in Assistant Chat, all `cmd.chat.*` commands execute against the worktree root. When no worktree is bound, they execute against the project root.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md

Assistant worktree commands share the orchestrator worktree directory family but use thread-derived names. Existing orchestrator worktrees keep `.puppet-master/worktrees/{tier_id}` style directory names; Assistant thread worktrees use `.puppet-master/worktrees/thread-{short_id}`, where `short_id` is derived from the bound `thread_id`. If `thread-{short_id}` already exists, command handling appends a numeric suffix such as `thread-{short_id}-2` instead of silently reusing a stale directory.

For worktree-bound threads, edit and file cards display paths relative to the resolved `working_directory`; for example, `src/main.rs (+12 −3)` is shown relative to the worktree root and opens by resolving that relative path under `working_directory`, with no special path rewriting layer. Terminal commands opened from the same thread set terminal `cwd` to the worktree path, not the main project root, and persist that worktree path as `cwd_snapshot` on the `terminal_session_record`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md

### 4.2 Subtask execution

command-subtask behavior is not a lighter-weight exception to the canonical child-run contract. When `subtask: true` is set, the command launches a canonical child run through the same delegated-run contract used everywhere else.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

`subtask: true` is not a lighter-weight interpretation of a normal prompt submission. It creates a child-session / `/delegation` boundary with required parent-child lineage, storage, `/permission/capability`, and runtime evidence.

Required behavior:
- resolve requested and effective Persona/runtime/model/effort state using the same pipeline as any other child run.
- classify the child dependency as `required` or `/optional`; `required` is the safer default for command subtasks unless the command explicitly declares advisory behavior.
- inherit and then narrow the parent permission ceiling and compatible capability universe, including child capability narrowing before dispatch.
- record the parent-child linkage in canonical event and storage records.
- do not silently fallback when the command explicitly requested a runtime surface that is unavailable or incompatible; this is the command-level `no-silent-fallback` rule.
- record the requested-vs-effective (`/effective`) provider `/runtime` surface when policy, availability, compatibility, or account binding changes the launched child.
- borrow provider child-session/delegation patterns where useful, but never require provider-native `session-tree` semantics on direct providers. PM canonical child-run identity remains the SSOT even when the provider has no native session tree.
- source-code evidence such as OpenCode `task.ts` is upstream evidence only; PM enforces its own `provider-family` / TOS guard for native subagent routing instead of assuming upstream task launch behavior is sufficient.
- permission resolution for command-launched child work defers to `Plans/Permissions_System.md` (`/Permissions_System.md`) for lane, package, `/package/account-bounded`, account-bounded approval scope, and multi-lane orchestrator runs; Commands may request or display the selected approval scope, but must not synthesize a weaker command-local policy.
- generalized projection freshness uses storage and owner vocabulary: `storage-plan.md` and `storage-plan` reserve `trust_tier` for Preview and `/browser` semantics, so Commands uses projection-freshness and `/degraded` state for stale command projections rather than reusing `trust_tier` as a generic trust/degraded label.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md
### 4.3 Persona selection

Command subtasks follow the canonical child Persona resolution order.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md

Rules:
- explicit command Persona override wins.
- otherwise the command-provided task or child type resolves Persona through the normal child Persona pipeline.
- parent Persona is at most a weak hint.
- child Persona does not silently copy the parent Persona.
### 4.4 Mode and model overrides

Provider, model, account, Persona, and worker-policy overrides, including the `/model/account/worker-policy` family, use the same requested/effective display grammar: command UI shows the requested override, effective result, inheritance source, and policy remap reason instead of deriving it from ad hoc color, disappearance, or current-settings winner state.


Command overrides are explicit child requests, not bypasses around the runtime model.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md

Rules:
- command mode overrides are capped by parent mode authority.
- command model/runtime surface overrides become explicit child requests.
- explicit requests do not silently fallback.
- requested versus effective runtime/model/effort fields remain visible when remaps occur because of compatibility or policy.

### 4.5 Current Working Set

Command cards, command-launched child runs, and command-produced blocks remain in the current `working-set` while they are the latest active result in the current branch of work, directly support the next intended action, participate in unresolved comparison `/approval/question/validation` state, or are explicitly focused or `/pinned` by the user. They leave the working set when a newer result supersedes the same purpose, the finding has been carried forward, or execution clearly moves to a different branch of work.

### 4.6 Template resolution order

Template resolution proceeds in this order:
1. Parse YAML frontmatter; extract field values.
2. Extract placeholder hints (`$ARGUMENTS`, `$1`, `$2`, ...) from body.
3. Substitute placeholders with invocation arguments.
4. Resolve `@path` file includes (permission-checked).
5. Resolve `` !`command` `` shell injections (permission-checked).
6. The fully resolved body is the prompt submitted to the run.

ContractRef: ContractName:Plans/Commands_System.md#EXECUTION

---

## 5. Permissions integration

<a id="PERMISSIONS"></a>

### 5.1 Shell injection permission check

Shell injection (`` !`command` ``) is evaluated against the `bash` permission key using the resolution algorithm in `Plans/Permissions_System.md` §8. The shell command string is the invocation context for granular pattern matching.

If the resolution yields `ask`, the approval UI is shown with the full shell command displayed. The user's response follows `Plans/Permissions_System.md` §6 semantics:
- `once`: Execute this injection only.
- `for session`: Insert a session-scoped allow rule for the command pattern.
- `always`: Create the durable allow defined by `Plans/Permissions_System.md` §6.
- `deny`: Block this injection for the current blocked episode.

Command permission prompts inherit parallel actor scoping. HITL/tool and `/tool` approval semantics normalize onto one blocked-episode model with explicit scope keying, field-family cleanup, and durable provenance. When resolving command-launched work, template file inclusion, or shell injection, the invocation must pass `actor/lane/run/account` and `/lane/run/account` scope so `session-scoped` `always` approvals, `reject-cascade` rules, and doom-loop `three consecutive times` counters are evaluated per actor/lane/run/account instead of across unrelated interleaved concurrent execution. If that context is under-specified, the command must present the blocked-overlay/HITL route instead of pretending a global approval or denial is safe. The legacy headless `ask -> deny unless HITL at current tier boundary` phrase is tier-era shorthand and resolves to normal blocked-overlay routing.

The same permission algorithm owns `ask/plan` and `external_publish_side_effect` semantics. A command that would publish externally, mutate durable state, or ask the user to approve a plan must resolve both concepts through one canonical approval calculation, not through separate command-template text.

ContractRef: ContractName:Plans/Permissions_System.md#ASK-FLOW, ContractName:Plans/Permissions_System.md#RESOLUTION

### 5.2 File inclusion permission check

File inclusion (`@path`) is evaluated against the `read` permission key. The file path is the invocation context. Same `ask` flow semantics apply.

ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys

### 5.3 `permissions_profile_override`

If a command specifies `permissions_profile_override`, the named profile is loaded from `~/.config/puppet-master/permission-profiles/<profile_id>.toml` and applied as an additional precedence layer between Persona overrides and project-level rules (effectively replacing the Persona's profile for this command's run).

ContractRef: ContractName:Plans/Permissions_System.md#PRECEDENCE-LAYERS

---

## 6. GUI requirements
### 6.6 Catalog-installed command lifecycle

Catalog-installed commands are still canonical User Commands after installation.

Rules:
- installation creates or updates a command in the same canonical command roots described in §2
- updates follow the same validation rules as manual edits
- removal of an installed command is blocked or deferred when the command is actively referenced by an open edit session or another subsystem requires explicit replacement/confirmation
- the GUI must show whether a command is local/manual, catalog-installed, or catalog-installed with local override
- uninstalling a catalog item must not silently delete a user-authored project override that intentionally shadows it

<a id="GUI-COMMANDS"></a>

The Commands settings screen is part of the **Rules & Commands** tab in the unified Settings page (`Plans/FinalGUISpec.md` §7.4). All GUI surfaces described here are normative; `Plans/FinalGUISpec.md` references this section as the SSOT for Commands GUI behavior.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### 6.1 Commands management section

A **Commands** section within Settings > Rules & Commands MUST provide the following.

ContractRef: ContractName:Plans/Commands_System.md#GUI-COMMANDS

#### 6.1.1 Scope selector


A toggle at the top of the Commands section:
- **Global** — manages commands in `~/.config/puppet-master/commands/`.
- **Project** (visible when a project is active) — manages commands in `<project_root>/.puppet-master/commands/`.

#### 6.1.2 Command list

A table listing all resolved commands (project + global, project-local indicated with badge). Columns:
- **Name** (bold, with `/x-` prefix shown)
- **Scope** badge (project / global)
- **Description** (truncated to 1 line)
- **Persona** (if set; otherwise "—")
- **Mode** (if set; otherwise "inherit")
- **Model** (if set; otherwise "inherit")
- **Subtask** indicator (checkbox icon if `true`)

Sorted alphabetically by name; project-local entries sort before global when names match (indicating override).

#### 6.1.3 Create

"New Command" button opens an editor form with:
- **Name** (text input; validated per §2.5; collision check per §2.4)
- **Description** (text input; required; max 200 chars)
- **Persona** (dropdown populated from Persona registry, or null)
- **Mode** (dropdown: inherit / ask / plan / regular / yolo)
- **Model** (dropdown populated from model discovery, or null/inherit)
- **Subtask** (toggle; default off)
- **Permissions profile override** (dropdown populated from permission profiles, or null)
- **Override built-in** (toggle; default off; visible only in Expert mode; reserved Assistant Chat slash commands fail validation even if this toggle is enabled, because `override_builtin` does not apply to canonical reserved chat commands.)
- **Template body** (Markdown editor with syntax highlighting for `$ARGUMENTS`, `$N`, `@path`, `` !`cmd` `` patterns)

Scope selector: project-local or global.

#### 6.1.4 Edit

Row click or edit button opens the same editor pre-populated. Editing a global command while a project is active offers "Save as project override" (creates project-local copy) or "Save globally."

#### 6.1.5 Delete

Delete button with confirmation modal. Deleting a project-local command that overrides a global one reveals the global version. Deleting a global command with no project override removes it entirely.

#### 6.1.6 Schema validation on save

On every save, validate the command file against the schema (§3). Display inline errors for: reserved name collision, invalid name format, missing description, invalid mode value, and invalid model format. If `override_builtin: true` is set while the command name matches a reserved Assistant Chat slash command, display a validation error explaining that `override_builtin` does not apply to canonical reserved chat commands. Block save until errors are resolved.

### 6.2 Dry-run preview

<a id="DRY-RUN"></a>

A **"Preview"** button in the command editor resolves the template with sample arguments and displays the fully rendered prompt without submitting it. The preview:
- Shows placeholder substitutions highlighted.
- Shows file-include results (or permission-blocked placeholders).
- Shows shell-injection results (or permission-blocked placeholders).
- Uses a read-only rendered Markdown view.

The preview does NOT execute any run. Shell injections in preview mode execute the shell command (subject to `bash` permission) but do not submit the result to any agent.

### 6.3 Shortcut binding

## 7. Reserved built-in slash commands

This section owns `## 7. Reserved built-in slash commands` as the locked reserved-set contract. The same built-in slash-command family must stay visible here and in consumers: `/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`, `/settings`, `/doctor`, `/help`, `/web`, `/skill`, and `/cancel` remain reserved built-ins; `/clear` is removed; `/cancel` is a deprecated alias to `/stop`; and traceability for this reserved command family includes `obl-046` and `obl-047`.

Packet regeneration treats this owner as a `replace_section` unit: repairs for the reserved-set contract replace `## 7. Reserved built-in slash commands` itself rather than appending raw material after `### 6.3 Shortcut binding`, so stale-residue child/parent packet material cannot survive beside the canonical `/web`, `/skill`, and `/cancel` rules.

The `/web` family is reserved as one command family, not flattened into independent top-level commands. Bare `/web` has no-default execution behavior: it opens help/autocomplete only, and execution requires a subcommand such as `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, or `/web map`. The stale rule `Bare /web (with query argument) routes to cmd.web.search by default` is retired; `cmd.web.search` is not the implicit destination for bare `/web`.

This section is the slash-command SSOT for the single canonical set of reserved chat slash commands; consumers mirror these commands rather than defining local variants.

`override_builtin` is /forbid for every reserved built-in slash command. If `override_builtin` survives for extension design, it is narrowed to non-core command namespaces only and cannot override `/web`, `/skill`, `/cancel`, `/clear`, `/stop`, or other canonical Assistant Chat built-ins.

Exact reserved-command behavior: bare /web has no default action, bare /skill is discovery or invocation only, /rewind dispatches conversation-only rewind, /revert dispatches file-mutation restore, /share/settings/doctor/help route to their owning surfaces, /cancel remains a deprecated alias to /stop, and /clear stays removed rather than a thread-clear command.


This section defines the canonical contract for this surface.

Core rules:
- The reserved built-in slash-command set is locked and non-overridable; bare /web has no default action, bare /skill is discovery or invocation only, /cancel remains a deprecated alias to /stop, and /clear stays removed.
- The /web family is locked as one slash-command family with stable command IDs, bare /web help behavior, and no flattening into separate top-level families.

Fields:
- slash prototype
- stable command ID
- subcommand-required parsing

Labels and values:
- /new
- /model
- /effort
- /mode
- /export
- /compact
- /stop
- /resume
- /rewind
- /revert
- /share
- /settings
- /doctor
- /help
- /web
- /skill
- /cancel
- reserved built-ins

Rules:
- /web search <query>
- /web extract <url>
- /web research <task>
- /web crawl <url>
- /web map <url>
- cmd.chat.web.search
- cmd.chat.web.extract
- cmd.chat.web.research
- /web fetch <url>
- cmd.chat.web.fetch
- cmd.chat.web.crawl
- cmd.chat.web.map
- bare /web shows help/autocomplete only
- do not flatten /web into separate slash families
- subcommand is required for execution
- URL normalization applies
- parse failure shows usage
- /cancel resolves internally to cmd.chat.stop
- /rewind dispatches `cmd.chat.rewind` and remains conversation-only
- /revert dispatches `cmd.chat.revert` and remains file-mutation restore, not conversation rewind
- /share, /settings, /doctor, and /help are reserved built-in slash entries that route to their owning thread, settings, health, and help surfaces rather than user-defined commands
- /clear stays removed and must not return as a `thread-clear` command
- Source cleanup shorthand `/de-duplication`, `/research-focused`, `/risky`, and `thread-clear` normalizes to reserved-command alias policy plus ask-gated web permission posture; it does not create extra slash commands.
- /web remains discoverable in catalog
- deprecated aliases shown distinctly from active commands
- reserved commands shown as non-editable in catalog
## 7. UICommand catalog entry

<a id="UICOMMAND-ENTRY"></a>

The following UICommand ID is the required dispatch bridge for User Command execution from any invocation surface. Registration remains owned by `Plans/UI_Command_Catalog.md`; this document does not make `cmd.chat.run_user_command` registered by assertion.

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.chat.run_user_command` | `{ command_name, arguments? }` | `tool.invoked` when `subtask: true`; otherwise the canonical chat message event registered by the event owner, not `chat.message.submitted` unless that event is explicitly registered | Assistant chat, Command palette |

Reserved slash-command UICommand IDs (`cmd.chat.new`, `cmd.chat.model`, etc.) are defined in `Plans/UI_Command_Catalog.md` §2.7 and are distinct from User Command execution.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md#7-uicommand

### 7.1 Debug Mode dispatch family

Debug Mode actions use a separate canonical UICommand family, `cmd.debug.*`, for assistant-thread investigation control. These dispatch IDs are internal wiring identifiers, not User Commands, and they let Assistant Chat, the editor, and debug-adjacent surfaces invoke investigation lifecycle actions without overloading the User Command namespace.

| command_id | label | description | precondition |
|---|---|---|---|
| `cmd.debug.start` | Start Investigation | Begins a new debug investigation in current thread | `chat_active && !investigation_active` |
| `cmd.debug.stop` | End Investigation | Concludes the active investigation | `investigation_active` |
| `cmd.debug.pause` | Pause Investigation | Pauses evidence collection | `investigation_active` |
| `cmd.debug.resume` | Resume Investigation | Resumes paused investigation | `investigation_paused` |
| `cmd.debug.add_breakpoint` | Add Breakpoint | Adds a breakpoint at current editor position | `editor_active && investigation_active` |
| `cmd.debug.remove_breakpoint` | Remove Breakpoint | Removes selected breakpoint | `breakpoint_selected` |
| `cmd.debug.clear_breakpoints` | Clear All Breakpoints | Removes all breakpoints | `investigation_active && has_breakpoints` |
| `cmd.debug.view_evidence` | View Evidence | Opens evidence panel for current investigation | `investigation_active` |
| `cmd.debug.step` | Step Through | Advances to next execution point | `investigation_active && at_breakpoint` |
| `cmd.debug.collect_snapshot` | Collect Snapshot | Captures current state as evidence | `investigation_active` |

These Debug Mode dispatch IDs complement, rather than replace, the reserved slash-command surface described in `Plans/assistant-chat-design.md` and the broader UI command catalog in `Plans/UI_Command_Catalog.md`.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Glossary.md

---

## 8. OpenCode baseline and Puppet Master deltas

OpenCode command material is external reference input used for ALIGNED/RECONCILED/ADOPTED/REFERENCE categorization only; it does not override Puppet Master command names, dispatch rules, storage paths, or reserved slash-command policy.


<a id="BASELINE-DELTAS"></a>

Per `Plans/OpenCode_Deep_Extraction.md` §7D and §9D:

### 8.1 Baseline

OpenCode loads commands from four sources: built-in commands (`init`, `review`), config-defined commands, MCP prompts (converted to commands), and skills (registered as commands if no name collision). Discovery paths: `.opencode/commands/<name>.md` (project) and `~/.config/opencode/commands/<name>.md` (global). Template features: `$ARGUMENTS`, `$1`/`$2` positional args, `` !`shell` `` injection, `@file` inclusion. `subtask: true` runs as a subagent task. `model` override uses `provider_id/model_id` format. Custom commands can override built-in commands by name; when a user-defined command has the same name as a built-in command, the user-defined version takes precedence.

### 8.2 Puppet Master deltas

1. **Discovery paths:** Puppet Master uses `.puppet-master/commands/<name>.md` (project) and `~/.config/puppet-master/commands/<name>.md` (global) instead of `.opencode/` paths.
2. **Persona integration:** OpenCode commands specify `agent` (agent name). Puppet Master commands specify `persona` (Persona ID per `Plans/Personas.md`), which is a higher-level role definition decoupled from provider-native agent concepts.
3. **Permissions profile override:** OpenCode commands have no per-command permissions override. Puppet Master adds `permissions_profile_override` for fine-grained control.
4. **No built-in commands:** OpenCode bundles `init` and `review` as built-in commands. Puppet Master does not bundle built-in User Commands; equivalent functionality is provided through reserved slash commands (`Plans/assistant-chat-design.md` §5) and Orchestrator actions.
5. **MCP prompt integration:** OpenCode auto-converts MCP prompts to commands. Puppet Master treats MCP prompts as a separate mechanism; they are not auto-registered as User Commands.
6. **GUI management:** OpenCode has no GUI for command management. Puppet Master provides a full Commands settings screen (§6).
7. **Built-in command override policy:** OpenCode allows custom commands to freely override built-in commands by name. Puppet Master does not allow User Commands to override canonical reserved Assistant Chat slash commands. The `override_builtin` field is reserved for future non-chat extension points and MUST NOT be used to bypass reserved chat-command or reserved git/GitHub prefix rules.
8. **Provider and capability identity limits:** OpenCode final-pass evidence from `OpenCode_Deep_Extraction.md`, `OpenCode_Coverage_Matrix.md`, `Provider_OpenCode`, and `Provider_OpenCode.md` remains external reference input for command behavior only. Puppet Master still requires its own SSE filter discriminator, stable mapping of OpenCode session IDs into provider-native identity fields, requested `/auth` versus `/effective` account identity parity, and command ID registration before adopting OpenCode-specific behavior. Capability discovery such as `capabilities.get` is a live provider/runtime contract, not a command-local cache; `Media_Generation_and_Capabilities.md`, `Media_Generation_and_Capabilities`, `Contracts_V0.md`, and `Contracts_V0` own the frozen orchestrator capability snapshot and event-registration boundaries.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 9. Acceptance criteria

<a id="ACCEPTANCE"></a>

These criteria are testable assertions that MUST hold for any conforming implementation.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/Progression_Gates.md

<a id="AC-CMD01"></a>
**AC-CMD01:** Project-local commands MUST override global commands with the same name. Resolution order (§2.3) MUST be deterministic.

<a id="AC-CMD02"></a>
**AC-CMD02:** User Commands MUST NOT use any reserved slash-command name (§2.4). The runtime MUST reject creation of commands with reserved names.

<a id="AC-CMD03"></a>
**AC-CMD03:** Template resolution (§4.6) MUST follow the defined order: frontmatter parse → placeholder extraction → placeholder substitution → file includes → shell injection.

<a id="AC-CMD04"></a>
**AC-CMD04:** Shell injection (`` !`command` ``) MUST be permission-checked against the `bash` key before execution. If denied, the injection MUST be blocked and an error substituted.

<a id="AC-CMD05"></a>
**AC-CMD05:** File inclusion (`@path`) MUST be permission-checked against the `read` key. If denied, the inclusion MUST be blocked and an error substituted.

<a id="AC-CMD06"></a>
**AC-CMD06:** When `subtask: true`, the command MUST execute as a child run via the `task` tool, and the parent MUST record the linkage in the event ledger.

<a id="AC-CMD07"></a>
**AC-CMD07:** The GUI Commands management section (§6) MUST validate command names on save and block saves with validation errors (reserved names, invalid format, missing description).

<a id="AC-CMD08"></a>
**AC-CMD08:** The dry-run preview (§6.2) MUST render the fully resolved template without submitting it to any agent run.

<a id="AC-CMD09"></a>
**AC-CMD09:** Every User Command MUST appear in the command palette and the chat slash-command autocomplete unless the command is unresolved.

<a id="AC-CMD10"></a>
**AC-CMD10:** User Commands MUST NOT override reserved Assistant Chat slash commands. `override_builtin` MUST NOT enable overriding canonical reserved chat commands or reserved git/GitHub prefixes.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Commands_System.md#COMMAND-SCHEMA

---

*Document created for planning only; no code changes.*

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Commands_System.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### CS-001 - Commands System (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: CS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: Plans/Commands_System.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Commands_System.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Commands_System-S0053
preserved_exact_tokens:
- Commands System (Canonical SSOT)
- 0. Scope and SSOT status
- 0.1 Command scope and legacy retirements
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- 0.2 Cross-owner consumer boundaries
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Executor_Protocol.md'
- Debug and launcher command boundary
- 1. Definitions
- 1.1 User Command (preset)
- 1.2 UICommand (internal dispatch) — distinction
- 'ContractRef: ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/UI_Command_Catalog.md'
- 1.3 Invocation surfaces
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#5, ContractName:Plans/FinalGUISpec.md'
- 2. Storage and discovery
- 'ContractRef: PolicyRule:Decision_Policy.md§2'
- 2.1 Project-local
- 2.2 Global
- 2.3 Resolution order
- 2.4 Name collision rules
- 2.4.1 Reserved namespace retirements
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md'
- 2.5 Name validation
- 3. Command schema
negative_constraints:
- User Commands may surface `/resume` only by reference to the Assistant Chat and storage SSOTs; they MUST NOT define a separate restore/resume storage schema.
- Legacy `phase_subagents` and provider-native `command-name` assumptions are `/replace`-only migration labels. They MUST NOT remain active beside the Persona-stage command contract.
- 'For Assistant Chat message actions, Commands consume the owner-defined `Resend` semantics from `Plans/assistant-chat-design.md` and `Plans/UI_Command_Catalog.md`: `Resend` replays the latest user-authored message and discards later generated history/work, while command presets must not redefine it a'
- For process coordination, Commands consume the resolved project `lock-file` path from the storage/runtime owner contract. The lock location derives from the storage logical-root with any safe-local-fallback defined by `Plans/storage-plan.md`; command templates must not invent an alternate lock direc
- Command-visible provider context is a projection of provider owners. For bridged providers, `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`) owns the versioned correlation `/context` block and account-health semantics; Commands may surface those values when a command launches or resume
- Route-like UICommands may be surfaced beside User Commands, but Commands does not let feature-local labels become private target models. In `Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`), `/UI` rows that still expose graph HITL `request_id` or `hitl_request_id` commands are a same-file con
- Command-facing runtime identity is only a consumer of the owner split. `Plans/Prompt_Pipeline.md` defines requested/effective field meaning, `/runtime`, and dispatch presence; `Plans/storage-plan.md` defines persistence and `/projection`; executor docs define required dispatch/runtime boundaries; `M
- '`persona_override_owner_id` and requested account context are owner-projected runtime identity, not command-local state: shared runtime docs must not let `persona_override_owner_id` preserve `tier_id`-style ownership while wizard/interview flows move to non-tier execution semantics, and command cons'
- orchestration-core reconciliation is execution-core owner work, not command-surface cleanup. `Executor_Protocol.md` and `orchestrator-subagent-integration.md` are the execution-core outliers when they retain tier-era, tier-shaped `TierContext`, or `tier_runtime_record` canon; Commands treats graph/p
- Widget and native-surface state remains owner-routed when Commands exposes a command or checklist entry. `Plans/Widget_System.md` (`/Widget_System.md`) and `Widget_System` own chrome slots for `/trust-state`, projection-trust semantics, hostability, and tab-boundary direction. They also own the acce
- Runtime artifact panels are also owner-routed when Commands exposes an artifact action. `Runtime_Artifacts_Panel.md` and `Runtime_Artifacts_Panel` own artifact-type semantics, panel behavior, schema family references, and the artifact evidence/provenance model; Commands may open or invoke the panel,
- 'Command availability and summary vocabulary are consumer constraints, not local decorations. Command definitions and UICommands must declare whether each action is `live-run only`, `historical-safe`, or `record-only/export-only` / `/export-only` before palette, shortcut, or route dispatch; Commands '
- '| `name` | Required | `string` | Invocation name. Must pass validation and MUST NOT collide with reserved Assistant Chat built-ins or reserved git/GitHub prefixes. |'
- '| `override_builtin` | Optional | `boolean` | Reserved for future non-chat extension points. It MUST NOT override canonical Assistant Chat built-ins or reserved git/GitHub prefixes. |'
- '- permission resolution for command-launched child work defers to `Plans/Permissions_System.md` (`/Permissions_System.md`) for lane, package, `/package/account-bounded`, account-bounded approval scope, and multi-lane orchestrator runs; Commands may request or display the selected approval scope, but'
- '- uninstalling a catalog item must not silently delete a user-authored project override that intentionally shadows it'
- '- /clear stays removed and must not return as a `thread-clear` command'
- 7. **Built-in command override policy:** OpenCode allows custom commands to freely override built-in commands by name. Puppet Master does not allow User Commands to override canonical reserved Assistant Chat slash commands. The `override_builtin` field is reserved for future non-chat extension point
- '**AC-CMD02:** User Commands MUST NOT use any reserved slash-command name (§2.4). The runtime MUST reject creation of commands with reserved names.'
- '**AC-CMD10:** User Commands MUST NOT override reserved Assistant Chat slash commands. `override_builtin` MUST NOT enable overriding canonical reserved chat commands or reserved git/GitHub prefixes.'
compatibility_only_notes:
- '### 0.1 Command scope and legacy retirements'
- Legacy `phase_subagents` and provider-native `command-name` assumptions are `/replace`-only migration labels. They MUST NOT remain active beside the Persona-stage command contract.
- Launcher and binary-location context is likewise owner-projected. `Plans/BinaryLocator_Spec.md` and `BinaryLocator_Spec` own OpenCode launcher ownership and binary discovery; Commands may invoke that resolved launcher, but it must treat rewrite-adjacent dead `four-tier` names, process-scope wording,
- Execution-core context remains owner-routed. `Plans/Executor_Protocol.md`, `Executor_Protocol`, `orchestrator-subagent-integration.md`, `WorktreeGitImprovement.md`, and their runtime owners must reconcile node-native and node-sharded ingest with legacy `tier_id`, tier-keyed, and tier-native executio
- '- record the requested-vs-effective (`/effective`) provider `/runtime` surface when policy, availability, compatibility, or account binding changes the launched child.'
- '- requested versus effective runtime/model/effort fields remain visible when remaps occur because of compatibility or policy.'
- Command permission prompts inherit parallel actor scoping. HITL/tool and `/tool` approval semantics normalize onto one blocked-episode model with explicit scope keying, field-family cleanup, and durable provenance. When resolving command-launched work, template file inclusion, or shell injection, th
stale_retired_dispositions:
- 'For context behavior, Commands defer to `Plans/Run_Modes.md` `## 0. Scope and SSOT status`, `### SSOT references (DRY)`, and `## 7. Mode effects on context management`: `LF-006` and `LF-007` are treated as stale-residue / wrong-owner-routing failures whenever command prose sends detailed context-com'
- For process coordination, Commands consume the resolved project `lock-file` path from the storage/runtime owner contract. The lock location derives from the storage logical-root with any safe-local-fallback defined by `Plans/storage-plan.md`; command templates must not invent an alternate lock direc
- Launcher and binary-location context is likewise owner-projected. `Plans/BinaryLocator_Spec.md` and `BinaryLocator_Spec` own OpenCode launcher ownership and binary discovery; Commands may invoke that resolved launcher, but it must treat rewrite-adjacent dead `four-tier` names, process-scope wording,
- Execution-core context remains owner-routed. `Plans/Executor_Protocol.md`, `Executor_Protocol`, `orchestrator-subagent-integration.md`, `WorktreeGitImprovement.md`, and their runtime owners must reconcile node-native and node-sharded ingest with legacy `tier_id`, tier-keyed, and tier-native executio
- Checklist references remain freshness-checked consumers. `Plans/Section15_MVP_Promoted_Features_Spec.md` (`/Section15_MVP_Promoted_Features_Spec.md`) is verification-only unless upstream reconciliation reveals direct stale references that require edits; it is not the storage, command, permission, or
- 'Mutation and deprecation gates are first-class command constraints. `GATE-010` must evaluate subject-open commands, wrapper commands over canonical navigation, route-payload completeness, alias `/deprecation`, blocked-action admissibility against `allowed_action_ids` and `allowed_action_ids[]`, and '
- Assistant worktree commands share the orchestrator worktree directory family but use thread-derived names. Existing orchestrator worktrees keep `.puppet-master/worktrees/{tier_id}` style directory names; Assistant thread worktrees use `.puppet-master/worktrees/thread-{short_id}`, where `short_id` is
- '- generalized projection freshness uses storage and owner vocabulary: `storage-plan.md` and `storage-plan` reserve `trust_tier` for Preview and `/browser` semantics, so Commands uses projection-freshness and `/degraded` state for stale command projections rather than reusing `trust_tier` as a generi'
- 'This section owns `## 7. Reserved built-in slash commands` as the locked reserved-set contract. The same built-in slash-command family must stay visible here and in consumers: `/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`, `/settings`'
- 'Packet regeneration treats this owner as a `replace_section` unit: repairs for the reserved-set contract replace `## 7. Reserved built-in slash commands` itself rather than appending raw material after `### 6.3 Shortcut binding`, so stale-residue child/parent packet material cannot survive beside th'
- 'The `/web` family is reserved as one command family, not flattened into independent top-level commands. Bare `/web` has no-default execution behavior: it opens help/autocomplete only, and execution requires a subcommand such as `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web craw'
- 'Exact reserved-command behavior: bare /web has no default action, bare /skill is discovery or invocation only, /rewind dispatches conversation-only rewind, /revert dispatches file-mutation restore, /share/settings/doctor/help route to their owning surfaces, /cancel remains a deprecated alias to /sto'
- '- The reserved built-in slash-command set is locked and non-overridable; bare /web has no default action, bare /skill is discovery or invocation only, /cancel remains a deprecated alias to /stop, and /clear stays removed.'
- '- deprecated aliases shown distinctly from active commands'
owner_boundary_notes:
- '# Commands System (Canonical SSOT)'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- This document is the **single canonical source of truth** for the Puppet Master User Commands system — user-authored command presets that inject templated prompts into a run. All other plan documents MUST reference this document by anchor (e.g., `Plans/Commands_System.md#COMMAND-SCHEMA`) rather than
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '### 0.2 Cross-owner consumer boundaries'
- User Commands consume, but do not re-own, several adjacent runtime and provider contracts. For MCP prompt or tool OAuth flows, command loading and invocation defer to `Plans/Tools.md` `### Schema isolation and OAuth state`; Commands may surface the selected provider/scope and stable `client-id`, but
- 'For context behavior, Commands defer to `Plans/Run_Modes.md` `## 0. Scope and SSOT status`, `### SSOT references (DRY)`, and `## 7. Mode effects on context management`: `LF-006` and `LF-007` are treated as stale-residue / wrong-owner-routing failures whenever command prose sends detailed context-com'
- For storage and migration paths, command execution uses the storage owner detection order `config > $PUPPET_MASTER_DATA_DIR > project dir > global dir`; Commands may display the resolved storage-root or pass it through execution context, but migration, persistence, and path-resolution semantics stay
- 'For Assistant Chat message actions, Commands consume the owner-defined `Resend` semantics from `Plans/assistant-chat-design.md` and `Plans/UI_Command_Catalog.md`: `Resend` replays the latest user-authored message and discards later generated history/work, while command presets must not redefine it a'
- For clarification-request and `question-flow` behavior, command presets and wizard entry points defer to the shared question system in `Plans/assistant-chat-design.md` and the planning flow consumer rules in `Plans/chain-wizard-flexibility.md`; Commands may launch or reference those flows but do not
- For process coordination, Commands consume the resolved project `lock-file` path from the storage/runtime owner contract. The lock location derives from the storage logical-root with any safe-local-fallback defined by `Plans/storage-plan.md`; command templates must not invent an alternate lock direc
- Command-visible provider context is a projection of provider owners. For bridged providers, `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md`) owns the versioned correlation `/context` block and account-health semantics; Commands may surface those values when a command launches or resume
- Launcher and binary-location context is likewise owner-projected. `Plans/BinaryLocator_Spec.md` and `BinaryLocator_Spec` own OpenCode launcher ownership and binary discovery; Commands may invoke that resolved launcher, but it must treat rewrite-adjacent dead `four-tier` names, process-scope wording,
- 'Command-contract reconciliation is registry-facing, not prose-only. `Commands_System.md`, `Wiring_Matrix.md`, and `UI_Wiring_Rules.md` must keep command-contract `IDs` and validation hooks aligned: `/compact` stays reserved when `cmd.chat.compact_context` exists, `cmd.chat.run_user_command` cannot c'
- Route-like UICommands may be surfaced beside User Commands, but Commands does not let feature-local labels become private target models. In `Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`), `/UI` rows that still expose graph HITL `request_id` or `hitl_request_id` commands are a same-file con
- 'Command taxonomy is a three-way split, not a binary split: pure shell/view-state commands, route-consuming navigation commands, and domain mutation/runtime commands. Pure shell/view-state commands stay local and lightweight: they change what panel/subview/layout is visible, but they do not own canon'
- Command palette object results follow the same route model. Because `Plans/FinalGUISpec.md` (`/FinalGUISpec.md`) already defines the global command palette, Commands treats palette exposure as a consumer boundary. The command palette may expose Orchestrator object results, not just commands/pages or
- '`UI_Wiring_Rules.md` remains the wiring owner for reusable navigation commands and subject-open commands; Commands treats those as first-class wiring shapes with schema-level route-payload and `argument-contract` obligations, not as generic `args` smuggling.'
- Command-facing runtime identity is only a consumer of the owner split. `Plans/Prompt_Pipeline.md` defines requested/effective field meaning, `/runtime`, and dispatch presence; `Plans/storage-plan.md` defines persistence and `/projection`; executor docs define required dispatch/runtime boundaries; `M
- '`persona_override_owner_id` and requested account context are owner-projected runtime identity, not command-local state: shared runtime docs must not let `persona_override_owner_id` preserve `tier_id`-style ownership while wizard/interview flows move to non-tier execution semantics, and command cons'
- Execution-core context remains owner-routed. `Plans/Executor_Protocol.md`, `Executor_Protocol`, `orchestrator-subagent-integration.md`, `WorktreeGitImprovement.md`, and their runtime owners must reconcile node-native and node-sharded ingest with legacy `tier_id`, tier-keyed, and tier-native executio
owner_hints:
- Plans/Commands_System.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `25a6e3b81358a85e8b09ffd86c6d84019ac390ad9efa76b67f48deae697dd1a3`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Commands_System-S0001` through `Commands_System-S0053` are preserved in place and mapped in `coverage_map.jsonl` to `CS-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
