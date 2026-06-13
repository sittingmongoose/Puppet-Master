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

## Baseline Reference

| Field | Value |
|---|---|
| **Upstream repository** | https://github.com/anomalyco/opencode |
| **Reference date** | 2026-02-27 UTC |
| **Version policy** | Reference the upstream repo at the above date; no local clone required. |

---

## 1. Goal
Extract reusable, implementation-grade guidance from OpenCode (run modes, agents, permissions, commands, formatters, skills, plugins, models, provider streams, UI command patterns, storage/event envelope conventions) and map those findings into Puppet Master's SSOT plans **without** importing drift-prone details. This document provides a "known good baseline" for Puppet Master to adopt, then modify.

## 2. Hard constraints
- Puppet Master's locked stack decisions always win over OpenCode's choices.
- Extraction must be autonomous and deterministic (no mid-run human decisions).
- Output must be actionable: findings must map to an existing Puppet Master plan doc section (or be explicitly discarded with a reason).
- Generated adapter config remains derived and `/no-secrets`; extracted provider/tool findings land in `Plans/Tools.md` (`/Tools.md`), `Plans/FinalGUISpec.md` (`/FinalGUISpec.md`), or a dedicated MCP `SSOT` when one is created, rather than making this OpenCode reference doc the owner.
- OpenCode material is baseline-only reference lineage. Session-wide approval examples remain external baseline observations unless an owner doc explicitly adopts them; live PM runtime and permission canon stay in `Plans/Permissions_System.md`, `Plans/Run_Modes.md`, `Plans/Tools.md`, and `Plans/Contracts_V0.md`.
- Permission-preset deltas must not narrow PM planning/research defaults below the product tool surface; read-only and Plan modes retain `/question/skill/LSP/todo/subagent` assistance through the owning Tools and permission contracts while keeping mutation tools gated.

## 2A. Transfer Fidelity Notes

Hook and formatter references stay cross-runtime. hook-name, HTE, DAE, /DAE, format.*, /rotated, under-owned, actor-scope, bundling-off, bundled-skill, provider-affinity, FileSafe, Skills_System, Skills_System.md, Plugins_System, Plugins_System.md, Formatters_System, Formatters_System.md, `/tool`, claude/, shell.env, file.edited, permission.ask, and mutation_capable details are lineage inputs for the owning Skills, Plugins, Formatters, Tools, and permission docs.

Runtime agent state is /event-sourced. active-agents and active-agents.json describe derived runtime state for `Plans/orchestrator-subagent-integration.md` and `/orchestrator-subagent-integration.md`, not a local owner in this extraction document.

Usage linkage preserves usage.event, storage-plan, storage-plan.md, usage-feature, usage-feature.md, /account/model, and UsageRecord references so account/model usage lineage can be reconciled without moving the UsageRecord owner here.

Prompt, HITL, and permission references preserve `Plans/Prompt_Pipeline.md`, `Plans/human-in-the-loop.md`, `Plans/Permissions_System.md`, `/Prompt_Pipeline.md`, `/human-in-the-loop.md`, and `/Permissions_System.md` as the owning docs for prompt, human-in-loop, and permission behavior.

Runtime persona compatibility keeps _persona_id, Contracts_V0, Contracts_V0.md, and /runtime visible as extraction evidence while requested/effective persona ownership remains in the contract/runtime docs.

Run graph and artifact references preserve `Plans/Run_Graph_View.md`, `Plans/Prompt_Pipeline.md`, `Plans/Orchestrator_Page.md`, `Plans/human-in-the-loop.md`, `Plans/Runtime_Artifacts_Panel.md`, `/Run_Graph_View.md`, `/Prompt_Pipeline.md`, `/Orchestrator_Page.md`, `/human-in-the-loop.md`, and `/Runtime_Artifacts_Panel.md` as downstream owners.

Coverage extraction hazards include /examples, filename-shaped strings, cmd.*, and /false values; extraction verifiers must not treat those as product commands without an owning command or coverage record.

Coverage matrix handoff references preserve `Plans/OpenCode_Coverage_Matrix.md`, `/OpenCode_Coverage_Matrix.md`, `Plans/Skills_System.md`, `Plans/Plugins_System.md`, `/Skills_System.md`, and `/Plugins_System.md` when this extraction doc hands audit state to the matrix.

Promoted-feature references preserve `Plans/Section15_MVP_Promoted_Features_Spec.md`, `/Section15_MVP_Promoted_Features_Spec.md`, `Plans/Skills_System.md`, `Plans/Plugins_System.md`, `/Skills_System.md`, and `/Plugins_System.md` for MVP/promoted-feature linkage without making this extraction document the feature owner.

Historical run lineage preserves /successor, /package/node, and historical run labels when extraction evidence describes relationships among package/node work and prior runs.

Projection references preserve /projection, storage-plan, and storage-plan.md evidence while keeping projection ownership in storage and downstream owner docs.

Wiring ghost hazards preserve /ghost, Wiring_Matrix, and Wiring_Matrix.md labels so extraction verifiers do not mistake ghost wiring for live command ownership.

Long-running remediation evidence preserves /reviewer/remediation, super-agent, control-plane, graph-construction, /state, /replan, graph-patch, and long-running labels as extraction evidence for orchestration and remediation owners.

Provider-key examples preserve GPT and /key as evidence of key-shaped provider references, not as a local account schema.

Node attempt lane evidence preserves /node/attempt/lane, orchestrator-subagent-integration, orchestrator-subagent-integration.md, and TierContext compatibility references.

Executor package/seam/lane evidence preserves /package/seam/lane, Executor_Protocol, Executor_Protocol.md, orchestrator-subagent-integration, and orchestrator-subagent-integration.md as downstream owner references.

Owner-of-owners evidence preserves DRY_Rules, owner-of-owners, newfeatures, OpenCode_Coverage_Matrix, Decision_Log, feature-list, and rewrite-tie-in-memo references as extraction lineage for audit routing.

Runtime owner-level evidence preserves /runtime, owner-level, and tier as compatibility labels when older extraction language is compared with current owner docs.

Run relationship labels preserve shares feature seam with run, retry of run, derived from run, and continuation of run as extraction phrases that require explicit relationship modeling before use.

Legacy tier-construction snippets preserve `CrewCreator::Orchestrator { tier_id: format!("interview-phase-...") }`, `CrewCreator::Orchestrator { tier_id: format!(\"interview-phase-...\") }`, CrewCreator, `to_tier_id: Some(format!("interview-phase-..."))`, `to_tier_id: Some(format!(\"interview-phase-...\"))`, thread_id: None, /ownership, to_tier_id, /coordination, tier_id, tier-era, thread_id, and interview-phase as extraction hazards rather than current package/lane owners.

Run graph handoff references preserve Run_Graph_View, Run_Graph_View.md, Orchestrator_Page, Orchestrator_Page.md, human-in-the-loop, and human-in-the-loop.md as downstream owner references.

Reconciliation-readiness evidence preserves `/Crosswalk` and `/routing` dispute risk: Glossary/Crosswalk remain too weak to resolve term/routing disputes cleanly, which keeps downstream addenda accumulating instead of reconciling; this extraction baseline carries enough owner-routing, contradiction, and cleanup-order detail to proceed with downstream reconciliation without restarting discovery.

Multi-model coverage evidence preserves Sonnet-confirmed downstream cohort drift and high-signal, multi-model, and later-model continuation posture: stopping at Opus+Sonnet would leave the user's requested multi-model breadth visibly unfinished, and the remaining partial surface is still high-signal enough to justify later-model continuation.

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

All file paths above are relative to `packages/opencode/src/` in the upstream OpenCode repository (https://github.com/anomalyco/opencode).

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

---

## 9. Baseline -> Puppet Master Delta Hooks

Each topic below lists 1-5 specific points where Puppet Master's implementation is expected to **diverge** from the OpenCode baseline. These are the "delta hooks" that implementers must address.

### 9A. Run Modes and Enforcement
1. **Rust-native plan mode**: Puppet Master implements plan mode in Rust, not TypeScript. The system-reminder injection mechanism must be replicated in the Rust prompt builder.
2. **No Bun dependency**: Plan mode's `PlanExitTool` uses `Question.ask()` which is tied to OpenCode's Node/Bun runtime. Puppet Master implements the approval flow via its Slint GUI (primary) with CLI fallback per `Plans/Permissions_System.md`.
3. **Plan file location**: OpenCode writes plan files to `.opencode/plans/`. Puppet Master stores plan files at `~/.config/puppet-master/plans/` (global) and `.puppet-master/plans/` (project-level), per existing config path conventions.

### 9B. Subagents and Context Injection
1. **Subagent execution model**: OpenCode runs subagents in-process via the task tool. Puppet Master's Rust backend may use subprocess-based or thread-based agent execution.
2. **Prompt assembly in Rust**: The multi-layered prompt pipeline (system + instructions + reminders + transforms) must be reimplemented. Model-specific prompt variants (anthropic.txt, codex_header.txt, gemini.txt) need a Rust equivalent selection mechanism.
3. **Compaction thresholds**: The 20,000-token reserve and 40,000-token prune-protect values are hardcoded. Puppet Master should make these configurable.
4. **Plugin prompt transforms**: Puppet Master supports both `experimental.chat.system.transform` and `experimental.chat.messages.transform` hooks under its plugin hook system with the `experimental.` prefix accepted as alias (consistent with the compaction hook alias decision in `Plans/Plugins_System.md`).

### 9C. Permissions and Approval Mechanics
1. **Permission storage**: OpenCode's `always` approvals are session-scoped and not persisted to disk. **Delta:** Puppet Master adopts session-scoped approvals as the default (per `Plans/Permissions_System.md`); persistence across sessions is not supported.
2. **Rust wildcard engine**: The `Wildcard.match()` regex-based engine must be ported to Rust (or use an existing Rust glob/wildcard library).
3. **GUI approval flow**: OpenCode's ask/reply cycle uses bus events + server routes. Puppet Master needs to wire this through its Tauri GUI or CLI interface.
4. **Reject-all cascade**: OpenCode's `reject` reply cascades to ALL pending permissions in the session. Puppet Master preserves this reject-all cascade behavior (matching OpenCode baseline).

### 9D. Commands
1. **Command discovery paths**: OpenCode uses `.opencode/commands/`. Puppet Master uses project-level `.puppet-master/commands/` and global `~/.config/puppet-master/commands/` (per `Plans/Commands_System.md`).
2. **Template engine**: The `$ARGUMENTS`, `$1`/`$2`, shell injection, `@file` syntax must be reimplemented in Rust.
3. **MCP prompt integration**: OpenCode converts MCP prompts to commands. Puppet Master's MCP integration may differ.

### 9E. Formatters
1. **Event-driven trigger**: OpenCode uses a bus event (`File.Event.Edited`) to trigger formatting. Puppet Master defines an equivalent `file.edited` event in its Rust event system to trigger formatting.
2. **Formatter auto-detection**: The enabled() checks (e.g., "is prettier in package.json?") must be ported to Rust or delegated to shell scripts.
3. **Bun-specific commands**: Several formatters use `BunProc.which()` for execution. Puppet Master substitutes with `which`-based system-level package detection and direct process invocation.

### 9F. Skills
1. **Architecture pattern, not ownership transfer:** OpenCode's skills system is a useful reference because it sits above the provider layer. Puppet Master should follow that pattern architecturally while keeping PM-native skills as the canonical runtime path.
2. **Compatibility roots:** PM maintains its own canonical roots and also imports compatible roots such as `.claude/skills` and `.agents/skills` per the PM skill system. Compatibility import does not make those external roots canonical.
3. **Projection posture:** Provider-native or tool-native skill projection is optional compatibility only. PM should not require Codex-specific or GitHub-Copilot-specific skill packaging inside OpenCode because OpenCode itself applies one skill system above its provider list.
4. **Discovery vs runtime:** OpenCode-style discovery compatibility is useful, but PM runtime correctness still depends on PM registry resolution, readiness validation, context bundling, and the PM `skill` tool.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/MiscPlan.md, ContractName:Plans/Provider_OpenCode.md
### 9G. Plugins
1. **Plugin runtime**: OpenCode plugins are JavaScript/TypeScript modules loaded via `import()`. Puppet Master's Rust backend must define its own plugin API (WASM, dynamic libraries, subprocess-based, or scripting language bindings).
2. **Hook interface**: The `Hooks` interface has ~15 named hooks. Puppet Master supports the hook subset defined in `Plans/Plugins_System.md §4`; unsupported hooks are silently ignored at registration.
3. **Built-in plugins**: OpenCode bundles auth plugins (Codex, Copilot, GitLab). Puppet Master implements auth providers natively (not via plugins), per `Plans/rewrite-tie-in-memo.md`.
4. **Tool precedence**: Plugin tools overriding built-ins is by design in OpenCode. Puppet Master disallows plugin tools overriding built-in tools by default; override requires explicit `override_builtin: true` (consistent with `Plans/Commands_System.md` override policy).

### 9H. Models
1. **AI SDK dependency**: OpenCode uses the Vercel AI SDK for model abstraction. Puppet Master implements its own provider abstraction in Rust, per `Plans/Models_System.md`.
2. **Provider transform layer**: The extensive per-provider normalization (Anthropic empty content filtering, Claude toolCallId normalization, etc.) must be replicated in the Puppet Master provider layer.
3. **Model priority list**: The hardcoded priority list `["gpt-5", "claude-sonnet-4", "big-pickle", "gemini-3-pro"]` should be configurable in Puppet Master.
4. **Overflow detection**: The regex-based overflow detection patterns (12+ provider-specific patterns) must be maintained and extended as new providers are added.
5. **Debug model/memory boundary**: Debug or OpenCode-derived extraction must verify model assumptions against `Plans/Models_System.md` (`/Models_System.md`) and Assistant-only memory assumptions against `Plans/assistant-memory-subsystem.md` (`/assistant-memory-subsystem.md`); this baseline reference does not re-own those budgets, injection rules, or retention boundaries.

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

### 10.7 Usage pipeline and normalization mapping
- Upstream reference pattern: OpenCode's message-level usage flow (`Session.getUsage`, processor finish-step, and related normalization logic) is useful as an extraction target for how response metadata becomes durable usage records.
- Puppet Master mapping rule: all extracted usage terminology, persistence semantics, and UI linkage MUST map into `Plans/usage-feature.md` and `Plans/storage-plan.md` rather than creating a parallel OpenCode-shaped usage vocabulary in this document or downstream packets.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/OpenCode_Deep_Extraction.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### ODE-001 - OpenCode Deep Extraction Retired Source-Preserving Bridge

```yaml
plan_unit_id: ODE-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  ODE-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 110 because OpenCode_Deep_Extraction-S0001 through S0070 are covered by ODE-002 through ODE-074 or explicit structural dispositions. ODE-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried by fine-grained OpenCode Deep Extraction PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- 'ODE-002'
- 'ODE-003'
- 'ODE-004'
- 'ODE-005'
- 'ODE-006'
- 'ODE-007'
- 'ODE-008'
- 'ODE-009'
- 'ODE-010'
- 'ODE-011'
- 'ODE-012'
- 'ODE-013'
- 'ODE-014'
- 'ODE-015'
- 'ODE-016'
- 'ODE-017'
- 'ODE-018'
- 'ODE-019'
- 'ODE-020'
- 'ODE-021'
- 'ODE-022'
- 'ODE-023'
- 'ODE-024'
- 'ODE-025'
- 'ODE-026'
- 'ODE-027'
- 'ODE-028'
- 'ODE-029'
- 'ODE-030'
- 'ODE-031'
- 'ODE-032'
- 'ODE-033'
- 'ODE-034'
- 'ODE-035'
- 'ODE-036'
- 'ODE-037'
- 'ODE-038'
- 'ODE-039'
- 'ODE-040'
- 'ODE-041'
- 'ODE-042'
- 'ODE-043'
- 'ODE-044'
- 'ODE-045'
- 'ODE-046'
- 'ODE-047'
- 'ODE-048'
- 'ODE-049'
- 'ODE-050'
- 'ODE-051'
- 'ODE-052'
- 'ODE-053'
- 'ODE-054'
- 'ODE-055'
- 'ODE-056'
- 'ODE-057'
- 'ODE-058'
- 'ODE-059'
- 'ODE-060'
- 'ODE-061'
- 'ODE-062'
- 'ODE-063'
- 'ODE-064'
- 'ODE-065'
- 'ODE-066'
- 'ODE-067'
- 'ODE-068'
- 'ODE-069'
- 'ODE-070'
- 'ODE-071'
- 'ODE-072'
- 'ODE-073'
- 'ODE-074'
unblocks: []
acceptance_criteria:
- 'ODE-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 110.'
- 'OpenCode_Deep_Extraction-S0001 through S0070 product/source coverage is owned by ODE-002 through ODE-074 or explicit structural dispositions.'
- 'ODE-001 remains only to preserve migration lineage for the former source-preserving bridge.'
- 'The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0035'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0036'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0037'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0038'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0039'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0040'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0041'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0042'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0043'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0044'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0045'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0046'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0047'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0048'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0049'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0050'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0051'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0052'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0053'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0054'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0055'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0056'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0057'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0058'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0059'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0060'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0061'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0062'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0063'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0064'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0065'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0066'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0067'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0068'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0069'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0070'
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0073'
preserved_exact_tokens:
- 'ODE-001'
- 'OpenCode Deep Extraction Residual Source-Preserving Bridge'
- 'source_preserving_planunit'
- 'source_preserving_bridge_retired'
- '7E.2 Built-in selection'
- '10.7 Usage pipeline and normalization mapping'
- 'PlanUnits'
- 'Migration Coverage'
negative_constraints:
- 'ODE-001 must not re-own OpenCode_Deep_Extraction-S0001 through OpenCode_Deep_Extraction-S0070 after Phase 2B batch 110.'
- 'ODE-001 must not use node_compile_hint.mode=source_preserving_planunit.'
compatibility_only_notes:
- 'Retired bridge is migration-lineage compatibility only.'
stale_retired_dispositions:
- source_preserving_bridge_retired
owner_boundary_notes:
- 'Fine-grained ODE PlanUnits and coverage_map proof now carry product/source coverage.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-002 - Document Purpose And Naming Guard

```yaml
plan_unit_id: ODE-002
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The document preserves Puppet Master naming, compliance with Plans/DRY_Rules.md and Plans/Contracts_V0.md, and deterministic defaults while stating that older names are only referenced as legacy naming.
gui_related: false
gui_classification_reason: The unit records document governance and naming, not a GUI surface.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: document_purpose_and_naming_guard
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: document_purpose_and_naming_guard
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0001'
preserved_exact_tokens:
- 'Puppet Master'
- 'legacy naming'
- 'Plans/DRY_Rules.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Decision_Policy.md'
negative_constraints:
- 'Platform name is Puppet Master only.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'This extraction document is reference lineage and not a design fork.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-003 - Baseline Reference

```yaml
plan_unit_id: ODE-003
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The OpenCode baseline is the upstream repository https://github.com/anomalyco/opencode at Reference date 2026-02-27 UTC, with a version policy that requires no local clone.
gui_related: false
gui_classification_reason: The unit records external reference metadata, not UI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: baseline_reference
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: baseline_reference
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0002'
preserved_exact_tokens:
- 'https://github.com/anomalyco/opencode'
- 'Reference date'
- '2026-02-27 UTC'
- 'no local clone required'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'OpenCode remains baseline reference lineage.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-004 - Extraction Goal

```yaml
plan_unit_id: ODE-004
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The extraction goal is to map reusable OpenCode guidance for run modes, agents, permissions, commands, formatters, skills, plugins, models, provider streams, UI command patterns, storage, and event envelopes into Puppet Master SSOT plans without importing drift-prone details.
gui_related: true
gui_classification_reason: The covered goal explicitly includes UI command patterns alongside backend/runtime surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
- 'Mixed GUI/backend scope is explicit and remains split_recommended for downstream owner adoption.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: extraction_goal
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: extraction_goal
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0003'
preserved_exact_tokens:
- 'run modes'
- 'agents'
- 'permissions'
- 'UI command patterns'
- 'without importing drift-prone details'
negative_constraints:
- 'Do not import drift-prone details.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Puppet Master SSOT plans remain the destination for adopted guidance.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-005 - Hard Constraints And Owner Boundaries

```yaml
plan_unit_id: ODE-005
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master locked stack decisions win; extraction is autonomous and deterministic; findings map to one existing owner or are discarded; generated adapter config remains derived and /no-secrets; OpenCode is baseline-only lineage; permission-preset deltas must not narrow /question/skill/LSP/todo/subagent assistance.
gui_related: false
gui_classification_reason: The unit records governance and owner boundaries, not a GUI surface.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: hard_constraints_and_owner_boundaries
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: hard_constraints_and_owner_boundaries
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0004'
preserved_exact_tokens:
- '/no-secrets'
- 'baseline-only reference lineage'
- '/question/skill/LSP/todo/subagent'
- 'Puppet Master locked stack decisions'
negative_constraints:
- 'Permission-preset deltas must not narrow PM planning/research defaults below the product tool surface.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Live PM runtime and permission canon stay in Plans/Permissions_System.md, Plans/Run_Modes.md, Plans/Tools.md, and Plans/Contracts_V0.md.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-006 - Transfer Token Fidelity

```yaml
plan_unit_id: ODE-006
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Hook and formatter extraction must preserve exact lineage tokens including hook-name, HTE, DAE, /DAE, format.*, /rotated, /tool, shell.env, file.edited, permission.ask, and mutation_capable for the owning Skills, Plugins, Formatters, Tools, and permission docs.
gui_related: false
gui_classification_reason: The unit preserves lineage tokens for non-GUI owner docs.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: transfer_token_fidelity
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: transfer_token_fidelity
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- 'hook-name'
- 'HTE'
- 'DAE'
- '/DAE'
- 'format.*'
- '/tool'
- 'shell.env'
- 'file.edited'
- 'permission.ask'
- 'mutation_capable'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Skills, Plugins, Formatters, Tools, and permission docs own the adopted behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-007 - Runtime Usage Prompt Owner Boundaries

```yaml
plan_unit_id: ODE-007
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Runtime agent state, usage linkage, prompt/HITL/permission references, persona compatibility, and run graph/artifact references stay as lineage for their owning docs rather than becoming local ownership in this extraction doc.
gui_related: false
gui_classification_reason: The unit routes runtime and usage evidence, not visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_usage_prompt_owner_boundaries
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: runtime_usage_prompt_owner_boundaries
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- 'active-agents'
- 'active-agents.json'
- 'usage.event'
- 'UsageRecord'
- 'Plans/Prompt_Pipeline.md'
- 'Plans/human-in-the-loop.md'
- '_persona_id'
- 'Plans/Run_Graph_View.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Runtime, usage, prompt, HITL, persona, and artifact owner docs remain authoritative.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-008 - Coverage And Feature Handoff Hazards

```yaml
plan_unit_id: ODE-008
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Coverage extraction hazards preserve /examples, filename-shaped strings, cmd.*, and /false as evidence only, while coverage matrix, skills/plugins, and MVP promoted-feature handoff references remain audit lineage for their owner docs.
gui_related: false
gui_classification_reason: The unit records extraction hazards and handoff lineage, not GUI requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: coverage_and_feature_handoff_hazards
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: coverage_and_feature_handoff_hazards
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- '/examples'
- 'filename-shaped strings'
- 'cmd.*'
- '/false'
- 'OpenCode_Coverage_Matrix.md'
- 'Section15_MVP_Promoted_Features_Spec.md'
negative_constraints:
- 'Extraction verifiers must not treat hazards as product commands without an owning command or coverage record.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Coverage matrix, Skills_System, Plugins_System, and promoted-feature docs own adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-009 - Historical Projection And Ghost Evidence

```yaml
plan_unit_id: ODE-009
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Historical run lineage, projection references, and ghost wiring hazards remain extraction evidence using tokens such as /successor, /package/node, /projection, storage-plan.md, /ghost, and Wiring_Matrix.md.
gui_related: false
gui_classification_reason: The unit preserves audit lineage, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: historical_projection_and_ghost_evidence
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: historical_projection_and_ghost_evidence
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- '/successor'
- '/package/node'
- '/projection'
- 'storage-plan.md'
- '/ghost'
- 'Wiring_Matrix.md'
negative_constraints: []
compatibility_only_notes:
- 'Older extraction labels remain evidence until owner docs model them explicitly.'
stale_retired_dispositions: []
owner_boundary_notes:
- 'Storage and wiring owners retain canonical ownership.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-010 - Remediation And Lane Evidence

```yaml
plan_unit_id: ODE-010
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Long-running remediation, provider-key, node attempt lane, and executor package/seam/lane evidence preserve tokens such as /reviewer/remediation, super-agent, control-plane, GPT, /key, /node/attempt/lane, and /package/seam/lane for downstream owners.
gui_related: false
gui_classification_reason: The unit records orchestration evidence, not GUI requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: remediation_and_lane_evidence
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: remediation_and_lane_evidence
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- '/reviewer/remediation'
- 'super-agent'
- 'control-plane'
- 'GPT'
- '/key'
- '/node/attempt/lane'
- '/package/seam/lane'
- 'Executor_Protocol.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Orchestration, provider, executor, and integration owner docs retain adoption authority.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-011 - Owner And Legacy Tier Hazards

```yaml
plan_unit_id: ODE-011
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Owner-of-owners, runtime owner-level, run relationship labels, and legacy tier-construction snippets including CrewCreator::Orchestrator, to_tier_id, tier-era, thread_id, and interview-phase are preserved as extraction hazards rather than current package/lane owners.
gui_related: false
gui_classification_reason: The unit records legacy terminology hazards, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_and_legacy_tier_hazards
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: owner_and_legacy_tier_hazards
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- 'owner-of-owners'
- 'tier-era'
- 'CrewCreator::Orchestrator'
- 'to_tier_id'
- 'thread_id'
- 'interview-phase'
- 'shares feature seam with run'
negative_constraints:
- 'Legacy tier-era snippets are extraction hazards rather than current package/lane owners.'
compatibility_only_notes:
- 'Runtime owner-level and tier labels are compatibility labels when compared with current owner docs.'
stale_retired_dispositions: []
owner_boundary_notes:
- 'Current package/lane ownership is resolved by owner docs, not this extraction baseline.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-012 - Routing Risk And Multi-Model Continuation

```yaml
plan_unit_id: ODE-012
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Run graph handoff, /Crosswalk and /routing dispute risk, Sonnet-confirmed downstream cohort drift, high-signal multi-model continuation posture, and later-model continuation evidence remain audit lineage.
gui_related: false
gui_classification_reason: The unit records audit/routing evidence, not user-visible GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: routing_risk_and_multi_model_continuation
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: routing_risk_and_multi_model_continuation
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0005'
preserved_exact_tokens:
- 'Run_Graph_View.md'
- '/Crosswalk'
- '/routing'
- 'Sonnet-confirmed downstream cohort drift'
- 'multi-model'
- 'later-model continuation'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Glossary/Crosswalk reconciliation remains downstream owner work.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-013 - Extraction Inputs

```yaml
plan_unit_id: ODE-013
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The deterministic extraction inputs are the OpenCode repository and the Puppet Master Plans directory as SSOT.
gui_related: false
gui_classification_reason: The unit records input scope, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: extraction_inputs
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: extraction_inputs
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0006'
preserved_exact_tokens:
- 'OpenCode repository'
- 'https://github.com/anomalyco/opencode'
- 'Puppet Master Plans directory'
- 'SSOT'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Plans directory remains the canonical SSOT.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-014 - Deterministic Extraction Procedure

```yaml
plan_unit_id: ODE-014
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The procedure references upstream via web/API without cloning, inventories tools/provider/UI/storage surfaces, extracts ordered artifacts, normalizes OpenCode names into Puppet Master terms, maps each concept to exactly one SSOT target, and avoids local clone cleanup.
gui_related: true
gui_classification_reason: The covered procedure includes UI command catalog extraction alongside backend/runtime surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
- 'Mixed UI/backend extraction scope remains split_recommended for owner adoption.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: deterministic_extraction_procedure
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: deterministic_extraction_procedure
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0007'
preserved_exact_tokens:
- 'Provider'
- 'EventRecord'
- 'UICommand'
- 'tool.invoked/tool.denied'
- 'Never duplicate'
- 'No local clone cleanup required'
negative_constraints:
- 'Never duplicate: add a reference to the correct SSOT doc instead of copying long definitions.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Each extracted concept chooses exactly one target plan doc section or is discarded.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-015 - Downstream Output Record Shape

```yaml
plan_unit_id: ODE-015
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Each extracted item emits source, category, puppet_master_target, decision, rationale, and acceptance_impact so downstream agents can route adopted, adapted, or discarded findings deterministically.
gui_related: false
gui_classification_reason: The unit records data shape, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: downstream_output_record_shape
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: downstream_output_record_shape
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0008'
preserved_exact_tokens:
- 'source'
- 'category'
- 'puppet_master_target'
- 'decision'
- 'adopt | adapt | discard'
- 'acceptance_impact'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Downstream agents consume the record shape; owner docs remain canonical.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-016 - Extraction Acceptance Criteria

```yaml
plan_unit_id: ODE-016
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Extraction must run end-to-end without prompts, map every adopted/adapted item to a single Puppet Master SSOT section, and avoid overwriting locked Puppet Master decisions.
gui_related: false
gui_classification_reason: The unit records acceptance criteria, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: extraction_acceptance_criteria
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: extraction_acceptance_criteria
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0009'
preserved_exact_tokens:
- 'end-to-end without prompts'
- 'single Puppet Master SSOT doc section'
- 'No Puppet Master locked decisions are overwritten'
negative_constraints:
- 'No Puppet Master locked decisions are overwritten by OpenCode-derived content.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Accepted/adapted findings route to one SSOT section.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-017 - Plan Mode Baseline

```yaml
plan_unit_id: ODE-017
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  OpenCode plan mode injects a system-reminder, forbids file edits and system changes except plan files, uses a multi-phase plan prompt, exits through PlanExitTool, and may use an experimental plan mode flag for richer switching.
gui_related: false
gui_classification_reason: The unit records run-mode baseline behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_mode_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plan_mode_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0012'
preserved_exact_tokens:
- 'plan'
- '<system-reminder>'
- 'STRICTLY FORBIDDEN'
- 'PlanExitTool'
- 'Flag.OPENCODE_EXPERIMENTAL_PLAN_MODE'
negative_constraints:
- 'Plan mode forbids file edits, modifications, or system changes outside the allowed plan scope.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Run_Modes and Permissions owner docs decide PM adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-018 - Agent Mode Switching Baseline

```yaml
plan_unit_id: ODE-018
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  OpenCode mode switching creates synthetic MessageV2.User messages with an agent field, @agent syntax creates AgentPart, bypassAgentCheck affects tool resolution, and BUILD_SWITCH reminds build agents to execute the plan.
gui_related: false
gui_classification_reason: The unit records agent switching mechanics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agent_mode_switching_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: agent_mode_switching_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0013'
preserved_exact_tokens:
- 'MessageV2.User'
- 'agent'
- '@agent'
- 'AgentPart'
- 'bypassAgentCheck'
- 'BUILD_SWITCH'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Run mode and agent owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-019 - Ask Approval Semantics Baseline

```yaml
plan_unit_id: ODE-019
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Question.ask() presents structured questions and blocks tool execution until response; permission ask() emits permission.asked and resolves or rejects with RejectedError, CorrectedError, or DeniedError.
gui_related: false
gui_classification_reason: The unit records approval semantics, not visual UI requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ask_approval_semantics_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: ask_approval_semantics_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0014'
preserved_exact_tokens:
- 'Question.ask()'
- 'permission.asked'
- 'RejectedError'
- 'CorrectedError'
- 'DeniedError'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'HITL and Permissions owner docs remain authoritative.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-020 - Agent Info Schema Fields

```yaml
plan_unit_id: ODE-020
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The Agent.Info schema preserves agent fields name, description, mode, native, hidden, topP, temperature, color, permission, model, variant, prompt, options, and steps.
gui_related: true
gui_classification_reason: The field list includes UI color and user-visible agent metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agent_info_schema_fields
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: agent_info_schema_fields
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0016'
preserved_exact_tokens:
- 'Agent.Info'
- 'name'
- 'mode'
- 'native'
- 'hidden'
- 'color'
- 'permission'
- 'model'
- 'variant'
- 'prompt'
- 'steps'
- 'options'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Personas/agent runtime owner docs decide adopted schema.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-021 - Built In User Agent Definitions

```yaml
plan_unit_id: ODE-021
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  OpenCode built-in agents include build, plan, general, explore, compaction, title, and summary; user-defined agents can override model, variant, prompt, description, sampling, mode, color, hidden, name, steps, options, permission, or disable an agent.
gui_related: true
gui_classification_reason: The unit includes user-visible agent names and color metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: built_in_user_agent_definitions
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: built_in_user_agent_definitions
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0016'
preserved_exact_tokens:
- 'build'
- 'plan'
- 'general'
- 'explore'
- 'compaction'
- 'title'
- 'summary'
- 'disable: true'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Agent/runtime owner docs decide PM adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-022 - Subagent Invocation Mechanism

```yaml
plan_unit_id: ODE-022
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Subagents are invoked through task({ prompt, description, subagent_type, command }); the loop executes SubtaskPart entries, writes running ToolPart state, triggers tool.execute plugin hooks, and inherits merged permissions.
gui_related: false
gui_classification_reason: The unit records runtime mechanics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: subagent_invocation_mechanism
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: subagent_invocation_mechanism
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0017'
preserved_exact_tokens:
- 'task({ prompt, description, subagent_type, command })'
- 'SubtaskPart'
- 'ToolPart'
- 'tool.execute.before'
- 'tool.execute.after'
- 'merged permissions'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Subagent and plugin owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-023 - Explore Agent Baseline

```yaml
plan_unit_id: ODE-023
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The explore agent is a read-only file search specialist whose permissions allow grep, glob, list, bash, webfetch, websearch, codesearch, read, external_directory for whitelisted roots, and no state modification.
gui_related: false
gui_classification_reason: The unit records read-only agent capability, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: explore_agent_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: explore_agent_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0018'
preserved_exact_tokens:
- 'explore'
- 'read-only subagent'
- 'grep'
- 'glob'
- 'list'
- 'bash'
- 'webfetch'
- 'websearch'
- 'codesearch'
- 'read'
negative_constraints:
- 'Explore agent must not create files or modify system state.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions and subagent owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-024 - Prompt Assembly Pipeline

```yaml
plan_unit_id: ODE-024
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The prompt assembly pipeline builds environment system prompt, instruction prompts, optional structured output prompt, plugin system/messages transforms, reminder injection, and MessageV2.toModelMessages() per loop.
gui_related: false
gui_classification_reason: The unit records prompt pipeline behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prompt_assembly_pipeline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: prompt_assembly_pipeline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0019'
preserved_exact_tokens:
- 'SystemPrompt.environment(model)'
- 'InstructionPrompt.system()'
- 'experimental.chat.system.transform'
- 'experimental.chat.messages.transform'
- 'insertReminders()'
- 'MessageV2.toModelMessages()'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Prompt_Pipeline remains the owning doc for adopted behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-025 - Compaction And Summaries

```yaml
plan_unit_id: ODE-025
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  SessionCompaction detects overflow from token counts, inserts CompactionPart, prunes old completed tool outputs beyond a 40,000-token protection window, preserves protected tools, and uses hidden compaction/summary agents.
gui_related: false
gui_classification_reason: The unit records session continuation mechanics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: compaction_and_summaries
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: compaction_and_summaries
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0020'
preserved_exact_tokens:
- 'SessionCompaction.isOverflow()'
- 'CompactionPart'
- '40,000-token protection window'
- 'protected tools'
- 'compaction'
- 'summary'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Session/runtime owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-026 - Permission Resolution Algorithm

```yaml
plan_unit_id: ODE-026
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  PermissionNext.evaluate merges flat rulesets and uses findLast so last match wins; default action is ask, deny short-circuits, and ask emits a bus request before blocking for reply.
gui_related: false
gui_classification_reason: The unit records permission algorithm behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_resolution_algorithm
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: permission_resolution_algorithm
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0022'
preserved_exact_tokens:
- 'PermissionNext.evaluate'
- 'findLast'
- 'Last match wins'
- 'default is { action: "ask" }'
- 'deny'
- 'ask'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions_System remains the owner for adopted PM permission rules.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-027 - Permission Object Syntax

```yaml
plan_unit_id: ODE-027
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Permission config supports simple string actions and object syntax where outer keys are permissions and inner keys are patterns, producing {permission, pattern, action} rules.
gui_related: false
gui_classification_reason: The unit records config syntax, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_object_syntax
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: permission_object_syntax
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0023'
preserved_exact_tokens:
- 'fromConfig()'
- 'simple strings'
- 'object syntax'
- '{permission, pattern, action}'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions_System remains the owner for adopted config syntax.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-028 - Wildcard Matching

```yaml
plan_unit_id: ODE-028
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Wildcard matching preserves * and ? semantics, the trailing space-star optional portion, home expansion through PermissionNext.expand(), and Windows case-insensitive matching.
gui_related: false
gui_classification_reason: The unit records matching semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wildcard_matching
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: wildcard_matching
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0024'
preserved_exact_tokens:
- '*'
- '?'
- 'trailing ` *`'
- '~'
- '$HOME'
- 'PermissionNext.expand()'
- 'case-insensitive'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions_System remains the owner for adopted matching behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-029 - Special Permission Guards

```yaml
plan_unit_id: ODE-029
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  OpenCode special guards external_directory and doom_loop default to ask, while question, plan_enter, and plan_exit default to deny globally and are enabled selectively per agent.
gui_related: false
gui_classification_reason: The unit records guard defaults, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: special_permission_guards
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: special_permission_guards
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0025'
preserved_exact_tokens:
- 'external_directory'
- 'doom_loop'
- 'question'
- 'plan_enter'
- 'plan_exit'
- 'ask'
- 'deny'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions and run-mode owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-030 - Ask UI Reply Semantics

```yaml
plan_unit_id: ODE-030
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Permission replies once, always, and reject control one-time approval, session-scoped allow rules, auto-resolution of pending requests, CorrectedError feedback, and rejection of same-session pending requests.
gui_related: true
gui_classification_reason: The unit describes user-facing ask/approval UI reply semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ask_ui_reply_semantics
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: ask_ui_reply_semantics
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0026'
preserved_exact_tokens:
- 'once'
- 'always'
- 'reject'
- 'session-scoped approved ruleset'
- 'CorrectedError'
- 'RejectedError'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'HITL and Permissions owner docs decide adopted UI behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-031 - Default Env Deny Rules

```yaml
plan_unit_id: ODE-031
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Default read permissions allow general reads, ask for .env and .env.* files, and allow .env.example as a Node.gitignore-mirrored pattern.
gui_related: false
gui_classification_reason: The unit records permission defaults, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: default_env_deny_rules
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: default_env_deny_rules
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0027'
preserved_exact_tokens:
- 'read: { "*": "allow", "*.env": "ask", "*.env.*": "ask", "*.env.example": "allow" }'
- '.env'
- '.env.*'
- '.env.example'
- 'Node.gitignore'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions_System remains the owner for adopted secret-file policy.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-032 - Command Discovery Paths

```yaml
plan_unit_id: ODE-032
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Commands load in order from built-ins, config commands, MCP prompts, and skills, with project commands at .opencode/commands/<name>.md and global commands at ~/.config/opencode/commands/<name>.md.
gui_related: false
gui_classification_reason: The unit records command discovery behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_discovery_paths
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: command_discovery_paths
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0029'
preserved_exact_tokens:
- 'init'
- 'review'
- 'config.command'
- 'MCP.prompts()'
- 'skills'
- '.opencode/commands/<name>.md'
- '~/.config/opencode/commands/<name>.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Commands_System and Skills_System decide PM adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-033 - Command Frontmatter Fields

```yaml
plan_unit_id: ODE-033
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Command.Info preserves command metadata fields name, description, agent, model, source, template, subtask, and hints, including source values command, mcp, and skill.
gui_related: false
gui_classification_reason: The unit records command schema metadata, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_frontmatter_fields
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: command_frontmatter_fields
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0030'
preserved_exact_tokens:
- 'Command.Info'
- 'name'
- 'description'
- 'agent'
- 'model'
- 'source'
- 'template'
- 'subtask'
- 'hints'
- 'command | mcp | skill'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Commands_System decides adopted PM command schema.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-034 - Command Template Features

```yaml
plan_unit_id: ODE-034
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Command templates preserve positional args $1 and $2, $ARGUMENTS, shell output injection with !`command`, @file inclusion via FILE_REGEX, and resolvePromptParts() conversion to FilePart or AgentPart.
gui_related: false
gui_classification_reason: The unit records command template syntax, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_template_features
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: command_template_features
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0031'
preserved_exact_tokens:
- '$1'
- '$2'
- '$ARGUMENTS'
- '!`command`'
- '@file'
- 'FILE_REGEX'
- 'resolvePromptParts()'
- 'FilePart'
- 'AgentPart'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Commands_System decides adopted PM template syntax.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-035 - Command Subtask And Model Override

```yaml
plan_unit_id: ODE-035
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  When subtask: true, commands run as subagent tasks; model overrides use provider_id/model_id parsed by Provider.parseModel(); config commands can override built-ins by name.
gui_related: false
gui_classification_reason: The unit records command execution routing, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: command_subtask_and_model_override
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: command_subtask_and_model_override
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0032'
preserved_exact_tokens:
- 'subtask: true'
- 'provider_id/model_id'
- 'Provider.parseModel()'
- 'override built-in commands'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Commands and provider owner docs decide adoption.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-036 - Formatter Edit Event Trigger

```yaml
plan_unit_id: ODE-036
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Formatters run automatically after File.Event.Edited bus events by detecting the extension, finding matching enabled formatters, and running them sequentially.
gui_related: false
gui_classification_reason: The unit records formatter runtime behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_edit_event_trigger
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: formatter_edit_event_trigger
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0034'
preserved_exact_tokens:
- 'Format.init()'
- 'File.Event.Edited'
- 'extension'
- 'enabled formatters'
- 'sequentially'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Formatters_System decides adopted PM formatter behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-037 - Built-In Formatter Selection Baseline

```yaml
plan_unit_id: ODE-037
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The OpenCode formatter baseline preserves the built-in formatter catalog and detection table, including prettier, biome, rustfmt, gofmt, ruff, shfmt, clang-format, dart, mix, zig, ktlint, rubocop, standardrb, pint, ocamlformat, nixfmt, ormolu, terraform, latexindent, gleam, cljfmt, oxfmt, uv, air, htmlbeautifier, and dfmt.
gui_related: false
gui_classification_reason: The unit records formatter tooling metadata, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: built_in_formatter_selection_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: built_in_formatter_selection_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0035'
preserved_exact_tokens:
- 'prettier'
- 'biome'
- 'rustfmt'
- 'uv'
- 'air'
- 'htmlbeautifier'
- 'dfmt'
- 'oxfmt'
- 'Experimental flag + `oxfmt` in deps'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-038 - Formatter Config Schema And File Placeholder

```yaml
plan_unit_id: ODE-038
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Formatter config preserves formatter: false global disablement, per-formatter disabled/command/environment/extensions fields, $FILE replacement at execution time, command.length === 0 skip behavior, and config-defined custom formatter enabled() override behavior.
gui_related: false
gui_classification_reason: The unit records formatter configuration semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_config_schema_and_file_placeholder
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: formatter_config_schema_and_file_placeholder
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0036'
preserved_exact_tokens:
- 'formatter: false'
- 'disabled'
- 'command'
- 'environment'
- 'extensions'
- '$FILE'
- 'command.length === 0'
- 'enabled()'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-039 - Skill Discovery Paths Baseline

```yaml
plan_unit_id: ODE-039
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Skill discovery preserves the OpenCode load order across external global roots, external project roots, .opencode skill roots, config.skills.paths[], and config.skills.urls[] with Discovery.pull() cache download behavior and later-source overwrite semantics.
gui_related: false
gui_classification_reason: The unit records skill discovery metadata, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_discovery_paths_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: skill_discovery_paths_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0038'
preserved_exact_tokens:
- '~/.claude/skills/**/SKILL.md'
- '~/.agents/skills/**/SKILL.md'
- 'OPENCODE_DISABLE_EXTERNAL_SKILLS'
- '.opencode/{skill,skills}/**/SKILL.md'
- 'config.skills.paths[]'
- 'config.skills.urls[]'
- 'Discovery.pull()'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-040 - Skill Frontmatter Validation Baseline

```yaml
plan_unit_id: ODE-040
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Skill frontmatter preserves required name and description fields, auto-set location and content fields, the name regex and length constraints, duplicate overwrite warning behavior, and the compatibility-only fact that license, compatibility, and metadata may appear without core validation.
gui_related: false
gui_classification_reason: The unit records skill schema behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_frontmatter_validation_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: skill_frontmatter_validation_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0039'
preserved_exact_tokens:
- 'name'
- 'description'
- 'location'
- 'content'
- '^[a-z0-9]+(-[a-z0-9]+)*$'
- 'SkillNameMismatchError'
- 'license'
- 'compatibility'
- 'metadata'
negative_constraints: []
compatibility_only_notes:
- 'Additional skill frontmatter fields may appear but are not used by core OpenCode loading logic.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-041 - Skill Agent Surface Baseline

```yaml
plan_unit_id: ODE-041
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Skill agent surface preserves available skill listing through <available_skills> XML blocks, invocation through skill({ name }), and registration as invokable /skillname commands from the command palette.
gui_related: false
gui_classification_reason: The unit records command/agent integration behavior rather than GUI layout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_agent_surface_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: skill_agent_surface_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0040'
preserved_exact_tokens:
- '<available_skills>'
- 'skill({ name })'
- '/skillname'
- 'command palette'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Skills_System and Commands_System decide adopted PM behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-042 - Skill Permission Integration Baseline

```yaml
plan_unit_id: ODE-042
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Skill permission integration preserves the skill permission key with patterns, skill-directory external_directory whitelisting, and compaction protection through PRUNE_PROTECTED_TOOLS = ["skill"].
gui_related: false
gui_classification_reason: The unit records permission/runtime behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_permission_integration_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: skill_permission_integration_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0041'
preserved_exact_tokens:
- 'skill'
- 'external_directory'
- 'PRUNE_PROTECTED_TOOLS = ["skill"]'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Skills_System and Permissions_System decide adopted PM behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-043 - Plugin Discovery And Load Order Baseline

```yaml
plan_unit_id: ODE-043
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Plugin discovery preserves internal auth plugins, the built-in opencode-anthropic-auth@0.0.13 package, config.plugin[] package or file:// entries, BunProc.install(), import(plugin), and Set<PluginInstance> deduplication.
gui_related: false
gui_classification_reason: The unit records plugin loading behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugin_discovery_and_load_order_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plugin_discovery_and_load_order_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0043'
preserved_exact_tokens:
- 'CodexAuthPlugin'
- 'CopilotAuthPlugin'
- 'GitlabAuthPlugin'
- 'opencode-anthropic-auth@0.0.13'
- 'OPENCODE_DISABLE_DEFAULT_PLUGINS'
- 'config.plugin[]'
- 'file://'
- 'BunProc.install(pkg, version)'
- 'import(plugin)'
- 'Set<PluginInstance>'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-044 - Plugin Context And Signature Baseline

```yaml
plan_unit_id: ODE-044
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Plugin context preserves the async PluginInput signature with client, project, worktree, directory, serverUrl, and $ fields, where $ is the Bun shell for subprocess execution and the plugin returns a Hooks object.
gui_related: false
gui_classification_reason: The unit records plugin API shape, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugin_context_and_signature_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plugin_context_and_signature_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0044'
preserved_exact_tokens:
- 'PluginInput'
- 'client'
- 'project'
- 'worktree'
- 'directory'
- 'serverUrl'
- '$'
- 'Hooks'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Plugins_System decides adopted PM plugin API behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-045 - Plugin Hook Events Baseline

```yaml
plan_unit_id: ODE-045
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Plugin hook events preserve event, config, tool, auth, chat.message, chat.params, chat.headers, permission.ask, command.execute.before, tool.execute.before, tool.execute.after, shell.env, experimental.chat.messages.transform, experimental.chat.system.transform, experimental.session.compacting, and experimental.text.complete.
gui_related: false
gui_classification_reason: The unit records plugin hook behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugin_hook_events_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plugin_hook_events_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0045'
preserved_exact_tokens:
- 'event'
- 'config'
- 'tool'
- 'auth'
- 'chat.message'
- 'chat.params'
- 'chat.headers'
- 'permission.ask'
- 'command.execute.before'
- 'tool.execute.before'
- 'tool.execute.after'
- 'shell.env'
- 'experimental.chat.messages.transform'
- 'experimental.chat.system.transform'
- 'experimental.session.compacting'
- 'experimental.text.complete'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-046 - Plugin Custom Tool Precedence Baseline

```yaml
plan_unit_id: ODE-046
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  OpenCode plugin custom tools are defined through the tool hook property, loaded into ToolRegistry beside built-ins, and override built-in tools on name collision as the baseline extensibility behavior.
gui_related: false
gui_classification_reason: The unit records plugin/tool registry behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugin_custom_tool_precedence_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plugin_custom_tool_precedence_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0046'
preserved_exact_tokens:
- 'tool'
- 'Record<string, ToolDefinition>'
- 'ToolRegistry'
- 'plugin tools override built-in tools'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Plugins_System and Tools.md decide whether PM adopts or diverges from this baseline.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-047 - Provider Model ID Parsing Baseline

```yaml
plan_unit_id: ODE-047
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Provider model ID parsing preserves provider_id/model_id format and parseModel() split-on-first-slash behavior, with everything before the first slash as providerID and the joined remainder as modelID.
gui_related: false
gui_classification_reason: The unit records provider identifier parsing, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_model_id_parsing_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: provider_model_id_parsing_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0048'
preserved_exact_tokens:
- 'provider_id/model_id'
- 'anthropic/claude-sonnet-4'
- 'parseModel()'
- 'providerID'
- 'modelID'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-048 - Default Model Selection Priority Baseline

```yaml
plan_unit_id: ODE-048
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Default model selection preserves config.model priority, model.json last-used lookup, internal priority list gpt-5, claude-sonnet-4, big-pickle, gemini-3-pro, latest suffix sorting, model ID sorting, and the note that CLI flag override occurs upstream.
gui_related: false
gui_classification_reason: The unit records model selection behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: default_model_selection_priority_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: default_model_selection_priority_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0049'
preserved_exact_tokens:
- 'config.model'
- 'model.json'
- 'gpt-5'
- 'claude-sonnet-4'
- 'big-pickle'
- 'gemini-3-pro'
- 'latest'
- 'CLI flag override'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-049 - Provider Specific Model Options Baseline

```yaml
plan_unit_id: ODE-049
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Provider-specific model options preserve config.provider.<provider>.options, Anthropic beta headers, OpenAI .responses() API use, Bedrock region/profile/credentials, and per-agent model overrides through agent.<name>.model.
gui_related: false
gui_classification_reason: This split unit covers backend/provider configuration behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_specific_model_options_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: provider_specific_model_options_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0050'
preserved_exact_tokens:
- 'config.provider.<provider>.options'
- 'anthropic-beta'
- 'OpenAI uses `.responses()` API'
- 'Bedrock'
- 'agent.<name>.model'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-050 - Model Variant UI And Per-Agent Variant Baseline

```yaml
plan_unit_id: ODE-050
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Model variants preserve built-in and custom variants, UI keybind cycling, and per-agent variant overrides through agent.<name>.variant.
gui_related: true
gui_classification_reason: The unit covers user-visible model variant selection behavior through UI keybind cycling.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: model_variant_ui_and_per_agent_variant_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: model_variant_ui_and_per_agent_variant_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0050'
preserved_exact_tokens:
- 'Variants'
- 'Built-in + custom variants'
- 'cycling via keybind in UI'
- 'agent.<name>.variant'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-051 - Provider Transform Layer Baseline

```yaml
plan_unit_id: ODE-051
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Provider transform baseline preserves normalizeMessages(), providerOptions(), schema() compatibility transforms, maxOutputTokens(), OUTPUT_TOKEN_MAX, and OPENCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX.
gui_related: false
gui_classification_reason: The unit records provider transform/runtime behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_transform_layer_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: provider_transform_layer_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0051'
preserved_exact_tokens:
- 'normalizeMessages()'
- 'providerOptions()'
- 'schema()'
- 'maxOutputTokens()'
- 'OUTPUT_TOKEN_MAX'
- 'OPENCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX'
negative_constraints: []
compatibility_only_notes:
- 'Provider compatibility lives in transform behavior rather than a one-to-one provider API mapping.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-052 - Provider Error Handling Baseline

```yaml
plan_unit_id: ODE-052
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Provider error handling preserves isOverflow() regex detection across provider error messages, isRetryable() provider-specific retryability including OpenAI 404 handling, and nested responseBody JSON error extraction.
gui_related: false
gui_classification_reason: The unit records provider error behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_error_handling_baseline
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: provider_error_handling_baseline
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0052'
preserved_exact_tokens:
- 'isOverflow()'
- 'isRetryable()'
- 'OpenAI 404s'
- 'responseBody'
- 'Anthropic'
- 'Bedrock'
- 'Google'
- 'xAI'
- 'Groq'
- 'DeepSeek'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-053 - Run Agent Permission Command SSOT Map

```yaml
plan_unit_id: ODE-053
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The DRY mapping routes run modes, agent switching, approval semantics, agent definitions, subagent invocation, explore agent, prompt assembly, compaction, permissions, and commands to their owning Puppet Master SSOT docs rather than duplicating definitions here.
gui_related: true
gui_classification_reason: The mapped topics include user-visible run modes, approval, command, and orchestration surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: run_agent_permission_command_ssot_map
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: run_agent_permission_command_ssot_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0053'
preserved_exact_tokens:
- 'A1'
- 'A2'
- 'A3'
- 'B1'
- 'B2'
- 'B3'
- 'B4'
- 'B5'
- 'C1'
- 'C2'
- 'C3'
- 'C4'
- 'C5'
- 'C6'
- 'D1'
- 'D2'
- 'D3'
- 'D4'
- 'Run_Modes.md'
- 'Orchestrator_Page.md'
- 'human-in-the-loop.md'
- 'Prompt_Pipeline.md'
- 'Permissions_System.md'
- 'Commands_System.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'This extraction doc records mapping; the named SSOT docs own canonical behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-054 - Formatter Skill Plugin Model SSOT Map

```yaml
plan_unit_id: ODE-054
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The DRY mapping routes formatter, skill, plugin, and model extraction topics to Formatters_System, Skills_System, Plugins_System, and Models_System owner docs.
gui_related: false
gui_classification_reason: The unit records backend/tooling owner routing, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_skill_plugin_model_ssot_map
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: formatter_skill_plugin_model_ssot_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0053'
preserved_exact_tokens:
- 'E1'
- 'E2'
- 'E3'
- 'F1'
- 'F2'
- 'F3'
- 'F4'
- 'G1'
- 'G2'
- 'G3'
- 'G4'
- 'H1'
- 'H2'
- 'H3'
- 'H4'
- 'Formatters_System.md'
- 'Skills_System.md'
- 'Plugins_System.md'
- 'Models_System.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'The named owner docs retain canonical behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-055 - Tool Provider Storage Message SSOT Map

```yaml
plan_unit_id: ODE-055
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The DRY mapping routes Tools plus ToolContext, normalized provider stream, storage event types, and message/part taxonomy to Tools.md, Contracts_V0.md, CLI_Bridged_Providers.md, storage-plan.md, and related owners.
gui_related: false
gui_classification_reason: The unit records backend/runtime owner routing, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_provider_storage_message_ssot_map
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: tool_provider_storage_message_ssot_map
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0053'
preserved_exact_tokens:
- 'Tools + ToolContext'
- 'Provider stream'
- 'Storage'
- 'Message/part taxonomy'
- 'Plans/Tools.md'
- 'Plans/Contracts_V0.md'
- 'Plans/CLI_Bridged_Providers.md'
- 'Plans/storage-plan.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'The named owner docs retain canonical behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-056 - UI Command SSOT Map And ContractRefs

```yaml
plan_unit_id: ODE-056
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The DRY mapping routes UI commands to Plans/UI_Command_Catalog.md and preserves the ContractRef set for EventRecord, UICommand, bridged providers, Provider_OpenCode, Tools, UI_Command_Catalog, and storage-plan.
gui_related: true
gui_classification_reason: The unit explicitly maps UI command behavior to the UI command catalog owner.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_command_ssot_map_and_contractrefs
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: ui_command_ssot_map_and_contractrefs
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0053'
preserved_exact_tokens:
- 'UI commands'
- 'Plans/UI_Command_Catalog.md'
- 'S2 (stable IDs)'
- 'Contracts_V0.md#EventRecord'
- 'Contracts_V0.md#7-uicommand'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'UI_Command_Catalog.md owns adopted UI command IDs and behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#7-uicommand, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Tools.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
```

### ODE-057 - Rust Plan Mode And Plan Storage Delta

```yaml
plan_unit_id: ODE-057
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master plan-mode deltas preserve Rust-native plan mode, Rust prompt-builder reminder injection, and plan file locations at global ~/.config/puppet-master/plans/ and project .puppet-master/plans/ paths.
gui_related: false
gui_classification_reason: This split unit covers backend prompt/runtime and storage behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rust_plan_mode_and_plan_storage_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: rust_plan_mode_and_plan_storage_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0055'
preserved_exact_tokens:
- 'Rust-native plan mode'
- 'system-reminder injection'
- 'Rust prompt builder'
- '~/.config/puppet-master/plans/'
- '.puppet-master/plans/'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-058 - Approval Flow Slint GUI CLI Delta

```yaml
plan_unit_id: ODE-058
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master approval-flow delta preserves removal of Bun dependency and routes PlanExitTool-like approval through the Slint GUI as primary surface with CLI fallback per Plans/Permissions_System.md.
gui_related: true
gui_classification_reason: The unit covers the user-visible Slint GUI approval surface and CLI fallback.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: approval_flow_slint_gui_cli_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: approval_flow_slint_gui_cli_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0055'
preserved_exact_tokens:
- 'No Bun dependency'
- 'PlanExitTool'
- 'Question.ask()'
- 'Slint GUI'
- 'CLI fallback'
- 'Plans/Permissions_System.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions_System owns adopted PM approval behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-059 - Subagent Context Injection Delta

```yaml
plan_unit_id: ODE-059
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master subagent/context deltas preserve subprocess or thread-based agent execution, Rust prompt assembly, configurable 20,000-token reserve and 40,000-token prune-protect values, and plugin prompt transform aliases for experimental.chat.system.transform and experimental.chat.messages.transform.
gui_related: false
gui_classification_reason: The unit records runtime/prompt behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: subagent_context_injection_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: subagent_context_injection_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0056'
preserved_exact_tokens:
- 'subprocess-based or thread-based'
- 'Prompt assembly in Rust'
- '20,000-token reserve'
- '40,000-token prune-protect'
- 'experimental.chat.system.transform'
- 'experimental.chat.messages.transform'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-060 - Permission Persistence Wildcard Reject Cascade Delta

```yaml
plan_unit_id: ODE-060
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master permission deltas preserve session-scoped always approvals as default, no cross-session persistence, a Rust wildcard engine or library, and reject-all cascade behavior for pending permissions.
gui_related: false
gui_classification_reason: This split unit covers backend permission storage and matching behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_persistence_wildcard_reject_cascade_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: permission_persistence_wildcard_reject_cascade_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0057'
preserved_exact_tokens:
- 'session-scoped approvals'
- 'not persisted to disk'
- 'Rust wildcard engine'
- 'Reject-all cascade'
negative_constraints:
- 'Persistence across sessions is not supported.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-061 - Permission Approval GUI CLI Delta

```yaml
plan_unit_id: ODE-061
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master approval-flow delta preserves the requirement to wire OpenCode ask/reply semantics through a Tauri GUI or CLI interface.
gui_related: true
gui_classification_reason: The unit covers user-visible GUI/CLI approval interaction.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permission_approval_gui_cli_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: permission_approval_gui_cli_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0057'
preserved_exact_tokens:
- 'GUI approval flow'
- 'Tauri GUI'
- 'CLI interface'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Permissions_System and human-in-the-loop own adopted PM approval behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-062 - Commands Discovery Template MCP Delta

```yaml
plan_unit_id: ODE-062
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master command deltas preserve .puppet-master/commands discovery paths, global config commands, Rust reimplementation of $ARGUMENTS, $1/$2, shell injection, @file syntax, and the caveat that MCP prompt integration may differ.
gui_related: false
gui_classification_reason: The unit records command runtime/template behavior, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: commands_discovery_template_mcp_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: commands_discovery_template_mcp_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0058'
preserved_exact_tokens:
- '.puppet-master/commands/'
- '~/.config/puppet-master/commands/'
- '$ARGUMENTS'
- '$1'
- '$2'
- 'shell injection'
- '@file'
- 'MCP prompt integration'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-063 - Formatter Event Detection Invocation Delta

```yaml
plan_unit_id: ODE-063
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master formatter deltas preserve file.edited event triggering, Rust or delegated formatter auto-detection, and substitution of BunProc.which() with system which-based detection and direct process invocation.
gui_related: false
gui_classification_reason: The unit records formatter runtime behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: formatter_event_detection_invocation_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: formatter_event_detection_invocation_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0059'
preserved_exact_tokens:
- 'file.edited'
- 'Rust event system'
- 'Formatter auto-detection'
- 'BunProc.which()'
- 'which'
- 'direct process invocation'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-064 - Skills Compatibility And PM Runtime Boundary

```yaml
plan_unit_id: ODE-064
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master skill deltas preserve OpenCode as architecture pattern only, PM-native skills as canonical runtime path, compatibility roots .claude/skills and .agents/skills, optional provider/tool-native projection, and PM registry/readiness/context bundling/skill tool authority.
gui_related: false
gui_classification_reason: The unit records skill runtime and compatibility boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_compatibility_and_pm_runtime_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: skills_compatibility_and_pm_runtime_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0060'
preserved_exact_tokens:
- 'Architecture pattern, not ownership transfer'
- '.claude/skills'
- '.agents/skills'
- 'Projection posture'
- 'Discovery vs runtime'
- 'skill tool'
negative_constraints: []
compatibility_only_notes:
- 'Compatibility import does not make external roots canonical.'
- 'Provider-native or tool-native skill projection is optional compatibility only.'
stale_retired_dispositions: []
owner_boundary_notes:
- 'Skills_System and PM runtime registry remain authoritative.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/MiscPlan.md, ContractName:Plans/Provider_OpenCode.md'
```

### ODE-065 - Plugins Runtime Hooks Auth Tool Override Delta

```yaml
plan_unit_id: ODE-065
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master plugin deltas preserve the OpenCode JavaScript/TypeScript plugin baseline as reference, require a PM Rust plugin API choice, support the hook subset defined in Plugins_System, implement auth providers natively, and require override_builtin: true for plugin tool overrides.
gui_related: false
gui_classification_reason: The unit records plugin/runtime behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_runtime_hooks_auth_tool_override_delta
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: plugins_runtime_hooks_auth_tool_override_delta
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0061'
preserved_exact_tokens:
- 'JavaScript/TypeScript'
- 'WASM'
- 'dynamic libraries'
- 'subprocess-based'
- 'scripting language bindings'
- 'Plans/Plugins_System.md §4'
- 'auth providers natively'
- 'override_builtin: true'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-066 - Models Provider Transform Priority Overflow Boundary

```yaml
plan_unit_id: ODE-066
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Puppet Master model deltas preserve Vercel AI SDK as external baseline only, Rust-native provider abstraction, provider transform replication, configurable model priority list, maintained overflow regex patterns, and model/memory owner-boundary verification against Models_System and assistant-memory-subsystem.
gui_related: false
gui_classification_reason: The unit records model/provider runtime boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: models_provider_transform_priority_overflow_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: models_provider_transform_priority_overflow_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0062'
preserved_exact_tokens:
- 'Vercel AI SDK'
- 'Plans/Models_System.md'
- 'hardcoded priority list'
- 'regex-based overflow detection'
- 'Plans/assistant-memory-subsystem.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'Models_System and assistant-memory-subsystem own adopted model and memory behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-067 - Upstream Notes Anti Equivalence Guard

```yaml
plan_unit_id: ODE-067
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Upstream notes exist to prevent downstream agents from assuming Puppet Master equals OpenCode by recording where key upstream models live and which deltas commonly cause mis-mapping.
gui_related: false
gui_classification_reason: The unit records audit guidance, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: upstream_notes_anti_equivalence_guard
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: upstream_notes_anti_equivalence_guard
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0063'
preserved_exact_tokens:
- 'assuming Puppet Master == OpenCode'
- 'where'
- 'deltas'
- 'mis-mapping'
negative_constraints:
- 'Do not assume Puppet Master == OpenCode.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-068 - ToolContext And Tool Lifecycle Pointers

```yaml
plan_unit_id: ODE-068
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Tool upstream notes preserve plugin and internal tool contracts, tool loading/registry paths, model-gated tool availability, and lifecycle hooks tool.execute.before and tool.execute.after as plugin triggers rather than Bus events.
gui_related: false
gui_classification_reason: The unit records tool/runtime pointers, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: toolcontext_and_tool_lifecycle_pointers
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: toolcontext_and_tool_lifecycle_pointers
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0064'
preserved_exact_tokens:
- 'ToolContext'
- 'ask()'
- '{title, metadata, output, attachments?}'
- 'ToolRegistry'
- 'model-gated tool availability'
- 'tool.execute.before'
- 'tool.execute.after'
- 'not Bus events'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-069 - Permissions Upstream Pointers And Next Preference

```yaml
plan_unit_id: ODE-069
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Permission upstream notes preserve next.ts and permission route pointers, once/always/reject replies, CorrectedError versus RejectedError behavior, wildcard patterns ending in space-star, and preference for permission/next.ts over the older implementation.
gui_related: false
gui_classification_reason: The unit records permission upstream pointers, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: permissions_upstream_pointers_and_next_preference
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: permissions_upstream_pointers_and_next_preference
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0065'
preserved_exact_tokens:
- 'permission/next.ts'
- 'routes/permission.ts'
- 'once | always | reject'
- 'CorrectedError'
- 'RejectedError'
- '" *"'
- 'Prefer `next.ts`'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-070 - Provider Transform Compatibility Boundary

```yaml
plan_unit_id: ODE-070
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Provider upstream notes preserve provider/model registry pointers, transform/error layer pointers, and the compatibility warning that upstream tool/message parts must not be assumed to map one-to-one to any single provider API.
gui_related: false
gui_classification_reason: The unit records provider compatibility boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_transform_compatibility_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: provider_transform_compatibility_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0066'
preserved_exact_tokens:
- 'providerID'
- 'modelID'
- 'provider/transform.ts'
- 'provider/error.ts'
- 'provider compatibility'
- 'not in the core session stream'
- '1:1'
negative_constraints: []
compatibility_only_notes:
- 'Do not assume upstream tool/message parts map one-to-one to any single provider API.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-071 - Message Part Taxonomy Compatibility Boundary

```yaml
plan_unit_id: ODE-071
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Session message notes preserve legacy and current message schemas, part taxonomy, ToolState pending/running/completed/error, and the warning that upstream injects synthetic messages or parts to satisfy provider constraints.
gui_related: false
gui_classification_reason: The unit records session/message compatibility behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: message_part_taxonomy_compatibility_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: message_part_taxonomy_compatibility_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0067'
preserved_exact_tokens:
- 'message.ts'
- 'message-v2.ts'
- 'text|reasoning|file|tool|step-start|step-finish|snapshot|patch|subtask|retry|compaction|agent'
- 'pending|running|completed|error'
- 'tool_use'
- 'tool_result'
negative_constraints: []
compatibility_only_notes:
- 'Synthetic upstream messages and parts are provider-constraint compatibility behavior.'
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-072 - Server Routes Tauri Mapping Boundary

```yaml
plan_unit_id: ODE-072
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Server route notes preserve OpenCode Hono HTTP server, SSE, CORS, basic auth, WebSocket support, route modules, and the exact delta that Puppet Master maps API surface to Tauri commands or internal Rust function calls.
gui_related: false
gui_classification_reason: The unit records backend API mapping, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: server_routes_tauri_mapping_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: server_routes_tauri_mapping_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0068'
preserved_exact_tokens:
- 'Hono-based HTTP server'
- 'SSE streaming'
- 'CORS'
- 'basic auth'
- 'WebSocket'
- 'routes/session.ts'
- 'routes/permission.ts'
- 'Tauri commands'
- 'internal Rust function calls'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-073 - UI Blocker Orchestrator Pattern Pointer

```yaml
plan_unit_id: ODE-073
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  The UI blocker/orchestrator upstream note preserves the session composer blocker pattern where question and permission blocks prevent prompt input.
gui_related: true
gui_classification_reason: The unit covers user-visible prompt input blocking and session composer behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_blocker_orchestrator_pattern_pointer
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: ui_blocker_orchestrator_pattern_pointer
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0069'
preserved_exact_tokens:
- 'UI blocker/orchestrator pattern'
- 'question/permission blocks prompt input'
- 'specs/session-composer-refactor-plan.md'
- 'packages/app/src/pages/session/composer/*'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```

### ODE-074 - Usage Pipeline Mapping Boundary

```yaml
plan_unit_id: ODE-074
unit_type: requirement
status: accepted
owner_doc: Plans/OpenCode_Deep_Extraction.md
canonical_text: >-
  Usage pipeline notes preserve Session.getUsage, processor finish-step normalization lineage, and the rule that extracted usage terminology, persistence semantics, and UI linkage MUST map into Plans/usage-feature.md and Plans/storage-plan.md instead of creating an OpenCode-shaped usage vocabulary.
gui_related: true
gui_classification_reason: The unit includes UI linkage for usage records as well as persistence semantics.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- 'Covered source spans remain losslessly available for exact-text audit.'
- 'The covered OpenCode baseline or delta fact is represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.'
- 'OpenCode-derived behavior remains reference lineage unless the named Puppet Master owner doc explicitly adopts it.'
- 'No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.'
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_pipeline_mapping_boundary
reasoning_tier: standard
context_scope: opencode_deep_extraction_standardization
implementation_surfaces:
- Plans/OpenCode_Deep_Extraction.md
node_compile_hint:
  mode: usage_pipeline_mapping_boundary
  create_worknodes: false
source_lineage:
- 'Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:OpenCode_Deep_Extraction-S0070'
preserved_exact_tokens:
- 'Session.getUsage'
- 'processor finish-step'
- 'usage terminology'
- 'persistence semantics'
- 'UI linkage'
- 'MUST map'
- 'Plans/usage-feature.md'
- 'Plans/storage-plan.md'
negative_constraints:
- 'Do not create a parallel OpenCode-shaped usage vocabulary in this document or downstream packets.'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- 'usage-feature.md and storage-plan.md own adopted usage and storage behavior.'
owner_hints:
- Plans/OpenCode_Deep_Extraction.md
preserved_contractrefs: []
```



## Migration Coverage

Original hash: `a34ba16b8d9204278f712a7d59bd7dfc26ec3b7b2f489b3fd2b5ffb53616db21`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Original spans `OpenCode_Deep_Extraction-S0001` through `OpenCode_Deep_Extraction-S0070` are atomized or structurally dispositioned in the active coverage map. `ODE-001` is retired to migration-lineage-only compatibility disposition and no longer carries source-preserving product coverage. The Owner / Consumer Map, PlanUnits, and Migration Coverage metadata spans are structurally dispositioned. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
