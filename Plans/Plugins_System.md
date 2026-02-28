# Plugins System (Canonical SSOT)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for the Puppet Master plugin system — discovery, loading, hook lifecycle, custom tool registration, and structured logging. All other plan documents MUST reference this document by anchor (e.g., `Plans/Plugins_System.md#HOOK-EVENTS`) rather than restating plugin definitions, hook signatures, or load-order rules.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- Tool registry + tool semantics: `Plans/Tools.md`
- Permissions system: `Plans/Permissions_System.md`
- Persona system: `Plans/Personas.md`
- OpenCode baseline (plugins): `Plans/OpenCode_Deep_Extraction.md` §7G
- Formatters system: `Plans/Formatters_System.md`
- Models system: `Plans/Models_System.md`
- GUI specification: `Plans/FinalGUISpec.md`

---

## 1. Definitions

<a id="DEF-PLUGIN"></a>
### 1.1 Plugin

A **Plugin** is a self-contained extension module that hooks into the Puppet Master lifecycle via a defined set of events. A plugin is loaded once at session start (or when first discovered) and remains active for the session duration. Plugins MAY register custom tools, modify prompts, intercept tool execution, and inject context during compaction.

<a id="DEF-HOOK"></a>
### 1.2 Hook

A **Hook** is a named callback registered by a plugin for a specific lifecycle event. When the event fires, all registered hooks are invoked in deterministic order (§3.3). A hook receives a typed context object and returns a result that may continue, modify, or block the pipeline.

ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Tools.md

---

## 2. Discovery and storage

<a id="DISCOVERY"></a>

### 2.1 Discovery paths

Plugins are discovered from three sources in strict order:

| Priority | Source | Path / Config |
|----------|--------|---------------|
| 1 (first) | **Internal plugins** | Compiled into the Puppet Master binary (e.g., auth adapters). Not user-editable. |
| 2 | **Project-local** | `.puppet-master/plugins/<plugin_id>/` in the active project root. |
| 3 | **Global** | `~/.config/puppet-master/plugins/<plugin_id>/` |
| 4 (last) | **Config package list** | `config.plugins[]` — package specifiers or `file://` local paths. |

ContractRef: PolicyRule:Decision_Policy.md§2

### 2.2 Plugin manifest

Each plugin directory MUST contain a `plugin.json` manifest:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "0.1.0",
  "description": "Short description of what this plugin does.",
  "hooks": ["tool.execute.before", "tool.execute.after"],
  "tools": ["my-custom-tool"],
  "entry": "plugin.wasm"
}
```

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `id` | **Required** | `string` | Unique plugin ID. Regex: `^[a-z][a-z0-9-]{1,48}[a-z0-9]$`. MUST match directory name. |
| `name` | **Required** | `string` | Human-readable display name. Max 100 characters. |
| `version` | **Required** | `string` | Semver version string. |
| `description` | **Required** | `string` | Max 500 characters. |
| `hooks` | Recommended | `string[]` | List of hook event names this plugin subscribes to (from §4). |
| `tools` | Optional | `string[]` | List of custom tool names this plugin registers (§6). |
| `entry` | **Required** | `string` | Relative path to the plugin entry point (WASM module, script, or subprocess binary). |

ContractRef: ContractName:Plans/Plugins_System.md#DISCOVERY

### 2.3 Deduplication

If the same `id` appears in multiple sources, the **first-discovered instance wins** (by priority order in §2.1). Later duplicates are skipped and a warning is logged.

---

## 3. Load order and execution model

<a id="LOAD-ORDER"></a>

### 3.1 Deterministic load order

Plugins are loaded in strict priority order (§2.1). Within a single source (e.g., project-local), plugins are loaded in lexicographic order by `id`.

Rule: Given the same set of plugins on disk and in config, the load order MUST be identical across runs.

ContractRef: PolicyRule:Decision_Policy.md§3

### 3.2 Plugin lifecycle

1. **Discover:** Walk discovery paths (§2.1); collect valid manifests.
2. **Validate:** Parse `plugin.json`; reject plugins with invalid manifests (log warning, skip).
3. **Initialize:** Load the entry module; pass a `PluginContext` object (§3.4). The plugin registers hooks and custom tools.
4. **Active:** Hooks are invoked throughout the session.
5. **Teardown:** On session end, a `session.end` event fires; plugins perform cleanup. Puppet Master then unloads plugins.

### 3.3 Hook execution order

<a id="HOOK-EXECUTION-ORDER"></a>

When an event fires, all registered hooks for that event are invoked in **plugin load order** (§3.1). Within a single plugin, if multiple handlers exist for the same event, they execute in registration order.

Rule: Hook execution order MUST be deterministic. Internal plugins execute first, then project-local, then global, then config-sourced.

ContractRef: ContractName:Plans/Plugins_System.md#LOAD-ORDER

### 3.4 Plugin context object

<a id="PLUGIN-CONTEXT"></a>

When a plugin is initialized, it receives a `PluginContext`:

```
PluginContext {
  project_root: Option<PathBuf>,       // Active project root (None if no project)
  global_config_dir: PathBuf,          // ~/.config/puppet-master/
  plugin_data_dir: PathBuf,            // Per-plugin persistent storage dir
  register_hook: fn(event, handler),   // Register a hook callback
  register_tool: fn(tool_def),         // Register a custom tool (§6)
  log: fn(level, message),             // Structured log emitter (§8)
}
```

The `PluginContext` is the sole API surface for plugins. Plugins MUST NOT access Puppet Master internals outside this interface.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 4. Hook events

<a id="HOOK-EVENTS"></a>

The following hook events are defined. Each event specifies its input shape and the allowed return actions.

Rule: Every hook event MUST be listed in this table. New events require an update to this document.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Tools.md

### 4.1 Tool execution hooks

<a id="HOOK-TOOL-EXECUTE"></a>

#### `tool.execute.before`

| Field | Value |
|-------|-------|
| **Fires** | Before a tool invocation is executed (after permission check passes). |
| **Input** | `{ tool_name: String, args: Value, invocation_id: String }` |
| **Returns** | `Continue` (proceed), `Continue(modified_args)` (proceed with changed args), or `Block(reason)` (abort tool call with reason). |

#### `tool.execute.after`

| Field | Value |
|-------|-------|
| **Fires** | After a tool invocation completes (success or error). |
| **Input** | `{ tool_name: String, args: Value, result: ToolResult, invocation_id: String, duration_ms: u64 }` |
| **Returns** | `Continue` (pass result through), or `Continue(modified_result)` (return modified result to the agent). |

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md#EventRecord

### 4.2 Permission hooks

<a id="HOOK-PERMISSION"></a>

#### `permission.ask`

| Field | Value |
|-------|-------|
| **Fires** | When the permission engine resolves a tool invocation to `ask` (before presenting to user). |
| **Input** | `{ tool_name: String, args: Value, resolved_action: "ask" }` |
| **Returns** | `Continue` (present ask UI), `Allow` (auto-approve), or `Deny(reason)`. |

Rule: Plugin overrides of permission decisions MUST be logged to the event ledger as `plugin.permission.override` events.

ContractRef: ContractName:Plans/Permissions_System.md#ASK-FLOW

### 4.3 Session hooks

<a id="HOOK-SESSION"></a>

#### `session.start`

| Field | Value |
|-------|-------|
| **Fires** | After all plugins are initialized and before the first user message is processed. |
| **Input** | `{ session_id: String, project_root: Option<PathBuf> }` |
| **Returns** | `Continue` only. |

#### `session.end`

| Field | Value |
|-------|-------|
| **Fires** | Before plugin teardown, after the last interaction in the session. |
| **Input** | `{ session_id: String, summary: Option<String> }` |
| **Returns** | `Continue` only. |

### 4.4 Message hooks

<a id="HOOK-MESSAGE"></a>

#### `chat.message`

| Field | Value |
|-------|-------|
| **Fires** | When a new user message is received, before prompt assembly. |
| **Input** | `{ message_text: String, session_id: String }` |
| **Returns** | `Continue` or `Continue(modified_text)`. |

#### `chat.params`

| Field | Value |
|-------|-------|
| **Fires** | Before sending the assembled prompt to the LLM provider. |
| **Input** | `{ temperature: Option<f64>, top_p: Option<f64>, max_tokens: Option<u32>, model: String }` |
| **Returns** | `Continue` or `Continue(modified_params)`. |

### 4.5 Compaction hook

<a id="HOOK-COMPACTION"></a>

#### `session.compacting`

| Field | Value |
|-------|-------|
| **Fires** | When auto-compaction is triggered (context usage exceeds threshold). |
| **Input** | `{ session_id: String, current_context: Vec<ContextItem>, compaction_prompt: String }` |
| **Returns** | `Continue` (use default compaction), `InjectContext(additional_items: Vec<ContextItem>)` (append items to compaction context), or `ReplacePrompt(new_prompt: String)` (replace the entire compaction prompt). |

Rule: Only one plugin MAY return `ReplacePrompt` per compaction event. If multiple plugins attempt `ReplacePrompt`, the **first by load order** wins; subsequent `ReplacePrompt` returns are downgraded to `InjectContext` with a warning logged.

ContractRef: ContractName:Plans/Plugins_System.md#HOOK-EXECUTION-ORDER

### 4.6 Shell environment hook

#### `shell.env`

| Field | Value |
|-------|-------|
| **Fires** | Before a bash/shell tool invocation, after environment is assembled. |
| **Input** | `{ env: HashMap<String, String> }` |
| **Returns** | `Continue` or `Continue(modified_env)`. |

### 4.7 System prompt hook

#### `system.prompt.transform`

| Field | Value |
|-------|-------|
| **Fires** | After the system prompt is assembled, before sending to the provider. |
| **Input** | `{ system_parts: Vec<String> }` |
| **Returns** | `Continue` or `Continue(modified_parts)`. |

---

## 5. Hook return semantics

<a id="HOOK-RETURNS"></a>

All hooks return one of the following actions:

| Action | Meaning |
|--------|---------|
| `Continue` | Proceed with the pipeline unchanged. |
| `Continue(modified)` | Proceed with the modified payload. The next hook in the chain receives the modified version. |
| `Block(reason)` | Abort the pipeline. Only applicable to `tool.execute.before`. The reason is returned to the agent as an error. |
| `Allow` | Auto-approve (only for `permission.ask`). |
| `Deny(reason)` | Auto-deny (only for `permission.ask`). |
| `InjectContext(items)` | Append context items (only for `session.compacting`). |
| `ReplacePrompt(prompt)` | Replace compaction prompt (only for `session.compacting`). |

Rule: If a hook raises an unhandled error (panic, timeout), it is treated as `Continue` and a warning is logged. Default hook timeout: 5 seconds (configurable via `config.plugins.hook_timeout_ms`, default `5000`).

ContractRef: PolicyRule:Decision_Policy.md§2

---

## 6. Custom tool registration

<a id="CUSTOM-TOOLS"></a>

### 6.1 Registration

Plugins MAY register custom tools via `PluginContext.register_tool(tool_def)`. The `tool_def` includes:

```
ToolDefinition {
  name: String,                        // Tool name (validated per Plans/Tools.md §3)
  description: String,                 // Tool description shown to agents
  input_schema: Value,                 // JSON Schema for tool input
  execute: fn(args: Value) -> Result<ToolResult>,  // Execution handler
}
```

### 6.2 Name collision behavior

<a id="TOOL-COLLISION"></a>

Rule: When a plugin registers a tool whose name collides with a built-in tool, the **built-in tool takes precedence** by default. The plugin tool is registered under a namespaced alias: `<plugin_id>.<tool_name>` (e.g., `my-plugin.read`).

A config flag `config.plugins.allow_tool_override` (default `false`) MAY be set to `true` to allow plugin tools to override built-in tools. When enabled, plugin tools registered later in load order override earlier ones.

ContractRef: ContractName:Plans/Tools.md

### 6.3 Central registry routing

All plugin-registered tools are added to the central tool registry (`Plans/Tools.md`). They are subject to the same permission policy engine (`Plans/Permissions_System.md`). Unknown tools default to `ask` permission.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md#DEFAULTS

---

## 7. Plugin configuration

<a id="PLUGIN-CONFIG"></a>

### 7.1 Config shape

```toml
[plugins]
hook_timeout_ms = 5000
allow_tool_override = false

# Package list (config-sourced plugins)
packages = [
  "puppet-master-lint-hook@0.1.0",
  "file:///home/user/my-local-plugin",
]

# Per-plugin enable/disable
[plugins.disabled]
"noisy-plugin" = true
```

### 7.2 Enable/disable

Individual plugins can be disabled via `config.plugins.disabled.<plugin_id> = true`. Disabled plugins are not loaded. This persists across sessions.

### 7.3 Per-Persona plugin overrides

A Persona MAY list plugins to disable for runs using that Persona, via the `disabled_plugins` field in the PERSONA.md frontmatter (defined in `Plans/Personas.md` §3.2):

```yaml
disabled_plugins: ["noisy-plugin"]
```

When a Persona is active, any plugin whose `id` appears in `disabled_plugins` is skipped during hook dispatch (not unloaded, just silenced).

ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA

---

## 8. Structured plugin logging

<a id="PLUGIN-LOGGING"></a>

All plugin activity is logged to the Puppet Master event ledger (`Plans/Contracts_V0.md#EventRecord`).

### 8.1 Event types

| Event type | When emitted |
|------------|-------------|
| `plugin.loaded` | Plugin successfully initialized. |
| `plugin.load_failed` | Plugin failed to load (invalid manifest, entry error). |
| `plugin.hook.invoked` | A hook was called (includes plugin_id, event name, duration_ms). |
| `plugin.hook.error` | A hook raised an error or timed out. |
| `plugin.hook.blocked` | A hook returned `Block` (includes reason). |
| `plugin.permission.override` | A plugin overrode a permission decision (§4.2). |
| `plugin.tool.registered` | A custom tool was registered (includes tool name, plugin_id). |
| `plugin.tool.collision` | A tool name collision was detected (includes resolution). |

### 8.2 Log format

Plugin log entries include: `timestamp`, `plugin_id`, `event_type`, `payload` (structured JSON). Plugins use `PluginContext.log(level, message)` which emits events with `source: "plugin:<plugin_id>"`.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord

---

## 9. GUI requirements

<a id="GUI-PLUGINS"></a>

The Plugins settings screen is a tab in the unified Settings page (`Plans/FinalGUISpec.md` §7.4).

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### 9.1 Plugins tab

A dedicated **Plugins** tab in Settings MUST provide:

1. **Plugin list:** Table of all discovered plugins (internal, project, global, config). Columns: Name, ID, Version, Source (internal/project/global/config), Status (active/disabled/error), Hook count, Tool count. Internal plugins shown with a locked badge (cannot be disabled).

2. **Enable/disable toggle:** Per-plugin toggle (except internal). Persisted to `config.plugins.disabled`.

3. **Plugin detail:** Expanding a row shows: full description, list of hooks subscribed, list of custom tools registered, entry path, and plugin data directory path.

4. **Add plugin:** "Add plugin" button supporting:
   - "Install from package" — enter a package specifier (e.g., `puppet-master-lint-hook@0.1.0`).
   - "Add local" — file picker selecting a directory containing `plugin.json`.
   Adds to `config.plugins.packages` and triggers reload.

5. **Remove plugin:** Remove button per config-sourced plugin. Project/global plugins show "Delete from disk" with confirmation.

6. **Config overrides:** Collapsible card for `hook_timeout_ms` (spinner, range 1000–30000, default 5000) and `allow_tool_override` (toggle, default off, warning label when enabled).

### 9.2 ELI5/Expert copy

Plugin UI elements follow the app-level Interaction Mode (Expert/ELI5) toggle per `Plans/FinalGUISpec.md` §7.4.0. Tooltip keys: `tooltip.plugins.*` prefix.

- **ELI5:** Simplified view showing only plugin list with enable/disable toggles. Hook details, tool collision config, and timeout settings are hidden.
- **Expert:** Full view with all sections visible.

---

## 10. OpenCode baseline and Puppet Master deltas

<a id="BASELINE-DELTAS"></a>

Per `Plans/OpenCode_Deep_Extraction.md` §7G and §9G:

### 10.1 Baseline

OpenCode plugins are JavaScript/TypeScript modules loaded via `import()`. Plugin sources: internal (compiled), built-in npm packages, and config-specified packages/paths. Plugins receive a `PluginInput` with SDK client, project metadata, and Bun shell. The `Hooks` interface defines ~15 named hooks including `tool.execute.before/after`, `permission.ask`, `experimental.session.compacting`, `chat.message`, `chat.params`, `shell.env`, and system/message transforms. Custom tools are registered via the `tool` property; plugin tools override built-ins on name collision.

### 10.2 Puppet Master deltas

1. **Plugin runtime:** OpenCode uses JS `import()` with Bun. Puppet Master uses a platform-agnostic plugin API (WASM modules, subprocess-based, or dynamic libraries — entry format defined by `plugin.json` `entry` field). No JavaScript runtime dependency.
2. **Tool collision policy:** OpenCode allows plugin tools to override built-ins by default. Puppet Master defaults to **namespaced aliasing** (built-in wins); override requires explicit opt-in via `allow_tool_override`.
3. **Compaction hook naming and semantics:** OpenCode uses `experimental.session.compacting` as the hook key. Puppet Master canonicalizes this as `session.compacting` (dropping the `experimental.` prefix). For backward compatibility, plugins subscribing to `experimental.session.compacting` are mapped to the canonical `session.compacting` hook at registration time as an alias. Puppet Master additionally formalizes the return semantics with `InjectContext` vs `ReplacePrompt` return types and first-wins conflict resolution for `ReplacePrompt`.
4. **Deterministic load order:** OpenCode deduplicates by function identity. Puppet Master defines strict priority-ordered discovery with lexicographic tiebreaking and documents the order for reproducibility.
5. **Structured logging:** OpenCode plugin errors are logged but not structured. Puppet Master emits typed ledger events (`plugin.loaded`, `plugin.hook.invoked`, etc.) for auditability.
6. **Per-Persona overrides:** OpenCode has no per-agent plugin controls. Puppet Master allows Personas to disable specific plugins via `disabled_plugins`.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 11. Acceptance criteria

<a id="ACCEPTANCE"></a>

These criteria are testable assertions that MUST hold for any conforming implementation.

ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Progression_Gates.md

<a id="AC-PL01"></a>
**AC-PL01:** Plugin discovery MUST follow the priority order in §2.1. First-discovered plugin with a given `id` wins; later duplicates MUST be skipped with a warning.

<a id="AC-PL02"></a>
**AC-PL02:** Plugin load order MUST be deterministic (§3.1). Given the same plugins on disk and in config, the load order MUST be identical across runs.

<a id="AC-PL03"></a>
**AC-PL03:** Hook execution order MUST follow plugin load order (§3.3). Internal plugins execute first.

<a id="AC-PL04"></a>
**AC-PL04:** A `tool.execute.before` hook returning `Block(reason)` MUST prevent the tool from executing and return the reason to the agent.

<a id="AC-PL05"></a>
**AC-PL05:** Custom tools registered by plugins MUST route through the central tool registry and permission policy engine.

<a id="AC-PL06"></a>
**AC-PL06:** By default, plugin tools MUST NOT override built-in tools. Collisions MUST be resolved by namespaced aliasing unless `allow_tool_override` is `true`.

<a id="AC-PL07"></a>
**AC-PL07:** Plugin hook invocations, errors, blocks, and permission overrides MUST be logged as typed events in the event ledger.

<a id="AC-PL08"></a>
**AC-PL08:** Hooks that timeout (default 5s) or panic MUST be treated as `Continue` with a warning logged. The pipeline MUST NOT crash.

<a id="AC-PL09"></a>
**AC-PL09:** The GUI Plugins tab MUST display all discovered plugins with enable/disable toggles, and persist disable state across sessions.

<a id="AC-PL10"></a>
**AC-PL10:** Plugins subscribing to the OpenCode-era hook key `experimental.session.compacting` MUST be treated as subscribers to the canonical `session.compacting` hook. The alias mapping is applied at plugin registration time; no runtime distinction exists between the two keys.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Plugins_System.md#HOOK-EVENTS

---

*Document created for planning only; no code changes.*
