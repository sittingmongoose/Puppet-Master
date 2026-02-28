# OpenCode Deep Extraction (for Puppet Master)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
Purpose:
- Provide a deterministic, repeatable procedure for extracting **architecture-relevant** patterns from the OpenCode repo to inform Puppet Master plans and implementations.
- This document is not a design fork: Puppet Master remains governed by its own locked decisions; OpenCode is used as a reference implementation.
- Serves as the "known good baseline" that Puppet Master adopts, then modifies via delta hooks.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

---

## Baseline Snapshot

| Field | Value |
|---|---|
| **Snapshot location** | Local OpenCode snapshot (pinned by repo owner) |
| **Snapshot date** | 2026-02-27 UTC |
| **Version policy** | Do not verify version; snapshot pinned manually by repo owner. |

---

## 1. Goal
Extract reusable, implementation-grade guidance from OpenCode (run modes, agents, permissions, commands, formatters, skills, plugins, models, provider streams, UI command patterns, storage/event envelope conventions) and map those findings into Puppet Master's SSOT plans **without** importing drift-prone details. This document provides a "known good baseline" for Puppet Master to adopt, then modify.

## 2. Hard constraints
- Puppet Master's locked stack decisions always win over OpenCode's choices.
- Extraction must be autonomous and deterministic (no mid-run human decisions).
- Output must be actionable: findings must map to an existing Puppet Master plan doc section (or be explicitly discarded with a reason).

## 3. Inputs
- OpenCode repository: https://github.com/anomalyco/opencode
- Puppet Master Plans directory (SSOT).

## 4. Deterministic extraction procedure
1) **Reference the OpenCode upstream repository** (https://github.com/anomalyco/opencode) via its web interface or API — do not clone it into Puppet Master.
2) **Inventory OpenCode surfaces** (deterministic list):
   - Tools model + permissions model
   - Provider execution model (streaming events, tool use/result)
   - UI command catalog / command dispatch pattern
   - Storage/persistence model (event log, projections)
3) **Extract canonical artifacts** (ordered):
   - Any markdown docs describing contracts and payload shapes
   - Any schema files (JSON schema, TS types, Rust types)
   - Any code paths implementing the contracts
4) **Normalize into Puppet Master terms**:
   - "Provider", "EventRecord", "UICommand", "tool.invoked/tool.denied" as Puppet Master contract names.
   - When OpenCode uses different naming, record it as an OpenCode-only term and translate.
5) **Map findings into Puppet Master SSOT docs**:
   - For each extracted concept, choose exactly one target plan doc section to update (or mark as discarded).
   - Never duplicate: add a reference to the correct SSOT doc instead of copying long definitions.
6) **No local clone cleanup required** — extraction reads from the upstream repo directly; nothing to delete.

## 5. Output format (for downstream agents)
For each extracted item, emit a record with:
- `source`: file path + snippet
- `category`: tools | permissions | provider_stream | ui_commands | storage
- `puppet_master_target`: `Plans/<doc>.md#<section>`
- `decision`: adopt | adapt | discard
- `rationale`: 1-3 sentences
- `acceptance_impact`: what new acceptance criteria (if any) become testable

## 6. Acceptance criteria
- Extraction can run end-to-end without prompts.
- Every adopted/adapted item is mapped to a single Puppet Master SSOT doc section.
- Temporary OpenCode clone is deleted after completion.
- No Puppet Master locked decisions are overwritten by OpenCode-derived content.

---

## 7. Expanded Extraction Coverage

### 7A. Run Modes and Enforcement

#### 7A.1 Plan mode

**File pointers:**
- System reminder injected for plan agent: `packages/opencode/src/session/prompt/plan.txt`
- Plan mode enforcement & plan-to-build switching: `packages/opencode/src/session/prompt.ts` -> `insertReminders()` (line ~1321)
- Plan exit tool (asks user to switch to build): `packages/opencode/src/tool/plan.ts` -> `PlanExitTool`

**Behavior summary:**
- When the active agent is `plan`, OpenCode injects a `<system-reminder>` block into the last user message's parts (as a synthetic text part). This reminder declares plan mode as ACTIVE and states: "STRICTLY FORBIDDEN: ANY file edits, modifications, or system changes."
- The plan agent is only permitted to edit `.opencode/plans/*.md` files and its own plan file. All other edit tools are denied at the permission layer (see agent definition in `agent.ts` lines ~96-114 where `edit: { "*": "deny", ... }` is set).
- The `plan.txt` prompt template defines a multi-phase workflow: (1) Initial Understanding via explore subagents, (2) Design via general agents, (3) Review, (4) Final Plan writing, (5) calling `plan_exit` tool.
- `PlanExitTool` uses `Question.ask()` to ask the user "Would you like to switch to the build agent?". On approval, it creates a synthetic user message with `agent: "build"` and text "Execute the plan", effectively switching the agent for the session.
- There is also an experimental plan mode flag (`Flag.OPENCODE_EXPERIMENTAL_PLAN_MODE`) that controls a richer plan mode flow with plan file creation/detection, phase instructions, and a build-switch reminder when transitioning from plan to build.

#### 7A.2 Agent/mode switching

**File pointers:**
- Agent switching via synthetic user messages: `packages/opencode/src/tool/plan.ts` (lines ~46-65)
- Agent resolution in loop: `packages/opencode/src/session/prompt.ts` -> `loop()` (line ~557)
- Agent part detection for bypass: `packages/opencode/src/session/prompt.ts` (line ~599)

**Behavior summary:**
- Mode switching is achieved by creating a new `MessageV2.User` with an explicit `agent` field (e.g., `"build"` or `"plan"`). The main loop reads `lastUser.agent` to determine which agent to use for the next assistant turn.
- The `@agent` syntax in user input creates an `AgentPart` which triggers `bypassAgentCheck` in tool resolution.
- When switching from plan to build, a `BUILD_SWITCH` reminder prompt is injected so the build agent knows to execute the plan.

#### 7A.3 Ask/approval semantics

**File pointers:**
- Question system: `packages/opencode/src/question/` (imported as `Question` in `plan.ts`)
- Permission ask flow: `packages/opencode/src/permission/next.ts` -> `ask()` function (line ~131)

**Behavior summary:**
- `Question.ask()` presents the user with structured questions (header + options). It blocks the tool execution until the user responds. A "No" / rejection throws `Question.RejectedError`.
- Permission `ask()` fires a `permission.asked` bus event and returns a Promise that resolves when the user replies. The Promise rejects with `RejectedError`, `CorrectedError`, or `DeniedError` depending on the outcome.

---

### 7B. Subagents, Roles/Personas, and Context Injection

#### 7B.1 Agent definitions and fields

**File pointers:**
- Agent namespace + Info schema: `packages/opencode/src/agent/agent.ts` -> `Agent.Info` (lines ~24-48)

**Behavior summary:**
The `Agent.Info` Zod schema defines these fields:

| Field | Type | Purpose |
|---|---|---|
| `name` | `string` | Agent identifier (e.g., `"build"`, `"plan"`, `"explore"`) |
| `description` | `string?` | Human-readable description shown to users |
| `mode` | `"subagent" \| "primary" \| "all"` | Controls whether agent can be default or is subagent-only |
| `native` | `boolean?` | Whether this is a built-in agent |
| `hidden` | `boolean?` | Whether the agent is hidden from user selection |
| `topP` / `temperature` | `number?` | LLM sampling parameters |
| `color` | `string?` | UI color for the agent |
| `permission` | `PermissionNext.Ruleset` | Ordered list of permission rules for this agent |
| `model` | `{modelID, providerID}?` | Per-agent model override |
| `variant` | `string?` | Model variant override |
| `prompt` | `string?` | Custom system prompt for this agent |
| `options` | `Record<string, any>` | Provider-specific options |
| `steps` | `number?` | Max number of loop steps for this agent |

Built-in agents: `build` (default primary), `plan` (primary, read-only), `general` (subagent, multi-step), `explore` (subagent, read-only), `compaction` (hidden, internal), `title` (hidden, internal), `summary` (hidden, internal).

User-defined agents from config: processed at lines ~205-231 in `agent.ts`. A user can override `model`, `variant`, `prompt`, `description`, `temperature`, `topP`, `mode`, `color`, `hidden`, `name`, `steps`, `options`, and `permission`. Setting `disable: true` removes the agent.

#### 7B.2 Subagent invocation mechanism

**File pointers:**
- Task tool (subagent launcher): `packages/opencode/src/tool/task.ts`
- Subtask part handling in loop: `packages/opencode/src/session/prompt.ts` -> `loop()` (lines ~352-526)

**Behavior summary:**
- Subagents are invoked via the `task` tool. The LLM calls `task({ prompt, description, subagent_type, command })`.
- In the main loop, pending `SubtaskPart` entries are popped and executed: a new assistant message is created with `agent: task.agent`, a ToolPart with status `"running"` is written, `Plugin.trigger("tool.execute.before")` is called, then the task tool's `execute()` runs, followed by `Plugin.trigger("tool.execute.after")`.
- After subtask completion, if `task.command` was set, a synthetic user message "Summarize the task tool output above and continue with your task" is injected.
- The subagent inherits the agent's permission ruleset merged with session-level permissions.

#### 7B.3 Explore agent baseline

**File pointers:**
- Explore agent prompt: `packages/opencode/src/agent/prompt/explore.txt`
- Explore agent definition: `packages/opencode/src/agent/agent.ts` (lines ~130-156)

**Behavior summary:**
- The explore agent is a read-only subagent. Its system prompt declares it as a "file search specialist" skilled at glob patterns, regex grep, and file reading.
- Permission-wise, it starts with `"*": "deny"` then explicitly allows: `grep`, `glob`, `list`, `bash`, `webfetch`, `websearch`, `codesearch`, `read`. It also allows `external_directory` for skill dirs and truncation glob. No edit tools are available.
- Guidelines: use Glob for broad patterns, Grep for content search, Read for known paths, Bash for file operations. Must not create files or modify system state. Returns absolute file paths.

#### 7B.4 Prompt assembly pipeline

**File pointers:**
- System prompt construction: `packages/opencode/src/session/system.ts` -> `SystemPrompt.environment()`
- Instruction prompts: `packages/opencode/src/session/instruction.ts`
- Message-to-model-messages conversion: `packages/opencode/src/session/message-v2.ts` -> `toModelMessages()`
- Plugin system prompt transform: `packages/opencode/src/session/prompt.ts` (line ~648)
- Model-specific prompts: `packages/opencode/src/session/prompt/anthropic.txt`, `codex_header.txt`, `gemini.txt`, `beast.txt`, etc.

**Behavior summary:**
The prompt assembly pipeline (executed per loop iteration in `SessionPrompt.loop()`):
1. **System prompt**: `SystemPrompt.environment(model)` builds environment context (model name, working directory, git status, platform, date) + model-specific base prompt selected by model ID (Claude -> anthropic.txt, GPT-5 -> codex_header.txt, Gemini -> gemini.txt, etc.).
2. **Instruction prompts**: `InstructionPrompt.system()` loads project/user instruction files.
3. **Structured output prompt**: Appended if `format.type === "json_schema"`.
4. **Plugin transform**: `Plugin.trigger("experimental.chat.system.transform")` allows plugins to modify the system prompt array.
5. **Messages transform**: `Plugin.trigger("experimental.chat.messages.transform")` allows plugins to modify the message history.
6. **Reminders injection**: `insertReminders()` injects plan mode prompts, build-switch prompts, and queued-user-message `<system-reminder>` wrappers.
7. **Model messages**: `MessageV2.toModelMessages(msgs, model)` converts the internal message/part representation to the AI SDK's `ModelMessage[]` format.

#### 7B.5 Compaction triggers and continuation summaries

**File pointers:**
- Compaction logic: `packages/opencode/src/session/compaction.ts`
- Compaction agent prompt: `packages/opencode/src/agent/prompt/compaction.txt`
- Summary agent prompt: `packages/opencode/src/agent/prompt/summary.txt`
- Compaction trigger in loop: `packages/opencode/src/session/prompt.ts` (lines ~541-553)

**Behavior summary:**
- **Overflow detection**: `SessionCompaction.isOverflow()` checks if total token count (input+output+cache) exceeds the model's usable context window (context minus reserved tokens, default reserve 20,000).
- **Trigger**: When overflow is detected after a completed assistant message, `SessionCompaction.create()` inserts a `CompactionPart` into the message stream, which the loop processes on the next iteration.
- **Pruning**: `SessionCompaction.prune()` walks backward through tool call parts and erases the output of old completed tool calls beyond a 40,000-token protection window, preserving the most recent context. Protected tools (e.g., `skill`) are never pruned.
- **Plugin hook**: `"experimental.session.compacting"` allows plugins to add context strings or replace the compaction prompt entirely.
- **Summary agent**: Hidden `summary` agent generates continuation summaries for session resumption.

---

### 7C. Permissions and Approval Mechanics

#### 7C.1 Permission resolution algorithm

**File pointers:**
- Core resolver: `packages/opencode/src/permission/next.ts` -> `evaluate()` (line ~236)
- `fromConfig()`: line ~46; `merge()`: line ~64

**Behavior summary:**
- `PermissionNext.evaluate(permission, pattern, ...rulesets)` merges all rulesets (via flat concatenation), then calls `merged.findLast(rule => Wildcard.match(permission, rule.permission) && Wildcard.match(pattern, rule.pattern))`.
- **Last match wins**: because `findLast` is used, rules appended later (higher-priority rulesets) override earlier ones. `PermissionNext.merge(...rulesets)` simply concatenates arrays; rule order within each ruleset is preserved.
- If no rule matches, the default is `{ action: "ask" }`.
- The `ask()` function iterates over all patterns in the request; if any pattern evaluates to `"deny"`, a `DeniedError` is thrown immediately. If any evaluates to `"ask"`, a permission request is published to the bus and the function blocks on a Promise. `"allow"` continues to the next pattern.

#### 7C.2 Granular object-syntax matching

**File pointers:**
- `fromConfig()`: `packages/opencode/src/permission/next.ts` (line ~46)

**Behavior summary:**
- Config permissions can be simple strings (`"*": "allow"`) or objects where keys are patterns and values are actions (`read: { "*": "allow", "*.env": "ask" }`).
- `fromConfig()` converts the config representation to a `Ruleset` (array of `{permission, pattern, action}` rules). For object syntax, each key-value pair becomes a separate rule with the outer key as `permission` and the inner key as `pattern`.

#### 7C.3 Wildcard matching

**File pointers:**
- Wildcard engine: `packages/opencode/src/util/wildcard.ts`

**Behavior summary:**
- `*` matches 0+ characters (converted to `.*` in regex), `?` matches exactly 1 character (converted to `.`).
- **Special case**: If a pattern ends with ` *` (space + wildcard), the trailing portion becomes optional. This allows `"ls *"` to match both `"ls"` and `"ls -la"`.
- Home expansion (`~` and `$HOME`) is handled in `PermissionNext.expand()` before rule creation, not in wildcard matching.
- On Windows, matching is case-insensitive.

#### 7C.4 Special guards: external_directory, doom_loop

**File pointers:**
- Default permission setup: `packages/opencode/src/agent/agent.ts` -> `state()` (lines ~56-73)
- `disabled()` check: `packages/opencode/src/permission/next.ts` (line ~247)

**Behavior summary:**
- `external_directory`: Defaults to `"ask"`. Controls whether tools can access files outside the working directory. Whitelisted directories (truncation glob + skill directories) are auto-allowed.
- `doom_loop`: Defaults to `"ask"`. Guards against infinite/repetitive behavior.
- `question`, `plan_enter`, `plan_exit`: Default `"deny"` globally, selectively enabled per agent (e.g., `question: "allow"` for build and plan agents).

#### 7C.5 Ask UI semantics (once / always / reject)

**File pointers:**
- Reply enum + `reply()` function: `packages/opencode/src/permission/next.ts` (lines ~89-233)

**Behavior summary:**
- `once`: Resolves the pending permission promise; one-time approval. No persistent rule is saved.
- `always`: Adds a new `"allow"` rule to the session-scoped approved ruleset for each pattern in the request's `always` array. Then resolves the current request AND auto-resolves any other pending permission requests in the same session that now pass evaluation.
- `reject`: Rejects the current request's promise with either `CorrectedError(message)` (if the user provided feedback text) or `RejectedError` (bare rejection). Additionally, rejects ALL other pending permission requests for the same session.

#### 7C.6 Default .env deny rules

**File pointers:**
- Default read permissions: `packages/opencode/src/agent/agent.ts` (lines ~67-72)

**Behavior summary:**
- `read: { "*": "allow", "*.env": "ask", "*.env.*": "ask", "*.env.example": "allow" }` -- mirrors the Node.gitignore pattern. Reading `.env` and `.env.*` files requires user approval, but `.env.example` is always allowed.

---

### 7D. Commands

#### 7D.1 Discovery paths

**File pointers:**
- Command loading + state: `packages/opencode/src/command/index.ts` -> `state()` (lines ~59-141)
- Markdown template parsing: `packages/opencode/src/config/markdown.ts`

**Behavior summary:**
Commands are loaded from three sources in this order:
1. **Built-in commands**: `init` (create/update AGENTS.md) and `review` (review changes).
2. **Config-defined commands**: From `config.command` entries (JSON config file).
3. **MCP prompts**: From MCP servers via `MCP.prompts()`, converted to commands.
4. **Skills**: All loaded skills are added as invokable commands (skip if name collides with an existing command).

Project-level commands: `.opencode/commands/<name>.md`
Global commands: `~/.config/opencode/commands/<name>.md`

#### 7D.2 Frontmatter fields

**File pointers:**
- Command.Info schema: `packages/opencode/src/command/index.ts` (lines ~24-39)

**Behavior summary:**

| Field | Type | Purpose |
|---|---|---|
| `name` | `string` | Command identifier |
| `description` | `string?` | Human-readable description |
| `agent` | `string?` | Override which agent runs this command |
| `model` | `string?` | Override which model runs this command (provider/model format) |
| `source` | `"command" \| "mcp" \| "skill"` | Origin of the command |
| `template` | `string \| Promise<string>` | Template content (may be async for MCP prompts) |
| `subtask` | `boolean?` | Whether to run as a subtask |
| `hints` | `string[]` | Extracted placeholder names (`$1`, `$2`, `$ARGUMENTS`) |

#### 7D.3 Template features

**File pointers:**
- Placeholder extraction: `packages/opencode/src/command/index.ts` -> `hints()` (line ~44)
- File references: `packages/opencode/src/config/markdown.ts` -> `FILE_REGEX` (line ~7)
- Shell injection: `packages/opencode/src/config/markdown.ts` -> `SHELL_REGEX` (line ~8)
- Template resolution: `packages/opencode/src/session/prompt.ts` -> `resolvePromptParts()` (line ~187)

**Behavior summary:**
- **Positional args**: `$1`, `$2`, ... and `$ARGUMENTS` (all remaining text).
- **Shell output injection**: `` !`command` `` -- backtick-wrapped shell command prefixed with `!`, output is injected at template resolution time.
- **`@file` inclusion**: `@path/to/file` -- the `FILE_REGEX` matches `@`-prefixed paths. `resolvePromptParts()` resolves these to `FilePart` entries (for files/directories) or `AgentPart` entries (if the path matches an agent name).

#### 7D.4 Subtask behavior and model override

**Behavior summary:**
- When `subtask: true`, the command runs as a subagent task rather than a primary prompt.
- `model` override uses the `provider_id/model_id` format, parsed by `Provider.parseModel()`.
- Custom commands can override built-in commands by registering with the same name. Config commands are processed after built-ins, so they win.

---

### 7E. Formatters

#### 7E.1 When they run

**File pointers:**
- Format init (event subscription): `packages/opencode/src/format/index.ts` -> `Format.init()` (line ~104)
- File.Event.Edited bus event: subscribed in `Format.init()`

**Behavior summary:**
- Formatters run automatically after every `File.Event.Edited` bus event. When a file is edited by any tool, the bus fires the event and `Format.init()` catches it, determines the file extension, finds matching enabled formatters, and runs them sequentially.

#### 7E.2 Built-in selection

**File pointers:**
- Formatter definitions: `packages/opencode/src/format/formatter.ts`

**Behavior summary:**
Built-in formatters (each with auto-detection logic):

| Formatter | Extensions | Detection |
|---|---|---|
| `prettier` | .js, .jsx, .ts, .tsx, .html, .css, .json, .yaml, .md, ... | `prettier` in package.json dependencies |
| `biome` | Same as prettier + more | `biome.json` / `biome.jsonc` exists |
| `rustfmt` | .rs | `rustfmt` binary available |
| `gofmt` | .go | `gofmt` binary available |
| `ruff` | .py, .pyi | `ruff` binary + config present |
| `shfmt` | .sh, .bash | `shfmt` binary available |
| `clang-format` | .c, .cpp, .h, ... | `.clang-format` file exists |
| `dart` | .dart | `dart` binary available |
| `mix` | .ex, .exs, .eex, ... | `mix` binary available |
| `zig` | .zig, .zon | `zig` binary available |
| `ktlint` | .kt, .kts | `ktlint` binary available |
| `rubocop` | .rb, .rake, ... | `rubocop` binary available |
| `standardrb` | .rb, .rake, ... | `standardrb` binary available |
| `pint` | .php | `laravel/pint` in composer.json |
| `ocamlformat` | .ml, .mli | `ocamlformat` binary + `.ocamlformat` exists |
| `nixfmt` | .nix | `nixfmt` binary available |
| `ormolu` | .hs | `ormolu` binary available |
| `terraform` | .tf, .tfvars | `terraform` binary available |
| `latexindent` | .tex | `latexindent` binary available |
| `gleam` | .gleam | `gleam` binary available |
| `cljfmt` | .clj, .cljs, ... | `cljfmt` binary available |
| `oxfmt` | .js, .ts, ... | Experimental flag + `oxfmt` in deps |
| `uv` | .py, .pyi | `uv format --help` succeeds and ruff not enabled |
| `air` | .R | `air` binary with R formatter capability |
| `htmlbeautifier` | .erb | `htmlbeautifier` binary available |
| `dfmt` | .d | `dfmt` binary available |

#### 7E.3 Config schema and $FILE placeholder

**File pointers:**
- Config processing: `packages/opencode/src/format/index.ts` -> `state()` (lines ~27-65)
- Formatter interface: `packages/opencode/src/format/formatter.ts` -> `Info` interface (lines ~1-14)

**Behavior summary:**
- Config `formatter: false` disables all formatters globally.
- Per-formatter config: `{ disabled: boolean, command: string[], environment: Record<string, string>, extensions: string[] }`.
- `$FILE` in the command array is replaced with the actual file path at execution time (line ~115 in `index.ts`).
- Custom formatters can be added by defining `command` and `extensions` in config. If `command.length === 0`, the formatter is skipped. The `enabled()` check is replaced with `async () => true` for config-defined formatters.

---

### 7F. Skills

#### 7F.1 Discovery paths

**File pointers:**
- Skill loading: `packages/opencode/src/skill/skill.ts` -> `state()` (lines ~52-176)
- Remote skill discovery: `packages/opencode/src/skill/discovery.ts`

**Behavior summary:**
Skills are discovered from multiple sources in this order (later sources overwrite earlier on name collision):
1. **External dirs (global)**: `~/.claude/skills/**/SKILL.md`, `~/.agents/skills/**/SKILL.md` (unless `OPENCODE_DISABLE_EXTERNAL_SKILLS` flag is set)
2. **External dirs (project)**: Walking up from project directory to worktree root, checking `.claude/` and `.agents/` for `skills/**/SKILL.md`
3. **OpenCode dirs**: `.opencode/{skill,skills}/**/SKILL.md` (project + global config directories)
4. **Config paths**: `config.skills.paths[]` -- arbitrary directories scanned for `**/SKILL.md`
5. **Config URLs**: `config.skills.urls[]` -- remote indexes fetched, skills downloaded to cache (`Discovery.pull()`)

#### 7F.2 Frontmatter fields and validation

**File pointers:**
- Skill.Info schema: `packages/opencode/src/skill/skill.ts` (lines ~18-24)
- Parsing via ConfigMarkdown: `packages/opencode/src/config/markdown.ts`

**Behavior summary:**

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | `string` | Yes | Regex: `^[a-z0-9]+(-[a-z0-9]+)*$`, 1-64 chars |
| `description` | `string` | Yes | 1-1024 chars |
| `location` | `string` | Auto | Set to file path during loading |
| `content` | `string` | Auto | Body of the markdown file (after frontmatter) |

Additional fields from the spec (`license`, `compatibility`, `metadata`) may appear in frontmatter but are not used by the core loading logic -- only `name` and `description` are validated via `Info.pick({ name: true, description: true }).safeParse()`.

- **Name mismatch**: `SkillNameMismatchError` is defined but validation uses directory-based detection (the skill name from frontmatter is used as the key, not the directory name).
- **Duplicate handling**: If two skills share a name, a warning is logged and the later-loaded skill overwrites the earlier one.

#### 7F.3 How skills appear to the agent

**File pointers:**
- Skills registered as commands: `packages/opencode/src/command/index.ts` (lines ~126-138)
- Skill tool: referenced in the `skill` permission key

**Behavior summary:**
- Skills are listed in the `skill` tool description with `<available_skills>` XML blocks containing name and description.
- The agent invokes a skill via `skill({ name })` which loads the skill's content.
- Skills are also registered as invokable commands (so `/skillname` works from the command palette).

#### 7F.4 Permissions integration

**Behavior summary:**
- The `skill` permission key supports patterns (e.g., `skill: { "my-skill": "allow", "*": "deny" }`).
- Skill directories are automatically whitelisted for `external_directory` permission (see `agent.ts` line ~55: `skillDirs.map(dir => path.join(dir, "*"))` added to whitelisted dirs).
- Skill tool calls are protected from pruning during compaction (`PRUNE_PROTECTED_TOOLS = ["skill"]`).

---

### 7G. Plugins

#### 7G.1 Discovery sources and load order

**File pointers:**
- Plugin loader: `packages/opencode/src/plugin/index.ts` -> `state()` (lines ~24-103)

**Behavior summary:**
Plugin loading order:
1. **Internal plugins** (directly imported, not npm-installed): `CodexAuthPlugin`, `CopilotAuthPlugin`, `GitlabAuthPlugin`
2. **Built-in npm plugins**: `["opencode-anthropic-auth@0.0.13"]` (unless `OPENCODE_DISABLE_DEFAULT_PLUGINS` flag)
3. **Config plugins**: `config.plugin[]` -- either npm package specifiers (`pkg@version`) or `file://` local paths

For npm plugins, `BunProc.install(pkg, version)` installs the package, then `import(plugin)` loads it. Deduplication prevents the same function from being initialized twice (via `Set<PluginInstance>`).

#### 7G.2 Plugin context and signature

**File pointers:**
- Plugin input type: `packages/opencode/src/plugin/index.ts` (lines ~33-40)
- Plugin type definition: `packages/plugin/src/index.ts`

**Behavior summary:**
A plugin is an async function receiving `PluginInput`:
```
{ client, project, worktree, directory, serverUrl, $ }
```
- `client`: OpenCode SDK client (API access)
- `project`: Project metadata
- `worktree` / `directory`: Filesystem context
- `$`: Bun shell for subprocess execution

The function returns a `Hooks` object with optional event handlers.

#### 7G.3 Key hook events

**File pointers:**
- Hooks interface: `packages/plugin/src/index.ts` -> `interface Hooks` (line ~148)

**Behavior summary:**

| Hook | Signature | Purpose |
|---|---|---|
| `event` | `({event}) => void` | Receives ALL bus events (subscribed via `Bus.subscribeAll`) |
| `config` | `(config) => void` | Called once with resolved config |
| `tool` | `Record<string, ToolDefinition>` | Custom tool definitions (object, not function) |
| `auth` | `AuthHook` | Authentication provider |
| `chat.message` | `(input, output) => void` | Called when a new user message is received |
| `chat.params` | `(input, output) => void` | Modify LLM parameters (temperature, topP, topK, options) |
| `chat.headers` | `(input, output) => void` | Modify request headers sent to LLM provider |
| `permission.ask` | `(input, output) => void` | Override permission decisions |
| `command.execute.before` | `(input, output) => void` | Before command execution (can modify parts) |
| `tool.execute.before` | `(input, output) => void` | Before tool execution (can modify args) |
| `tool.execute.after` | `(input, output) => void` | After tool execution (can modify result) |
| `shell.env` | `(input, output) => void` | Modify shell environment variables |
| `experimental.chat.messages.transform` | `(input, output) => void` | Modify message history before sending to LLM |
| `experimental.chat.system.transform` | `(input, output) => void` | Modify system prompt array |
| `experimental.session.compacting` | `(input, output) => void` | Customize compaction (add context or replace prompt) |
| `experimental.text.complete` | `(input, output) => void` | Called when text part is complete |

#### 7G.4 Custom tools and precedence

**Behavior summary:**
- Plugins define tools via the `tool` property on the hooks object (a `Record<string, ToolDefinition>`).
- Plugin tools are loaded in `ToolRegistry` alongside built-in tools.
- **On name collision, plugin tools override built-in tools** -- this is by design for extensibility.

---

### 7H. Models

#### 7H.1 Provider/model ID format

**File pointers:**
- `parseModel()`: `packages/opencode/src/provider/provider.ts` (line ~1315)
- Provider state + model registry: `packages/opencode/src/provider/provider.ts` -> `state()`

**Behavior summary:**
- Format: `provider_id/model_id` (e.g., `anthropic/claude-sonnet-4`).
- `parseModel()` splits on the first `/`: everything before is `providerID`, everything after (joined by `/`) is `modelID`.

#### 7H.2 Default model selection and loading priority

**File pointers:**
- `defaultModel()`: `packages/opencode/src/provider/provider.ts` (line ~1288)
- Model priority sorting: `packages/opencode/src/provider/provider.ts` -> `sort()` (line ~1279)

**Behavior summary:**
Loading priority (first match wins):
1. **Config `model` field**: `config.model` -> `parseModel()` -> done
2. **Last used**: Reads `model.json` from state directory, checks each `{providerID, modelID}` against available providers
3. **First by internal priority**: Sorts available models by priority list `["gpt-5", "claude-sonnet-4", "big-pickle", "gemini-3-pro"]` (descending priority), then by `"latest"` suffix, then by ID

Note: CLI flag override happens upstream of `defaultModel()` (at the prompt input level where `model` is passed explicitly).

#### 7H.3 Model options and variants

**File pointers:**
- Provider options: `packages/opencode/src/provider/provider.ts` -> custom loaders (lines ~119-260)
- Transform layer: `packages/opencode/src/provider/transform.ts`

**Behavior summary:**
- Model options are set via `config.provider.<provider>.options` and provider-specific loaders.
- Examples: Anthropic adds `anthropic-beta` headers for claude-code/interleaved-thinking; OpenAI uses `.responses()` API; Bedrock configures region/profile/credentials.
- **Variants**: Built-in + custom variants, cycling via keybind in UI. Per-agent overrides via `agent.<name>.variant`.
- **Per-agent model overrides**: `agent.<name>.model` (parsed via `parseModel()`) allows each agent to use a different model.

#### 7H.4 Provider transform layer

**File pointers:**
- Transform namespace: `packages/opencode/src/provider/transform.ts`

**Behavior summary:**
- `normalizeMessages()`: Provider-specific message normalization (e.g., Anthropic rejects empty content, Claude needs toolCallId normalization for non-string IDs).
- `providerOptions()`: Builds provider-specific options (instructions for OpenAI, caching for Anthropic, etc.).
- `schema()`: Transforms tool JSON schemas for provider compatibility.
- `maxOutputTokens()`: Determines max output tokens per model (default 32,000 or flag override).
- Output token limits are set via `OUTPUT_TOKEN_MAX` (configurable via `OPENCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX`).

#### 7H.5 Error handling

**File pointers:**
- Error namespace: `packages/opencode/src/provider/error.ts`

**Behavior summary:**
- `isOverflow()`: Detects context overflow via regex patterns matching error messages from 12+ providers (Anthropic, Bedrock, OpenAI, Google, xAI, Groq, DeepSeek, etc.).
- `isRetryable()`: Provider-specific retryability (e.g., OpenAI 404s are treated as retryable).
- Error message extraction: Attempts to parse `responseBody` JSON for nested error messages.

---

## 8. Contract Mapping to Puppet Master SSOT (DRY)

This section is the canonical mapping from OpenCode extraction categories to Puppet Master contract sections. Use these targets instead of duplicating definitions.

| # | Extracted Topic | OpenCode Primary File(s) | Puppet Master SSOT Target | Contract Section(s) |
|---|---|---|---|---|
| A1 | Plan mode / run modes | `session/prompt/plan.txt`, `tool/plan.ts`, `session/prompt.ts` | `Plans/Run_Modes.md` | MODE-ask, MODE-plan, MODE-regular, MODE-yolo |
| A2 | Agent/mode switching | `tool/plan.ts`, `session/prompt.ts` | `Plans/Orchestrator_Page.md` | agent-switching |
| A3 | Ask/approval semantics | `permission/next.ts`, `question/` | `Plans/human-in-the-loop.md` | approval-flow |
| B1 | Agent definitions | `agent/agent.ts` | `Plans/Personas.md` | DEF-AGENT |
| B2 | Subagent invocation | `tool/task.ts`, `session/prompt.ts` | `Plans/orchestrator-subagent-integration.md` | subagent-lifecycle |
| B3 | Explore agent | `agent/prompt/explore.txt`, `agent/agent.ts` | `Plans/orchestrator-subagent-integration.md` | DRY:DATA:subagent_registry |
| B4 | Prompt assembly | `session/system.ts`, `session/prompt.ts` | `Plans/Prompt_Pipeline.md` | assembly-pipeline |
| B5 | Compaction / summaries | `session/compaction.ts` | `Plans/Prompt_Pipeline.md` | compaction |
| C1 | Permission resolution | `permission/next.ts` | `Plans/Permissions_System.md` | resolution-algorithm |
| C2 | Object-syntax matching | `permission/next.ts` | `Plans/Permissions_System.md` | granular-rules |
| C3 | Wildcard matching | `util/wildcard.ts` | `Plans/Permissions_System.md` | wildcard-engine |
| C4 | Special guards | `agent/agent.ts` | `Plans/Permissions_System.md` | special-guards |
| C5 | Ask UI outcomes | `permission/next.ts` | `Plans/Permissions_System.md` | ask-semantics |
| C6 | .env deny rules | `agent/agent.ts` | `Plans/Permissions_System.md` | default-denials |
| D1 | Command discovery | `command/index.ts` | `Plans/Commands_System.md` | discovery |
| D2 | Command frontmatter | `command/index.ts` | `Plans/Commands_System.md` | schema |
| D3 | Template features | `config/markdown.ts`, `session/prompt.ts` | `Plans/Commands_System.md` | template-engine |
| D4 | Subtask / model override | `command/index.ts` | `Plans/Commands_System.md` | overrides |
| E1 | Formatter trigger | `format/index.ts` | `Plans/Formatters_System.md` | trigger-mechanism |
| E2 | Built-in formatters | `format/formatter.ts` | `Plans/Formatters_System.md` | built-ins |
| E3 | Formatter config | `format/index.ts` | `Plans/Formatters_System.md` | config-schema |
| F1 | Skill discovery | `skill/skill.ts`, `skill/discovery.ts` | `Plans/Skills_System.md` | discovery |
| F2 | Skill frontmatter | `skill/skill.ts` | `Plans/Skills_System.md` | schema |
| F3 | Skill-to-agent surface | `command/index.ts` | `Plans/Skills_System.md` | agent-integration |
| F4 | Skill permissions | `agent/agent.ts` | `Plans/Skills_System.md` | permissions |
| G1 | Plugin discovery | `plugin/index.ts` | `Plans/Plugins_System.md` | discovery-load-order |
| G2 | Plugin context | `plugin/index.ts` | `Plans/Plugins_System.md` | plugin-signature |
| G3 | Plugin hooks | `packages/plugin/src/index.ts` | `Plans/Plugins_System.md` | hook-events |
| G4 | Custom tools | `plugin/index.ts`, `tool/registry.ts` | `Plans/Plugins_System.md` | custom-tools |
| H1 | Model ID format | `provider/provider.ts` | `Plans/Models_System.md` | MODEL-ID |
| H2 | Default selection | `provider/provider.ts` | `Plans/Models_System.md` | SELECTION-PRIORITY |
| H3 | Model options/variants | `provider/provider.ts`, `provider/transform.ts` | `Plans/Models_System.md` | MODEL-OPTIONS |
| H4 | Error handling | `provider/error.ts` | `Plans/Models_System.md` | MODEL-ERRORS |
| -- | Tools + ToolContext | `tool/tool.ts`, `tool/registry.ts` | `Plans/Tools.md` | S3, S3.5, S10 |
| -- | Provider stream | `provider/transform.ts` | `Plans/Contracts_V0.md`, `Plans/CLI_Bridged_Providers.md` | S2 (normalized stream) |
| -- | UI commands | `command/index.ts` | `Plans/UI_Command_Catalog.md` | S2 (stable IDs) |
| -- | Storage | `session/message-v2.ts` | `Plans/storage-plan.md` | S2.2 (event types) |
| -- | Message/part taxonomy | `session/message-v2.ts` | `Plans/Contracts_V0.md` | S1 (EventRecord) |

All file paths above are relative to `packages/opencode/src/` within the OpenCode snapshot.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#UICommand, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

---

## 9. Baseline -> Puppet Master Delta Hooks

Each topic below lists 1-5 specific points where Puppet Master's implementation is expected to **diverge** from the OpenCode baseline. These are the "delta hooks" that implementers must address.

### 9A. Run Modes and Enforcement
1. **Rust-native plan mode**: Puppet Master implements plan mode in Rust, not TypeScript. The system-reminder injection mechanism must be replicated in the Rust prompt builder.
2. **No Bun dependency**: Plan mode's `PlanExitTool` uses `Question.ask()` which is tied to OpenCode's Node/Bun runtime. Puppet Master must implement an equivalent question/approval flow via its own GUI or CLI.
3. **Plan file location**: OpenCode writes plan files to `.opencode/plans/`. Puppet Master must define its own plan file location convention.

### 9B. Subagents and Context Injection
1. **Subagent execution model**: OpenCode runs subagents in-process via the task tool. Puppet Master's Rust backend may use subprocess-based or thread-based agent execution.
2. **Prompt assembly in Rust**: The multi-layered prompt pipeline (system + instructions + reminders + transforms) must be reimplemented. Model-specific prompt variants (anthropic.txt, codex_header.txt, gemini.txt) need a Rust equivalent selection mechanism.
3. **Compaction thresholds**: The 20,000-token reserve and 40,000-token prune-protect values are hardcoded. Puppet Master should make these configurable.
4. **Plugin prompt transforms**: Puppet Master must decide whether to support `experimental.chat.system.transform` and `experimental.chat.messages.transform` hooks or replace them with a different extension mechanism.

### 9C. Permissions and Approval Mechanics
1. **Permission storage**: OpenCode's `always` approvals are session-scoped and not persisted to disk (see TODO comment in `next.ts` line ~228). Puppet Master must decide on persistence strategy.
2. **Rust wildcard engine**: The `Wildcard.match()` regex-based engine must be ported to Rust (or use an existing Rust glob/wildcard library).
3. **GUI approval flow**: OpenCode's ask/reply cycle uses bus events + server routes. Puppet Master needs to wire this through its Tauri GUI or CLI interface.
4. **Reject-all cascade**: OpenCode's `reject` reply cascades to ALL pending permissions in the session. Puppet Master must decide if this aggressive behavior is desired.

### 9D. Commands
1. **Command discovery paths**: OpenCode uses `.opencode/commands/`. Puppet Master must define its own project-level and global command directories.
2. **Template engine**: The `$ARGUMENTS`, `$1`/`$2`, shell injection, `@file` syntax must be reimplemented in Rust.
3. **MCP prompt integration**: OpenCode converts MCP prompts to commands. Puppet Master's MCP integration may differ.

### 9E. Formatters
1. **Event-driven trigger**: OpenCode uses a bus event (`File.Event.Edited`) to trigger formatting. Puppet Master must define an equivalent event/hook in its Rust event system.
2. **Formatter auto-detection**: The enabled() checks (e.g., "is prettier in package.json?") must be ported to Rust or delegated to shell scripts.
3. **Bun-specific commands**: Several formatters use `BunProc.which()` for execution. Puppet Master must substitute with system-level package runners.

### 9F. Skills
1. **External skill compatibility**: OpenCode discovers skills from `.claude/` and `.agents/` directories for compatibility. Puppet Master must decide whether to maintain this compatibility or use its own skill directory convention.
2. **Remote skill discovery**: The `Discovery.pull()` URL-based skill download mechanism needs a Rust HTTP client equivalent.
3. **Skill-as-command registration**: Skills automatically become commands. Puppet Master must decide if this dual registration is desired.

### 9G. Plugins
1. **Plugin runtime**: OpenCode plugins are JavaScript/TypeScript modules loaded via `import()`. Puppet Master's Rust backend must define its own plugin API (WASM, dynamic libraries, subprocess-based, or scripting language bindings).
2. **Hook interface**: The `Hooks` interface has ~15 named hooks. Puppet Master must decide which hooks to support and define equivalent Rust trait signatures.
3. **Built-in plugins**: OpenCode bundles auth plugins (Codex, Copilot, GitLab). Puppet Master must implement equivalent auth providers natively or via its own plugin system.
4. **Tool precedence**: Plugin tools overriding built-ins is by design in OpenCode. Puppet Master must explicitly choose whether to preserve this behavior.

### 9H. Models
1. **AI SDK dependency**: OpenCode uses the Vercel AI SDK for model abstraction. Puppet Master must implement its own provider abstraction in Rust (or use a Rust AI SDK).
2. **Provider transform layer**: The extensive per-provider normalization (Anthropic empty content filtering, Claude toolCallId normalization, etc.) must be replicated in the Puppet Master provider layer.
3. **Model priority list**: The hardcoded priority list `["gpt-5", "claude-sonnet-4", "big-pickle", "gemini-3-pro"]` should be configurable in Puppet Master.
4. **Overflow detection**: The regex-based overflow detection patterns (12+ provider-specific patterns) must be maintained and extended as new providers are added.

---

## 10. Upstream Notes Worth Capturing (DRY; file pointers + deltas)

> Purpose: prevent downstream agents from "assuming Puppet Master == OpenCode" by recording **where** key upstream models live and the **few deltas** that commonly cause mis-mapping.

### 10.1 Tools + ToolContext (upstream pointers)
- Plugin tool contract (ToolContext + `ask()` shape): `packages/plugin/src/tool.ts`
- Internal tool contract (structured `{title, metadata, output, attachments?}` + truncation wrapper): `packages/opencode/src/tool/tool.ts`
- Tool loading/registry (custom tools from `{tool,tools}/*.{js,ts}` + plugin tools; model-gated tool availability): `packages/opencode/src/tool/registry.ts`
- Tool lifecycle hooks (not Bus events): `Plugin.trigger("tool.execute.before"|"tool.execute.after")` in `packages/opencode/src/session/prompt.ts`

### 10.2 Permissions model (allow/deny/ask, wildcard patterns, replies, errors)
- Current ruleset-based permissions: `packages/opencode/src/permission/next.ts` + API surface `packages/opencode/src/server/routes/permission.ts`
  - Replies are `once | always | reject`; `reject` can optionally carry a user correction message (`CorrectedError` vs `RejectedError`).
  - Wildcard semantics (incl. special-case patterns ending in `" *"`): `packages/opencode/src/util/wildcard.ts`
- Notable delta vs Puppet Master assumptions: OpenCode has *two* permission implementations (`packages/opencode/src/permission/index.ts` and `.../permission/next.ts`). Prefer `next.ts` when extracting current behavior.

### 10.3 Provider abstraction + transform/error layers (providerID/modelID split)
- Provider/model registry and loader logic (explicit `providerID` + `modelID` split): `packages/opencode/src/provider/provider.ts`
- Provider message normalization / capability shims (toolCallId normalization, caching flags, modality filtering): `packages/opencode/src/provider/transform.ts`
- Error parsing and retryability/overflow detection (stream + API-call): `packages/opencode/src/provider/error.ts`
- Notable delta vs Puppet Master assumptions: a significant amount of "provider compatibility" lives in the transform layer (not in the core session stream), so don't assume upstream tool/message parts map 1:1 to any single provider's API.

### 10.4 Session/message/part taxonomy (what "a message" means upstream)
- Message schema (legacy/simple): `packages/opencode/src/session/message.ts` (parts: `text`, `reasoning`, `tool-invocation`, `file`, ...)
- Message schema (current/persistent): `packages/opencode/src/session/message-v2.ts` (parts: `text|reasoning|file|tool|step-start|step-finish|snapshot|patch|subtask|retry|compaction|agent`)
  - Tool part state machine: `pending|running|completed|error` (`ToolState*` in the same file).
- Notable delta vs Puppet Master assumptions: upstream sometimes injects synthetic messages/parts to satisfy provider constraints (e.g., ensure every `tool_use` has a corresponding `tool_result`; see `packages/opencode/src/session/message-v2.ts` + `packages/opencode/src/session/prompt.ts`).

### 10.5 Server and routes (API surface)
- Server entry: `packages/opencode/src/server/server.ts` -- Hono-based HTTP server with SSE streaming, CORS, basic auth, and WebSocket support.
- Route modules: `routes/session.ts`, `routes/permission.ts`, `routes/provider.ts`, `routes/config.ts`, `routes/file.ts`, `routes/mcp.ts`, `routes/pty.ts`, `routes/tui.ts`, `routes/project.ts`, `routes/question.ts`, `routes/experimental.ts`, `routes/global.ts`
- Notable delta: Puppet Master uses Tauri + Rust backend, not a standalone HTTP server. API surface must be mapped to Tauri commands or internal Rust function calls.

### 10.6 Notable process docs (UI blocker/orchestrator pattern)
- Session composer "blocker" orchestrator pattern (question/permission blocks prompt input): `specs/session-composer-refactor-plan.md` and `packages/app/src/pages/session/composer/*`
