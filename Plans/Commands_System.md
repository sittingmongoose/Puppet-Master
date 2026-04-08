# Commands System (Canonical SSOT)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for the Puppet Master User Commands system — user-authored command presets that inject templated prompts into a run. All other plan documents MUST reference this document by anchor (e.g., `Plans/Commands_System.md#COMMAND-SCHEMA`) rather than restating command definitions, discovery paths, template syntax, or execution semantics.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

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

---

## 1. Definitions

<a id="DEF-USER-COMMAND"></a>
### 1.1 User Command (preset)

A **User Command** is a user-authored or catalog-installed command preset stored as a Markdown file with YAML frontmatter. When invoked, the template body is resolved (placeholders expanded, file includes loaded, shell output injected) and submitted as a prompt to the active chat thread or run. User Commands are the user-facing automation surface — they let users package repeatable prompt workflows without writing code.

<a id="DEF-UICOMMAND-DISTINCTION"></a>
### 1.2 UICommand (internal dispatch) — distinction

A **UICommand** (`Plans/Contracts_V0.md#UICommand`, `Plans/UI_Command_Catalog.md`) is an internal UI dispatch identifier (e.g., `cmd.chat.model`, `cmd.lsp.goto_definition`). UICommands are stable IDs that bind UI elements to handlers. They are **not** user-authored; they are developer-defined, code-registered, and wiring-matrix-verified.

User Commands and UICommands are orthogonal:
- User Commands are **content presets** (prompt templates).
- UICommands are **internal dispatch actions** (UI handler bindings).

A User Command's invocation through the chat slash-command surface or command palette ultimately dispatches a UICommand (`cmd.chat.run_user_command`) to trigger execution, but the User Command itself is not a UICommand.

ContractRef: ContractName:Plans/Contracts_V0.md#UICommand, ContractName:Plans/UI_Command_Catalog.md

### 1.3 Invocation surfaces

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

Reserved built-ins and their families cannot be overridden by provider, skill, or extension naming.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

Collision rules:
- `/web` reserves the family namespace for `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, and `/web map`
- `/worktree` is reserved and cannot be re-bound by a custom command
- `/skill` remains a built-in helper surface even though it is not part of the reserved built-in set owned here
- natural-language and slash dispatch share the same underlying dispatcher, so collision handling is consistent across both entry points

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

ContractRef: ContractName:Plans/Permissions_System.md#TOOL-KEYS

<a id="TEMPLATE-SHELL-INJECTION"></a>
#### 3.3.3 Shell output injection (`` !`command` ``)

The pattern `` !`shell-command` `` in the template body executes the shell command and injects its stdout at that position during template resolution.

**Permission guard:** Shell injection is checked against the `bash` permission key (`Plans/Permissions_System.md` §5). If the active permission resolves to `deny`, the injection is blocked and an error message is substituted. If `ask`, the approval UI is shown and the user's response (`deny`/`once`/`for session`/`always`) is respected per `Plans/Permissions_System.md` §6.

ContractRef: ContractName:Plans/Permissions_System.md#TOOL-KEYS, ContractName:Plans/Permissions_System.md#ASK-FLOW

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

### 4.2 Subtask execution

When `subtask: true` is set, the command launches a canonical child run through the same delegated-run contract used everywhere else.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

Required behavior:
- resolve requested and effective Persona/runtime/model/effort state using the same pipeline as any other child run.
- classify the child as `required` or `optional`; `required` is the safer default for command subtasks unless the command explicitly declares advisory behavior.
- inherit and then narrow the parent permission ceiling and compatible capability universe.
- record the parent-child linkage in canonical event and storage records.
- do not silently fallback when the command explicitly requested a runtime surface that is unavailable or incompatible.

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

Command overrides are explicit child requests, not bypasses around the runtime model.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/CLI_Bridged_Providers.md

Rules:
- command mode overrides are capped by parent mode authority.
- command model/runtime surface overrides become explicit child requests.
- explicit requests do not silently fallback.
- requested versus effective runtime/model/effort fields remain visible when remaps occur because of compatibility or policy.
### 4.5 Template resolution order

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

ContractRef: ContractName:Plans/Permissions_System.md#ASK-FLOW, ContractName:Plans/Permissions_System.md#RESOLUTION

### 5.2 File inclusion permission check

File inclusion (`@path`) is evaluated against the `read` permission key. The file path is the invocation context. Same `ask` flow semantics apply.

ContractRef: ContractName:Plans/Permissions_System.md#TOOL-KEYS

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
The reserved built-in slash-command set is:

`/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/web`, `/skill`

ContractRef: ContractName:Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved), ContractName:Plans/assistant-chat-design.md#5.1 Reserved built-ins

Additional rules:
- `/cancel` is a deprecated compatibility alias to `/stop`
- `/clear` is removed from live canon
- bare `/web` opens help/autocomplete and has no default operation
- the stable `/web` family identities are `/web search`, `/web fetch`, `/web extract`, `/web research`, `/web crawl`, and `/web map`
- bare `/skill` is a discovery or invocation affordance and is not equivalent to “open panel”
- reserved commands shown as non-editable in catalog
- deprecated aliases shown distinctly from active commands
- `/web` remains discoverable in catalog
- subcommand is required for execution, URL normalization applies, and parse failure shows usage for `/web` execution paths

Rules:
- reserved slash command
- alias/deprecation state
- catalog editability
- /cancel resolves internally to cmd.chat.stop
- /clear is removed from live canon, not merely hidden
- bare /web opens help/autocomplete and has no default operation
- bare /skill is a discovery or invocation affordance, not panel-open shorthand
- Keep slash-command consumers anchored to Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved) and Plans/assistant-chat-design.md#5.1 Reserved built-ins
## 7. UICommand catalog entry

<a id="UICOMMAND-ENTRY"></a>

The following UICommand ID is registered in `Plans/UI_Command_Catalog.md` for dispatching User Command execution from any invocation surface:

| Command ID | Args schema (keys only) | Expected events | Affected surfaces |
|---|---|---|---|
| `cmd.chat.run_user_command` | `{ command_name, arguments? }` | `tool.invoked` (if subtask) or `chat.message.submitted` | Assistant chat, Command palette |

Reserved slash-command UICommand IDs (`cmd.chat.new`, `cmd.chat.model`, etc.) are defined in `Plans/UI_Command_Catalog.md` §2.7 and are distinct from User Command execution.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md#UICommand

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
**AC-CMD03:** Template resolution (§4.5) MUST follow the defined order: frontmatter parse → placeholder extraction → placeholder substitution → file includes → shell injection.

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
