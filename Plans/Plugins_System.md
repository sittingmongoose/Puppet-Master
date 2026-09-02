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

### P5 plugin boundary recovery

Plugin-owned Persona and model references must link through `Plans/Glossary.md`, `/Glossary.md`, `Plans/00-plans-index.md`, `/00-plans-index.md`, `Plans/Personas.md`, `/Personas.md`, `Plans/Models_System.md`, and `/Models_System.md` rather than defining duplicate terminology.

Plugin UI and runtime references must also link through `Plans/FinalGUISpec.md`, `/FinalGUISpec.md`, `Plans/Glossary.md`, `/Glossary.md`, `Plans/Personas.md`, `/Personas.md`, `Plans/Models_System.md`, and `/Models_System.md` when presenting plugin-facing Persona or model metadata.

Tooling enforcement boundaries are central policy, not plugin-private behavior: `Plans/Formatters_System.md`, Formatters_System, `Plans/Plugins_System.md`, Plugins_System, `Plans/Skills_System.md`, Skills_System, `Plans/LSPSupport.md`, LSPSupport.md, `/policy`, `/runtime`, `/DAE`, DAE, HTE, read-only, mutation-capable, env-var, bundling-off, internal-service, and multi-project-tab cases must all rejoin the same mutation and attribution model.

Plugin hooks may expose package, seam, corroboration, and concern integration points through `Plans/Executor_Protocol.md`, Executor_Protocol, Executor_Protocol.md, and `/seam/corroboration/concern`, but those hooks remain subject to this plugin lifecycle and permission model.

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

### 2.2 Plugin manifests

Plugin packages use the split and precedence contract in [Manifest split and deterministic precedence](#manifest-split-and-deterministic-precedence): PM-internal interchange `plugin.json` owns only interchange skills under `skills/` plus interchange MCP configuration in `mcp.json`, while PM-native `pm-plugin.json` owns Puppet Master hooks, tools, commands, UI, native runtime entry, permissions, capabilities, sandbox, signature, and supply-chain references. The internal interchange is not directly loadable OpenAI/Codex or Claude Code packaging. A named target adapter must separately emit `.codex-plugin/plugin.json` or `.claude-plugin/plugin.json` plus `.mcp.json` under the target's current schema and conformance gate. A package may contain either PM manifest or both PM manifests; when both exist, each validates independently, their `id` and `version` MUST match exactly, and their fields are never merged. An interchange-only package is not a PM-native executable plugin.

Each fresh or migrated PM-native plugin directory MUST contain a `pm-plugin.json` manifest with the preserved native identity and entry fields:

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
| `hooks` | Recommended | `string[]` | PM-native hook event names this plugin subscribes to (from §4). |
| `tools` | Optional | `string[]` | PM-native custom tool names this plugin registers (§6). |
| `entry` | **Required** | `string` | Relative path to the PM-native plugin entry point (WASM module, subprocess-based entry, or dynamic library). JavaScript/TypeScript/Bun entries are OpenCode compatibility evidence only and are not a Puppet Master runtime dependency. |

An existing `plugin.json` with the legacy PM-native `hooks`/`tools`/`entry` shape is `legacy_imported` migration input, never internal-interchange canon. It is hash-bound, is not silently rewritten or merged, and follows the explicit migration/reapproval boundaries in [Legacy migration](#legacy-migration); a fresh install of that legacy shape fails closed with migration-required guidance.

ContractRef: ContractName:Plans/Plugins_System.md#DISCOVERY

### 2.3 Deduplication

If the same `id` appears in multiple sources, the **first-discovered instance wins** (by priority order in §2.1). Later duplicates are skipped and a warning is logged.

---

## 3. Load order and execution model

### 3.1 Auto-load prohibition

PM MUST NOT auto-load executable plugin code from config without explicit user approval. This is the plugin no-auto-load executable-code rule.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md

Required behavior:
- first-time plugin load shows source, declared hooks, requested capabilities, and trust implications
- approval is version/hash-sensitive; source change requires new approval
- config-only discovery does not imply execution approval

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 3.2 Deterministic load order

Plugins are loaded in strict priority order (§2.1). Within a single source (e.g., project-local), plugins are loaded in lexicographic order by `id`.

Rule: Given the same set of plugins on disk and in config, the load order MUST be identical across runs.

ContractRef: PolicyRule:Decision_Policy.md§3

### 3.2 Plugin lifecycle

1. **Discover:** Walk discovery paths (§2.1); collect PM-internal interchange `plugin.json`, PM-native `pm-plugin.json`, dual-manifest, and legacy-import candidates.
2. **Validate:** Validate each present PM manifest independently, require exact dual-manifest `id`/`version` agreement, reject invalid or mismatched packages, and classify legacy PM-shaped `plugin.json` as `legacy_imported` rather than interchange. A requested OpenAI/Codex or Claude Code export is a separate target-adapter operation, not discovery-time reinterpretation.
3. **Initialize:** After required approval, load only the PM-native entry declared by `pm-plugin.json`; pass a `PluginContext` object (§3.4) so the plugin can register hooks and custom tools. Interchange-only skill/MCP components remain with their internal import owners and do not enter this PM-native initialization step; target-adapter output grants no PM-native activation.
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

#### 4.1.1 Hook re-check invariant

If a plugin hook modifies tool arguments, the modified arguments MUST be re-run through permission and validation checks before dispatch. Hooks may not widen permissions after the original check has passed.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md

Required sequence:
1. evaluate permission/validation on original arguments
2. run arg-touching hook
3. re-run permission/validation on modified arguments
4. dispatch only if the re-check passes

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md

Plugins that declare arg-touching hooks require a higher-trust approval posture (signed or explicitly `/approved` elevated approval) than read-only hooks.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/FinalGUISpec.md

#### 4.1.2 Signed verification for arg-touching hooks

Plugins that declare arg-touching hooks MUST be signed or explicitly approved at a higher trust level than read-only hooks. This is because arg-touching hooks can be used to inject malicious arguments after permission checks.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md


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

Rule: Plugin overrides of permission decisions MUST persist a typed override receipt and expose only its redacted projection. The historical `plugin.permission.override` label is a non-emitting Event Authority candidate; no EventRecord may be produced under that identity unless Event Authority separately admits it.

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

### 6.4 Core-surface /extensibility and host-policy boundaries

Plugin-added subviews/cards/actions (`/cards/actions`) may extend core surfaces, but they MUST NOT replace reserved surface IDs, panel routes, command-family meaning, or deep-link target meaning. Plugin-added navigation into core surfaces must use the canonical context payloads owned by the target surface.

Plugin-added tools, hooks, MCP bridges, and other `/extensibility` capabilities that contact external hosts, registry hosts, or Kubernetes clusters must declare contacted domains/hosts before execution. They inherit `registry_hosts[]`, `k8s_host_policy`, `/network/trust`, proxy, and permission policy checks before dispatch; policy denial uses canonical host-policy blocked reasons and ordered `allowed_action_ids[]`, not plugin-private recovery semantics.

Hooks must not silently rewrite protected routing fields, including remote host/base URL, registry host, kube context, namespace, or receipt identity keys. If a plugin hook changes any protected routing field, the modified invocation is revalidated through the permission engine and may be blocked with canonical `/denied` outcomes.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/UI_Command_Catalog.md

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

### 7.4 Child-run plugin and MCP inheritance

Plugin and MCP effects for child runs are inherited as an effective compatible subset, not as a blind copy of the parent environment.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Models_System.md

Rules:
- child-visible plugin behavior exists only when the child runtime path supports it and the parent effectively allowed it.
- plugin behavior must not function as a backdoor that widens child permissions or tool authority.
- MCP availability follows the same parent-ceiling and compatibility-subset rule.
- requested versus effective dropped capability details should remain visible for debugging.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

A Persona MAY list plugins to disable for runs using that Persona, via the `disabled_plugins` field in the PERSONA.md frontmatter (defined in `Plans/Personas.md` §3.2):

```yaml
disabled_plugins: ["noisy-plugin"]
```

When a Persona is active, any plugin whose `id` appears in `disabled_plugins` is skipped during hook dispatch (not unloaded, just silenced).

ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA

---

## 8. Structured plugin logging

<a id="PLUGIN-LOGGING"></a>

Plugin activity persists through plugin-owned typed receipts/results/errors and redacted projections. No `plugin.*` EventRecord identity is currently admitted by Event Authority, so the historical labels below are non-emitting candidates only.

### 8.1 Historical Event Authority candidates

| Historical candidate identity | Typed receipt/projection condition (non-emitting) |
|-------------------------------|---------------------------------------------------|
| `plugin.loaded` | Plugin successfully initialized. |
| `plugin.load_failed` | Plugin failed to load (invalid manifest, entry error). |
| `plugin.hook.invoked` | A hook was called (includes plugin_id, event name, duration_ms). |
| `plugin.hook.error` | A hook raised an error or timed out. |
| `plugin.hook.blocked` | A hook returned `Block` (includes reason). |
| `plugin.permission.override` | A plugin overrode a permission decision (§4.2). |
| `plugin.tool.registered` | A custom tool was registered (includes tool name, plugin_id). |
| `plugin.tool.collision` | A tool name collision was detected (includes resolution). |

### 8.2 Log format

Current plugin activity records use the typed request/result/error/receipt contracts owned by this document and expose only redacted projections. Plugin producers MUST NOT set the EventRecord `event_type` to any `plugin.*` value above while those identities remain unregistered. If Event Authority later admits one, `Plans/Contracts_V0.md#EventRecord` continues to own the canonical envelope and the admission must close that identity's payload schema, producers, scope, redaction, retention, and consumers rather than inferring authority from this prose.

Legacy/source-lineage tuple notation such as `timestamp`, `plugin_id`, `event_type`, `payload`, and `source: "plugin:<plugin_id>"` is compatibility shorthand for older notes only; it is not normative EventRecord field canon.

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

3. **Plugin detail:** Expanding a row shows: full description, list of hooks subscribed, list of custom tools registered, safe source class, package identity, and redacted relative component labels for entry/data components. It MUST NOT expose private absolute entry or plugin-data paths.

4. **Add plugin:** "Add plugin" button supporting:
   - "Install from package" — enter a package specifier (e.g., `puppet-master-lint-hook@0.1.0`).
   - "Add local" — file picker selecting a package directory containing PM-internal interchange `plugin.json`, PM-native `pm-plugin.json`, or both. A legacy PM-shaped `plugin.json` opens a migration preview and is not accepted as a fresh executable install. External `.codex-plugin/plugin.json` or `.claude-plugin/plugin.json` packages require their named import adapter and are never treated as the PM-internal interchange by filename coincidence.
   Adds to `config.plugins.packages` and triggers reload.

5. **Remove plugin:** Remove button per config-sourced plugin. Project/global plugins show "Delete from disk" with confirmation.

6. **Config overrides:** Collapsible card for `hook_timeout_ms` (spinner, range 1000–30000, default 5000) and `allow_tool_override` (toggle, default off, warning label when enabled).

### 9.2 ELI5/Expert copy

Plugin UI elements follow the app-level Interaction Mode (Expert/ELI5) toggle per `Plans/FinalGUISpec.md` §7.4.0. Tooltip keys: `tooltip.plugins.*` prefix.

- **ELI5:** Simplified view showing only plugin list with enable/disable toggles. Hook details, tool collision config, and timeout settings are hidden.
- **Expert:** Full view with all sections visible.

### 9.3 Catalog-installed plugin and hook lifecycle

Catalog-installed plugins, hooks, and MCP config bundles use explicit lifecycle semantics.

Rules:
- install/update/remove actions must surface whether the target plugin is currently enabled, loaded, or referenced by Persona settings
- active plugin updates may require reload, deferred apply, or explicit disable-before-remove behavior depending on the plugin state
- the GUI must distinguish catalog-installed plugins from manual/local ones
- uninstalling a catalog plugin must not silently delete unrelated local overrides or config-sourced plugins with the same display name

---

## 10. OpenCode baseline and Puppet Master deltas

<a id="BASELINE-DELTAS"></a>

Per `Plans/OpenCode_Deep_Extraction.md` §7G and §9G:

### 10.1 Baseline

OpenCode plugins are JavaScript/TypeScript modules loaded via `import()`. Plugin sources: internal (compiled), built-in npm packages, and config-specified packages/paths. Plugins receive a `PluginInput` with SDK client, project metadata, and Bun shell. The `Hooks` interface defines ~15 named hooks including `tool.execute.before/after`, `permission.ask`, `experimental.session.compacting`, `chat.message`, `chat.params`, `shell.env`, and system/message transforms. Custom tools are registered via the `tool` property; plugin tools override built-ins on name collision.

### 10.2 Puppet Master deltas

1. **Plugin runtime:** OpenCode uses JS `import()` with Bun. Puppet Master uses a platform-agnostic plugin API (WASM modules, subprocess-based, or dynamic libraries — entry format defined by the PM-native `pm-plugin.json` `entry` field). PM-internal interchange `plugin.json` and target-adapter output cannot declare or acquire a PM-native entry. No JavaScript runtime dependency.
2. **Tool collision policy:** OpenCode allows plugin tools to override built-ins by default. Puppet Master defaults to **namespaced aliasing** (built-in wins); override requires explicit opt-in via `allow_tool_override`.
3. **Compaction hook naming and semantics:** OpenCode uses `experimental.session.compacting` as the hook key. Puppet Master canonicalizes this as `session.compacting` (dropping the `experimental.` prefix). For backward compatibility, plugins subscribing to `experimental.session.compacting` are mapped to the canonical `session.compacting` hook at registration time as an alias. Puppet Master additionally formalizes the return semantics with `InjectContext` vs `ReplacePrompt` return types and first-wins conflict resolution for `ReplacePrompt`.
4. **Deterministic load order:** OpenCode deduplicates by function identity. Puppet Master defines strict priority-ordered discovery with lexicographic tiebreaking and documents the order for reproducibility.
5. **Structured logging:** OpenCode plugin errors are logged but not structured. Puppet Master persists typed plugin receipts/results/errors and redacted projections for auditability. The historical `plugin.loaded`, `plugin.hook.invoked`, and related `plugin.*` labels remain non-emitting Event Authority candidates until separately admitted.
6. **Per-Persona overrides:** OpenCode has no per-agent plugin controls. Puppet Master allows Personas to disable specific plugins via `disabled_plugins`.
7. **CLI-backed provider plugin capability evidence:** When the `claude` local binary is used as a CLI-bridged provider, PM records native agents, effort selection, model selection, fallback model support, MCP, plugins, settings injection, and headless JSON/stream-json output as observed provider-protocol capability evidence; plugin support remains capability-scoped and does not imply every provider account can load PM plugins.

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
**AC-PL07:** Plugin hook invocations, errors, blocks, and permission overrides MUST persist typed receipts/results/errors with redacted projections. They MUST NOT emit an EventRecord under a historical `plugin.*` candidate identity until Event Authority separately admits that identity.

<a id="AC-PL08"></a>
**AC-PL08:** Hooks that timeout (default 5s) or panic MUST be treated as `Continue` with a warning logged. The pipeline MUST NOT crash.

<a id="AC-PL09"></a>
**AC-PL09:** The GUI Plugins tab MUST display all discovered plugins with enable/disable toggles, and persist disable state across sessions.

<a id="AC-PL10"></a>
**AC-PL10:** Plugins subscribing to the OpenCode-era hook key `experimental.session.compacting` MUST be treated as subscribers to the canonical `session.compacting` hook. The alias mapping is applied at plugin registration time; no runtime distinction exists between the two keys.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Plugins_System.md#HOOK-EVENTS

---

*Document created for planning only; no code changes.*

## Hook/Block Integration Addendum (2026-03-08)

Plugin hooks must reconcile with the runtime scheduler packet's blocked/failure model.

Required behavior:
- `plugin.hook.blocked` outcomes must map into explicit blocked-state handling rather than disappearing as generic plugin warnings
- hook-driven blocking must not silently bypass scheduler observability, retry classification, or recovery-option rendering
- if a plugin modifies prompt or tool behavior in a way that causes remediation/retry, the canonical runtime lineage still belongs to the shared scheduler/remediation contract, not to plugin-private state

Acceptance criteria:
- plugin-driven blocks are visible as first-class blocked outcomes when they affect execution
- plugin hooks do not become a side-channel that bypasses queue analysis or remediation observability
## Plugin Block Runtime Canonical Alignment (2026-03-09)

Plugin-driven blocking must map into the canonical runtime blocked model.

Rules:
- `plugin.hook.blocked` that affects execution maps to `blocked_reason_code = plugin_hook_blocked`
- the runtime-facing blocked path MUST expose `allowed_action_ids[]`, guard metadata, and preserved-local-work state when relevant
- plugin hooks MUST NOT invent plugin-private retry or recovery semantics that bypass scheduler observability or canonical taxonomy
## Plugin Block Runtime Taxonomy Consolidation Addendum (2026-03-09)

Plugin-driven blocking that affects execution MUST map into the canonical runtime blocked model.

### Required rules
- `plugin.hook.blocked` that stops execution maps to `blocked_reason_code = plugin_hook_blocked`
- runtime-facing plugin-blocked payloads MUST expose canonical `allowed_action_ids[]`, prerequisite metadata, and `preserved_local_work` when relevant
- plugin hooks MUST NOT invent plugin-private retry or recovery semantics that bypass scheduler observability or canonical taxonomy

## Plugin Hook Blocked Specification Addendum

This section defines plugin Hook Blocked Specification.

### Hooks that may block execution
Only execution-flow hooks may trigger `plugin_hook_blocked`:
- `pre_tool_invoke`
- `pre_attempt_start`
- `pre_node_dispatch`

Observation-only hooks such as `post_tool_invoke` and `post_attempt_complete` cannot create `plugin_hook_blocked`.

### Required metadata
Plugin-blocked payloads MUST include:
- `blocked_reason_code: plugin_hook_blocked`
- `plugin_id`
- `hook_name`
- `block_reason`
- canonical `allowed_action_ids[]`
- `preserved_local_work`

### Recovery scope
Plugins MUST NOT invent plugin-private runtime recovery semantics. They reuse canonical action families and runtime commands.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Plugins_System.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### PLUG-002 - Scope And SSOT Authority

```yaml
plan_unit_id: PLUG-002
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugins_System is the single canonical source of truth for plugin discovery, loading, hook lifecycle, custom tool registration, and structured logging; other plan documents must anchor-link here rather than restating plugin definitions, hook signatures, or load-order rules."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "PLUG-002 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: canonical_owner_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0002
preserved_exact_tokens:
- "Plugins System (Canonical SSOT)"
- "single canonical source of truth"
- "discovery"
- "loading"
- "hook lifecycle"
- "custom tool registration"
- "structured logging"
- "Plans/Plugins_System.md#HOOK-EVENTS"
- "Puppet Master"
negative_constraints:
- "Other plan documents MUST reference Plugins_System anchors rather than restating plugin definitions, hook signatures, or load-order rules."
preserved_contractrefs:
- "ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/DRY_Rules.md"
- "Plans/Contracts_V0.md"
- "Plans/Decision_Policy.md"
```

### PLUG-003 - SSOT Reference Map

```yaml
plan_unit_id: PLUG-003
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "The Plugins SSOT reference map preserves the governing references for locked decisions, contracts, DRY, glossary terms, deterministic ambiguity handling, tools, permissions, personas, OpenCode baseline plugins, formatters, models, and GUI specification."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-002
unblocks: []
acceptance_criteria:
- "PLUG-003 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: owner_reference_map
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0003
preserved_exact_tokens:
- "SSOT references (DRY)"
- "Plans/Spec_Lock.json"
- "Plans/Contracts_V0.md"
- "Plans/DRY_Rules.md"
- "Plans/Glossary.md"
- "Plans/Decision_Policy.md"
- "Plans/auto_decisions.jsonl"
- "Plans/Tools.md"
- "Plans/Permissions_System.md"
- "Plans/Personas.md"
- "Plans/OpenCode_Deep_Extraction.md"
- "Plans/Formatters_System.md"
- "Plans/Models_System.md"
- "Plans/FinalGUISpec.md"
negative_constraints:
- "The reference map must not be read as plugin behavior that supersedes the owner sections."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/Tools.md"
- "Plans/Permissions_System.md"
```

### PLUG-004 - Persona And Model Terminology Routing

```yaml
plan_unit_id: PLUG-004
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin-owned Persona and model references route through Glossary, plans index, Personas, and Models owner docs rather than defining duplicate terminology."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-002
- PLUG-003
unblocks: []
acceptance_criteria:
- "PLUG-004 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: terminology_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0004
preserved_exact_tokens:
- "P5 plugin boundary recovery"
- "Plans/Glossary.md"
- "/Glossary.md"
- "Plans/00-plans-index.md"
- "/00-plans-index.md"
- "Plans/Personas.md"
- "/Personas.md"
- "Plans/Models_System.md"
- "/Models_System.md"
negative_constraints:
- "Plugins must not define duplicate Persona or model terminology."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Glossary.md"
- "Plans/Personas.md"
- "Plans/Models_System.md"
```

### PLUG-005 - Plugin UI Runtime Metadata Routing

```yaml
plan_unit_id: PLUG-005
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin UI and runtime references use canonical Persona and model metadata owners when presenting plugin-facing Persona or model metadata."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-004
unblocks: []
acceptance_criteria:
- "PLUG-005 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_metadata_ui_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0004
preserved_exact_tokens:
- "Plugin UI"
- "runtime references"
- "plugin-facing Persona"
- "model metadata"
- "Plans/FinalGUISpec.md"
- "/FinalGUISpec.md"
negative_constraints:
- "Plugin UI must not present plugin-facing Persona or model metadata from duplicate plugin-private terminology."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/Personas.md"
- "Plans/Models_System.md"
```

### PLUG-006 - Central Policy And Hook Boundary Recovery

```yaml
plan_unit_id: PLUG-006
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Tooling enforcement boundaries are central policy rather than plugin-private behavior, and hook integration points for package, seam, corroboration, and concern remain subject to the plugin lifecycle and permission model."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-002
unblocks: []
acceptance_criteria:
- "PLUG-006 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: policy_boundary_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0004
preserved_exact_tokens:
- "Tooling enforcement boundaries"
- "central policy"
- "Formatters_System"
- "Plugins_System"
- "Skills_System"
- "LSPSupport.md"
- "/policy"
- "/runtime"
- "/DAE"
- "DAE"
- "HTE"
- "read-only"
- "mutation-capable"
- "env-var"
- "bundling-off"
- "internal-service"
- "multi-project-tab"
- "/seam/corroboration/concern"
negative_constraints:
- "Tooling enforcement boundaries must not become plugin-private behavior."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Formatters_System.md"
- "Plans/Skills_System.md"
- "Plans/LSPSupport.md"
- "Plans/Executor_Protocol.md"
- "Plans/Permissions_System.md"
```

### PLUG-007 - Plugin And Hook Definitions

```yaml
plan_unit_id: PLUG-007
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugins are self-contained extension modules loaded for a session, and Hooks are named callbacks for lifecycle events that receive typed context and return continue, modify, or block results in deterministic order."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-002
unblocks: []
acceptance_criteria:
- "PLUG-007 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: definition_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0007
preserved_exact_tokens:
- "DEF-PLUGIN"
- "DEF-HOOK"
- "Plugin"
- "Hook"
- "self-contained extension module"
- "loaded once at session start"
- "deterministic order"
- "typed context object"
- "continue, modify, or block"
negative_constraints:
- "Plugin and Hook definitions must not be restated divergently outside Plugins_System."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Tools.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Glossary.md"
- "Plans/Tools.md"
```

### PLUG-008 - Discovery Source Priority

```yaml
plan_unit_id: PLUG-008
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin discovery walks internal plugins, project-local plugins, global plugins, and config package list entries in strict priority order."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-002
unblocks: []
acceptance_criteria:
- "PLUG-008 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: discovery_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0009
preserved_exact_tokens:
- "DISCOVERY"
- "Discovery paths"
- "Internal plugins"
- "Project-local"
- ".puppet-master/plugins/<plugin_id>/"
- "Global"
- "~/.config/puppet-master/plugins/<plugin_id>/"
- "Config package list"
- "config.plugins[]"
- "file://"
negative_constraints:
- "Plugin discovery priority must remain deterministic and must not be reordered by consumers."
preserved_contractrefs:
- "ContractRef: PolicyRule:Decision_Policy.md§2"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Decision_Policy.md"
```

### PLUG-009 - Plugin Manifest Identity And Native Fields

```yaml
plan_unit_id: PLUG-009
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "PM-internal interchange plugin.json is limited to the skills/ plus mcp.json interchange floor and is not directly loadable OpenAI/Codex or Claude Code packaging, while each PM-native plugin uses pm-plugin.json for id, name, version, description, hooks, tools, and entry; dual PM manifests validate independently with exact id/version agreement and no field merge, target adapters emit ecosystem-specific metadata plus .mcp.json without authority widening, and legacy PM-shaped plugin.json is migration input only."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-008
unblocks: []
acceptance_criteria:
- "PLUG-009 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
- "PM-native hooks, tools, and entry fields validate only from pm-plugin.json; PM-internal interchange plugin.json and target-adapter output cannot request PM-native execution or authority."
- "A dual-manifest package requires exact id/version agreement without field merge, and a legacy PM-shaped plugin.json remains explicit migration input rather than interchange canon."
- "Direct OpenAI/Codex and Claude Code package claims require named adapters, target schemas, target conformance, separate source/output hashes and inventories, and no authority widening."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: manifest_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0010
preserved_exact_tokens:
- "plugin.json"
- "pm-plugin.json"
- "skills/"
- "mcp.json"
- "id"
- "name"
- "version"
- "description"
- "hooks"
- "tools"
- "entry"
- "^[a-z][a-z0-9-]{1,48}[a-z0-9]$"
- "MUST match directory name"
- "WASM module"
- "script"
- "subprocess binary"
negative_constraints:
- "A PM-native plugin directory without a valid pm-plugin.json must not be freshly loaded as a PM-native executable plugin."
- "PM-internal interchange plugin.json must not carry canonical PM-native hooks, tools, commands, UI, native entry, permissions, capabilities, sandbox, or signature fields or claim direct external loadability."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Plugins_System.md#DISCOVERY"
compatibility_only_notes:
- "The preserved legacy plugin.json hooks/tools/entry shape is source lineage and legacy_imported migration input only; it is not the internal-interchange schema."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-010 - Discovery Deduplication

```yaml
plan_unit_id: PLUG-010
unit_type: decision
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "When the same plugin id appears in multiple discovery sources, the first-discovered instance wins by priority order and later duplicates are skipped with a warning."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-008
unblocks: []
acceptance_criteria:
- "PLUG-010 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: deduplication_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0011
preserved_exact_tokens:
- "Deduplication"
- "same id"
- "first-discovered instance wins"
- "Later duplicates are skipped"
- "warning"
negative_constraints:
- "Later duplicates must not override an earlier plugin id discovered by priority order."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-011 - No Auto-Load Executable Code

```yaml
plan_unit_id: PLUG-011
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Puppet Master must not auto-load executable plugin code from config without explicit user approval; config-only discovery does not imply execution approval."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-008
unblocks: []
acceptance_criteria:
- "PLUG-011 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: execution_approval_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0013
preserved_exact_tokens:
- "Load order and execution model"
- "Auto-load prohibition"
- "PM MUST NOT auto-load executable plugin code"
- "explicit user approval"
- "plugin no-auto-load executable-code rule"
- "config-only discovery does not imply execution approval"
negative_constraints:
- "PM MUST NOT auto-load executable plugin code from config without explicit user approval."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Permissions_System.md"
- "Plans/Architecture_Invariants.md"
```

### PLUG-012 - First-Time Plugin Approval Surface

```yaml
plan_unit_id: PLUG-012
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "First-time plugin load shows source, declared hooks, requested capabilities, and trust implications, and approval is version/hash-sensitive so source change requires new approval."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-011
unblocks: []
acceptance_criteria:
- "PLUG-012 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: user_approval_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0013
preserved_exact_tokens:
- "first-time plugin load"
- "source"
- "declared hooks"
- "requested capabilities"
- "trust implications"
- "version/hash-sensitive"
- "source change requires new approval"
negative_constraints:
- "Plugin approval must not be reused across source changes without a new version/hash-sensitive approval."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/storage-plan.md"
```

### PLUG-013 - Deterministic Load Order

```yaml
plan_unit_id: PLUG-013
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugins load in strict discovery-priority order and lexicographic id order within a source, producing identical load order across runs for the same plugin set."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-008
unblocks: []
acceptance_criteria:
- "PLUG-013 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: deterministic_load_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0014
preserved_exact_tokens:
- "Deterministic load order"
- "strict priority order"
- "lexicographic order by id"
- "same set of plugins"
- "identical across runs"
negative_constraints:
- "Given the same set of plugins on disk and in config, load order must not vary across runs."
preserved_contractrefs:
- "ContractRef: PolicyRule:Decision_Policy.md§3"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Decision_Policy.md"
```

### PLUG-014 - Plugin Lifecycle

```yaml
plan_unit_id: PLUG-014
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "The plugin lifecycle discovers PM-internal interchange plugin.json and PM-native pm-plugin.json independently, rejects dual-manifest id/version mismatch, classifies legacy PM-shaped plugin.json as migration input, keeps external target adaptation separate, initializes only an approved PM-native entry with PluginContext, keeps hooks active during the session, and tears down on session.end before unloading."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-009
- PLUG-013
unblocks: []
acceptance_criteria:
- "PLUG-014 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
- "Interchange-only skill/MCP packages remain with their internal import owners and never enter PM-native entry initialization; target-adapter output also grants no PM-native activation."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0015
preserved_exact_tokens:
- "Plugin lifecycle"
- "Discover"
- "Validate"
- "Initialize"
- "Active"
- "Teardown"
- "session.end"
- "PluginContext"
- "plugin.json"
- "pm-plugin.json"
negative_constraints:
- "Invalid manifests are rejected with a warning and skipped rather than initialized."
- "An interchange-only, target-adapted, or fresh legacy-shaped plugin.json must not be initialized as PM-native executable code."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-015 - Hook Execution Order

```yaml
plan_unit_id: PLUG-015
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Hook execution order is deterministic: hooks execute in plugin load order, and multiple handlers for the same event within one plugin execute in registration order."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-013
- PLUG-014
unblocks: []
acceptance_criteria:
- "PLUG-015 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: hook_ordering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0016
preserved_exact_tokens:
- "HOOK-EXECUTION-ORDER"
- "plugin load order"
- "registration order"
- "Internal plugins execute first"
- "project-local"
- "global"
- "config-sourced"
- "Plans/Plugins_System.md#LOAD-ORDER"
negative_constraints:
- "Hook execution order must not vary when plugin load order and registration order are the same."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Plugins_System.md#LOAD-ORDER"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-016 - PluginContext Sole API

```yaml
plan_unit_id: PLUG-016
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugins initialize with PluginContext as the sole API surface for project root, global config, plugin data directory, hook registration, tool registration, and structured logging, and must not access Puppet Master internals outside it."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-014
unblocks: []
acceptance_criteria:
- "PLUG-016 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_context_api
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0017
preserved_exact_tokens:
- "PLUGIN-CONTEXT"
- "PluginContext"
- "project_root"
- "global_config_dir"
- "plugin_data_dir"
- "register_hook"
- "register_tool"
- "log"
- "sole API surface"
- "MUST NOT access Puppet Master internals"
negative_constraints:
- "Plugins MUST NOT access Puppet Master internals outside PluginContext."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/OpenCode_Deep_Extraction.md"
```

### PLUG-017 - Hook Event Registry Rule

```yaml
plan_unit_id: PLUG-017
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Every hook event is defined in the Plugins System hook-event registry with input shape and allowed return actions; adding a new event requires updating this document."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-016
unblocks: []
acceptance_criteria:
- "PLUG-017 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: hook_registry_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0018
preserved_exact_tokens:
- "HOOK-EVENTS"
- "Hook events"
- "input shape"
- "allowed return actions"
- "Every hook event MUST be listed"
- "New events require an update to this document"
negative_constraints:
- "New hook events must not be introduced without updating Plugins_System."
preserved_contractrefs:
- "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Tools.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
- "Plans/Decision_Policy.md"
```

### PLUG-018 - Tool Execution Hook Group

```yaml
plan_unit_id: PLUG-018
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "The tool execution hook family boundary groups the before-tool and after-tool hook signatures under the canonical hook event registry."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-017
unblocks: []
acceptance_criteria:
- "PLUG-018 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: hook_group_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0019
preserved_exact_tokens:
- "Tool execution hooks"
- "4.1 Tool execution hooks"
- "tool.execute.before"
- "tool.execute.after"
negative_constraints:
- "Tool execution hook signatures must remain within the registered hook-event family."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-019 - Hook Re-Check Invariant

```yaml
plan_unit_id: PLUG-019
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "If a plugin hook modifies tool arguments, the modified arguments must be re-run through permission and validation checks before dispatch, and hooks may not widen permissions after the original check passed."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-018
unblocks: []
acceptance_criteria:
- "PLUG-019 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: permission_recheck_invariant
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0020
preserved_exact_tokens:
- "Hook re-check invariant"
- "modified arguments"
- "permission and validation checks"
- "before dispatch"
- "Hooks may not widen permissions"
- "evaluate permission/validation on original arguments"
- "re-run permission/validation"
- "dispatch only if the re-check passes"
negative_constraints:
- "Hooks may not widen permissions after the original check has passed."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Permissions_System.md"
- "Plans/Architecture_Invariants.md"
- "Plans/Tools.md"
- "Plans/Executor_Protocol.md"
```

### PLUG-020 - Arg-Touching Hook Trust Approval

```yaml
plan_unit_id: PLUG-020
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugins that declare arg-touching hooks require signed verification or explicitly /approved elevated approval at a higher trust posture than read-only hooks because they can inject malicious arguments after permission checks."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-019
unblocks: []
acceptance_criteria:
- "PLUG-020 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: trust_approval_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0021
preserved_exact_tokens:
- "arg-touching hooks"
- "higher-trust approval posture"
- "signed"
- "explicitly `/approved`"
- "higher trust level than read-only hooks"
- "malicious arguments after permission checks"
negative_constraints:
- "Arg-touching hooks must not run with only read-only-hook trust posture."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/FinalGUISpec.md"
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Permissions_System.md"
- "Plans/Architecture_Invariants.md"
- "Plans/FinalGUISpec.md"
```

### PLUG-021 - Tool Execute Before Signature

```yaml
plan_unit_id: PLUG-021
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "tool.execute.before fires before a tool invocation after permission check passes, receives tool_name, args, and invocation_id, and returns Continue, Continue(modified_args), or Block(reason)."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-019
- PLUG-020
unblocks: []
acceptance_criteria:
- "PLUG-021 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: hook_signature_tool_execute_before
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0022
preserved_exact_tokens:
- "tool.execute.before"
- "Before a tool invocation is executed"
- "tool_name"
- "args"
- "invocation_id"
- "Continue"
- "Continue(modified_args)"
- "Block(reason)"
negative_constraints:
- "tool.execute.before return actions must stay within the registered signature."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-022 - Tool Execute After Signature

```yaml
plan_unit_id: PLUG-022
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "tool.execute.after fires after tool completion, receives tool_name, args, result, invocation_id, and duration_ms, and returns Continue or Continue(modified_result)."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-017
unblocks: []
acceptance_criteria:
- "PLUG-022 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: hook_signature_tool_execute_after
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0023
preserved_exact_tokens:
- "tool.execute.after"
- "After a tool invocation completes"
- "success or error"
- "ToolResult"
- "duration_ms"
- "Continue(modified_result)"
- "EventRecord"
negative_constraints:
- "tool.execute.after must not block a completed invocation through an unregistered return action."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md#EventRecord"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
- "Plans/Contracts_V0.md"
```

### PLUG-023 - Permission Ask Hook

```yaml
plan_unit_id: PLUG-023
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "permission.ask fires when the permission engine resolves a tool invocation to ask before presenting UI, can Continue to present ask UI, Allow, or Deny(reason), and plugin permission overrides persist typed override receipts with redacted projections; plugin.permission.override remains a non-emitting Event Authority candidate."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-017
unblocks: []
acceptance_criteria:
- "PLUG-023 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: permission_hook_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0025
preserved_exact_tokens:
- "HOOK-PERMISSION"
- "permission.ask"
- "ask"
- "before presenting to user"
- "Continue"
- "Allow"
- "Deny(reason)"
- "plugin.permission.override"
negative_constraints:
- "Plugin overrides must not emit plugin.permission.override EventRecords unless Event Authority separately admits that identity."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md#ASK-FLOW"
compatibility_only_notes:
- "The preserved source-lineage claim that overrides are logged as plugin.permission.override events is non-current; typed receipts and redacted projections are current until Event Authority admission."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Permissions_System.md"
```

### PLUG-024 - Session Hooks

```yaml
plan_unit_id: PLUG-024
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "session.start fires after plugin initialization before the first user message, and session.end fires before plugin teardown after the last interaction; both return Continue only."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-014
- PLUG-017
unblocks: []
acceptance_criteria:
- "PLUG-024 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: session_hook_signature
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0026
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0028
preserved_exact_tokens:
- "HOOK-SESSION"
- "session.start"
- "session.end"
- "session_id"
- "project_root"
- "summary"
- "Continue only"
- "Before plugin teardown"
negative_constraints:
- "Session hooks must not return non-Continue actions."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-025 - Message Hooks

```yaml
plan_unit_id: PLUG-025
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "chat.message fires before prompt assembly with message_text and session_id, and chat.params fires before provider send with temperature, top_p, max_tokens, and model; both may Continue with modified payloads."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-017
unblocks: []
acceptance_criteria:
- "PLUG-025 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: message_hook_signature
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0029
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0030
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0031
preserved_exact_tokens:
- "HOOK-MESSAGE"
- "chat.message"
- "message_text"
- "prompt assembly"
- "chat.params"
- "temperature"
- "top_p"
- "max_tokens"
- "model"
- "Continue(modified_text)"
- "Continue(modified_params)"
negative_constraints:
- "Message hooks must not use unregistered return actions."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-026 - Compaction Hook Semantics

```yaml
plan_unit_id: PLUG-026
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "session.compacting fires when auto-compaction is triggered and may Continue, InjectContext, or ReplacePrompt; only one plugin may ReplacePrompt, with first-by-load-order winning and later replacements downgraded to InjectContext with a warning."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-015
- PLUG-017
unblocks: []
acceptance_criteria:
- "PLUG-026 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: compaction_hook_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0032
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0033
preserved_exact_tokens:
- "HOOK-COMPACTION"
- "session.compacting"
- "current_context"
- "compaction_prompt"
- "InjectContext"
- "ReplacePrompt"
- "Only one plugin MAY return ReplacePrompt"
- "first by load order"
- "downgraded to InjectContext"
- "warning logged"
negative_constraints:
- "Only one plugin may return ReplacePrompt per compaction event."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Plugins_System.md#HOOK-EXECUTION-ORDER"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-027 - Shell Environment Hook

```yaml
plan_unit_id: PLUG-027
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "shell.env fires before a bash or shell tool invocation after environment assembly and can Continue or Continue(modified_env)."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-017
unblocks: []
acceptance_criteria:
- "PLUG-027 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: shell_env_hook_signature
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0034
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0035
preserved_exact_tokens:
- "Shell environment hook"
- "shell.env"
- "bash/shell tool invocation"
- "env: HashMap<String, String>"
- "Continue(modified_env)"
negative_constraints:
- "shell.env must not use unregistered return actions."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-028 - System Prompt Transform Hook

```yaml
plan_unit_id: PLUG-028
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "system.prompt.transform fires after system prompt assembly and before provider send, receives system_parts, and can Continue or Continue(modified_parts)."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-017
unblocks: []
acceptance_criteria:
- "PLUG-028 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: system_prompt_hook_signature
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0036
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0037
preserved_exact_tokens:
- "System prompt hook"
- "system.prompt.transform"
- "system_parts"
- "after the system prompt is assembled"
- "before sending to the provider"
- "Continue(modified_parts)"
negative_constraints:
- "system.prompt.transform must not use unregistered return actions."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-029 - Hook Return Semantics

```yaml
plan_unit_id: PLUG-029
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Hook return semantics canonicalize Continue, Continue(modified), Block(reason), Allow, Deny(reason), InjectContext(items), and ReplacePrompt(prompt); unhandled error, panic, or timeout is treated as Continue with a warning, defaulting to 5 seconds unless configured."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-017
unblocks: []
acceptance_criteria:
- "PLUG-029 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: hook_return_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0038
preserved_exact_tokens:
- "HOOK-RETURNS"
- "Continue"
- "Continue(modified)"
- "Block(reason)"
- "Allow"
- "Deny(reason)"
- "InjectContext(items)"
- "ReplacePrompt(prompt)"
- "panic"
- "timeout"
- "config.plugins.hook_timeout_ms"
- "5000"
negative_constraints:
- "Unhandled hook errors must not crash or silently alter the pipeline; they are treated as Continue with warning."
preserved_contractrefs:
- "ContractRef: PolicyRule:Decision_Policy.md§2"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Decision_Policy.md"
```

### PLUG-030 - Custom Tool Registration Shape

```yaml
plan_unit_id: PLUG-030
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugins may register custom tools through PluginContext.register_tool with ToolDefinition name, description, input_schema JSON Schema, and execute handler returning ToolResult."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-016
unblocks: []
acceptance_criteria:
- "PLUG-030 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: custom_tool_registration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0039
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0040
preserved_exact_tokens:
- "CUSTOM-TOOLS"
- "Custom tool registration"
- "PluginContext.register_tool(tool_def)"
- "ToolDefinition"
- "name"
- "description"
- "input_schema"
- "JSON Schema"
- "execute"
- "ToolResult"
negative_constraints:
- "Custom tools must use the PluginContext registration API rather than private registry mutation."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
```

### PLUG-031 - Tool Collision Behavior

```yaml
plan_unit_id: PLUG-031
unit_type: decision
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "When a plugin registers a tool colliding with a built-in tool, the built-in tool wins by default and the plugin tool is registered under a namespaced alias unless config.plugins.allow_tool_override is true."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-030
- PLUG-013
unblocks: []
acceptance_criteria:
- "PLUG-031 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: tool_collision_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0041
preserved_exact_tokens:
- "TOOL-COLLISION"
- "built-in tool takes precedence"
- "namespaced alias"
- "<plugin_id>.<tool_name>"
- "config.plugins.allow_tool_override"
- "default false"
negative_constraints:
- "Plugin tools must not override built-in tools unless allow_tool_override is explicitly true."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
```

### PLUG-032 - Central Registry Routing

```yaml
plan_unit_id: PLUG-032
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin-registered tools are added to the central tool registry and subject to the same permission policy engine, with unknown tools defaulting to ask permission."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-030
unblocks: []
acceptance_criteria:
- "PLUG-032 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: tool_registry_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0042
preserved_exact_tokens:
- "Central registry routing"
- "central tool registry"
- "Plans/Tools.md"
- "same permission policy engine"
- "Plans/Permissions_System.md"
- "Unknown tools default to ask"
negative_constraints:
- "Plugin-registered tools must not bypass the central tool registry or permission policy engine."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md#DEFAULTS"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
- "Plans/Permissions_System.md"
```

### PLUG-033 - Core-Surface Extensibility Boundary

```yaml
plan_unit_id: PLUG-033
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin-added subviews, cards, and actions may extend core surfaces but must not replace reserved surface IDs, panel routes, command-family meaning, or deep-link target meaning, and navigation into core surfaces must use target-surface canonical context payloads."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-032
unblocks: []
acceptance_criteria:
- "PLUG-033 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: core_surface_extensibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0043
preserved_exact_tokens:
- "/cards/actions"
- "core surfaces"
- "reserved surface IDs"
- "panel routes"
- "command-family meaning"
- "deep-link target meaning"
- "canonical context payloads"
negative_constraints:
- "Plugin-added subviews/cards/actions MUST NOT replace reserved surface IDs, panel routes, command-family meaning, or deep-link target meaning."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/UI_Command_Catalog.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/UI_Command_Catalog.md"
- "Plans/FinalGUISpec.md"
```

### PLUG-034 - Extensibility Host Policy Inheritance

```yaml
plan_unit_id: PLUG-034
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin-added tools, hooks, MCP bridges, and other /extensibility capabilities that contact external hosts, registry hosts, or Kubernetes clusters must declare contacted domains and hosts and inherit registry_hosts[], k8s_host_policy, /network/trust, proxy, and permission policy checks."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-032
unblocks: []
acceptance_criteria:
- "PLUG-034 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: host_policy_inheritance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0043
preserved_exact_tokens:
- "/extensibility"
- "external hosts"
- "registry hosts"
- "Kubernetes clusters"
- "declare contacted domains/hosts"
- "registry_hosts[]"
- "k8s_host_policy"
- "/network/trust"
- "proxy"
- "host-policy blocked reasons"
- "ordered allowed_action_ids[]"
negative_constraints:
- "Host policy denial must use canonical host-policy blocked reasons and ordered allowed_action_ids[], not plugin-private recovery semantics."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/UI_Command_Catalog.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PLUG-035 - Protected Routing Revalidation

```yaml
plan_unit_id: PLUG-035
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Hooks must not silently rewrite protected routing fields, including remote host, base URL, registry host, kube context, namespace, and receipt identity keys; protected-field changes trigger permission revalidation and may be blocked with canonical /denied outcomes."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-019
- PLUG-034
unblocks: []
acceptance_criteria:
- "PLUG-035 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: protected_routing_revalidation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0043
preserved_exact_tokens:
- "protected routing fields"
- "remote host/base URL"
- "registry host"
- "kube context"
- "namespace"
- "receipt identity keys"
- "revalidated through the permission engine"
- "canonical /denied outcomes"
negative_constraints:
- "Hooks must not silently rewrite protected routing fields."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/UI_Command_Catalog.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Permissions_System.md"
- "Plans/Containers_Registry_and_Unraid.md"
```

### PLUG-036 - Plugin Configuration Section Boundary

```yaml
plan_unit_id: PLUG-036
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "The Plugin configuration section boundary preserves the PLUGIN-CONFIG anchor and marks that concrete configuration schema behavior begins after the first batch window."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-002
unblocks: []
acceptance_criteria:
- "PLUG-036 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_209
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: section_anchor_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0044
preserved_exact_tokens:
- "PLUGIN-CONFIG"
- "Plugin configuration"
- "7. Plugin configuration"
- "config shape"
- "Config body begins after this batch"
negative_constraints:
- "The Plugin configuration section boundary must not be treated as complete configuration behavior without the following config-shape spans."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
```

### PLUG-037 - Config Shape

```yaml
plan_unit_id: PLUG-037
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin configuration schema preserves TOML [plugins] fields for hook_timeout_ms, allow_tool_override, config-sourced packages, and per-plugin disabled state."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-036
- PLUG-008
- PLUG-029
- PLUG-031
unblocks: []
acceptance_criteria:
- "PLUG-037 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_config_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0045
preserved_exact_tokens:
- "7.1 Config shape"
- "[plugins]"
- "hook_timeout_ms = 5000"
- "allow_tool_override = false"
- "packages"
- "puppet-master-lint-hook@0.1.0"
- "file:///home/user/my-local-plugin"
- "[plugins.disabled]"
- "noisy-plugin"
negative_constraints:
- "Config schema fields must not imply executable plugin load approval without the no-auto-load gate."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Tools.md"
- "Plans/Permissions_System.md"
```

### PLUG-038 - Plugin Disable Persistence

```yaml
plan_unit_id: PLUG-038
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Individual plugins can be disabled by config.plugins.disabled.<plugin_id> = true, causing disabled plugins not to load and preserving that disable state across sessions."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-037
- PLUG-014
unblocks: []
acceptance_criteria:
- "PLUG-038 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_disable_config
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0046
preserved_exact_tokens:
- "7.2 Enable/disable"
- "config.plugins.disabled.<plugin_id> = true"
- "Disabled plugins are not loaded"
- "persists across sessions"
negative_constraints:
- "Disabled plugins must not be loaded while the persisted disabled config remains true."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/storage-plan.md"
```

### PLUG-039 - Child-Run Plugin And MCP Compatibility Ceiling

```yaml
plan_unit_id: PLUG-039
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Child runs inherit plugin and MCP effects only as an effective compatible subset, never as a blind copy of the parent environment or a backdoor that widens child permissions or tool authority; requested versus effective dropped capability details remain visible for debugging."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-032
- PLUG-034
- PLUG-035
unblocks: []
acceptance_criteria:
- "PLUG-039 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: child_run_compatible_subset
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0048
preserved_exact_tokens:
- "7.4 Child-run plugin and MCP inheritance"
- "effective compatible subset"
- "blind copy"
- "parent environment"
- "child-visible plugin behavior"
- "child runtime path"
- "parent effectively allowed it"
- "backdoor"
- "widens child permissions"
- "tool authority"
- "MCP availability"
- "parent-ceiling"
- "compatibility-subset"
- "requested versus effective dropped capability details"
negative_constraints:
- "Plugin behavior must not function as a backdoor that widens child permissions or tool authority."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Models_System.md"
- "ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes:
- "MCP availability follows the same parent-ceiling and compatibility-subset rule."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Permissions_System.md"
- "Plans/Tools.md"
- "Plans/Models_System.md"
- "Plans/Skills_System.md"
```

### PLUG-040 - Per-Persona Plugin Disable Overrides

```yaml
plan_unit_id: PLUG-040
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Persona plugin overrides use the disabled_plugins field in PERSONA.md frontmatter, and when a Persona is active, matching plugin ids are skipped during hook dispatch without unloading the plugin."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-038
- PLUG-015
unblocks: []
acceptance_criteria:
- "PLUG-040 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: persona_plugin_disable_override
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0047
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0048
preserved_exact_tokens:
- "7.3 Per-Persona plugin overrides"
- "disabled_plugins"
- "PERSONA.md frontmatter"
- "disabled_plugins: [\"noisy-plugin\"]"
- "skipped during hook dispatch"
- "not unloaded"
- "just silenced"
negative_constraints:
- "Persona-level plugin disabling must not unload plugins or widen permissions."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Personas.md"
```

### PLUG-041 - Plugin Activity Record Shape And Event Authority Boundary

```yaml
plan_unit_id: PLUG-041
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin activity persists through plugin-owned typed request/result/error/receipt records and redacted projections; no plugin.* EventRecord identity is currently admitted, and any future Event Authority admission must use the canonical EventRecord envelope owned by Contracts_V0 with closed payload, producer, scope, redaction, retention, and consumer contracts."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-016
unblocks: []
acceptance_criteria:
- "PLUG-041 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_event_log_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0049
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0051
preserved_exact_tokens:
- "PLUGIN-LOGGING"
- "Structured plugin logging"
- "Puppet Master event ledger"
- "Plans/Contracts_V0.md#EventRecord"
- "plugin_id"
- "event_type"
- "payload"
- "structured JSON"
- "PluginContext.log(level, message)"
- "source: \"plugin:<plugin_id>\""
negative_constraints:
- "Plugin producers must not emit EventRecords under historical plugin.* candidate identities until Event Authority separately admits them."
- "Plugins_System.md must not locally redefine the EventRecord envelope fields."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord"
compatibility_only_notes:
- "Legacy timestamp/plugin_id/event_type/payload/source tuple notation is source-lineage shorthand only and not normative EventRecord field canon."
- "The preserved Puppet Master event ledger and event_type literals describe historical source lineage, not current emission authority."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Contracts_V0.md"
```

### PLUG-042 - Historical Plugin Log Event Candidates

```yaml
plan_unit_id: PLUG-042
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "The historical plugin log taxonomy preserves loaded, load_failed, hook invoked, hook error, hook blocked, permission override, tool registered, and tool collision identities as individual non-emitting Event Authority candidates; current occurrences persist through typed receipts/results/errors and redacted projections."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-041
unblocks: []
acceptance_criteria:
- "PLUG-042 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_event_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0050
preserved_exact_tokens:
- "8.1 Event types"
- "plugin.loaded"
- "plugin.load_failed"
- "plugin.hook.invoked"
- "plugin.hook.error"
- "plugin.hook.blocked"
- "plugin.permission.override"
- "plugin.tool.registered"
- "plugin.tool.collision"
- "duration_ms"
- "resolution"
negative_constraints:
- "Historical plugin.* candidate identities must not emit EventRecords until Event Authority separately admits each identity."
preserved_contractrefs: []
compatibility_only_notes:
- "The preserved event-type names and required emission-condition wording are source lineage only; the current disposition is non-emitting typed receipts/projections pending Event Authority."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Contracts_V0.md"
```

### PLUG-043 - Plugins Settings Screen Placement

```yaml
plan_unit_id: PLUG-043
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "The Plugins settings screen is a tab in the unified Settings page and is governed by the GUI plugins anchor and FinalGUISpec/DRY references."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-003
- PLUG-005
unblocks: []
acceptance_criteria:
- "PLUG-043 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: settings_plugins_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0052
preserved_exact_tokens:
- "GUI-PLUGINS"
- "9. GUI requirements"
- "Plugins settings screen"
- "tab"
- "unified Settings page"
- "Plans/FinalGUISpec.md §7.4"
negative_constraints:
- "Plugins GUI requirements must not fork the unified Settings page ownership."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/DRY_Rules.md"
```

### PLUG-044 - Plugins Inventory Toggle And Detail Controls

```yaml
plan_unit_id: PLUG-044
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "The Plugins tab lists discovered plugins with Name, ID, Version, Source, Status, Hook count, and Tool count columns, shows internal plugins with locked badges, provides enable/disable toggles except for internal plugins, and expands rows for description, hooks, custom tools, safe source class, package identity, and redacted relative component labels without private absolute entry or data paths."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-043
- PLUG-038
- PLUG-042
unblocks: []
acceptance_criteria:
- "PLUG-044 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugins_inventory_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0053
preserved_exact_tokens:
- "9.1 Plugins tab"
- "Plugin list"
- "Name"
- "ID"
- "Version"
- "Source"
- "internal/project/global/config"
- "Status"
- "active/disabled/error"
- "Hook count"
- "Tool count"
- "locked badge"
- "Enable/disable toggle"
- "Plugin detail"
- "full description"
- "entry path"
- "plugin data directory path"
negative_constraints:
- "Internal plugins cannot be disabled from the Plugins tab."
- "Plugin details must not expose private absolute entry paths or plugin data directory paths."
preserved_contractrefs: []
compatibility_only_notes:
- "The preserved entry path and plugin data directory path literals are non-current source-lineage wording; current GUI copy uses redacted relative component labels."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/FinalGUISpec.md"
```

### PLUG-045 - Plugin Add And Remove Controls

```yaml
plan_unit_id: PLUG-045
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "The Plugins tab supports package-specifier and local-package flows for PM-internal interchange plugin.json, PM-native pm-plugin.json, or matching dual manifests; named target adapters handle OpenAI/Codex and Claude Code metadata without reinterpreting it as PM-native, legacy PM-shaped plugin.json opens a migration preview rather than fresh executable install, and config.plugins.packages, reload, and confirmed config/project/global removal semantics remain preserved."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-043
- PLUG-008
- PLUG-009
- PLUG-037
unblocks: []
acceptance_criteria:
- "PLUG-045 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
- "Local package selection exposes internal-interchange, PM-native, dual-manifest, mismatch, target-adapter, and legacy migration classifications without merging manifest fields."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_install_remove_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0053
preserved_exact_tokens:
- "Add plugin"
- "Install from package"
- "puppet-master-lint-hook@0.1.0"
- "Add local"
- "file picker"
- "directory containing plugin.json"
- "pm-plugin.json"
- "config.plugins.packages"
- "triggers reload"
- "Remove plugin"
- "config-sourced plugin"
- "Delete from disk"
- "confirmation"
negative_constraints:
- "Remove plugin controls must distinguish config-sourced removal from project/global delete-from-disk."
- "Add local must not treat a fresh legacy PM-shaped plugin.json as internal-interchange or PM-native executable install, and must not treat external target metadata as PM-native authority."
preserved_contractrefs: []
compatibility_only_notes:
- "The preserved source phrase directory containing plugin.json now denotes a PM-internal interchange package or a legacy migration candidate, not a PM-native entry declaration or direct external package claim."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/FinalGUISpec.md"
```

### PLUG-046 - Plugin Config Override Controls

```yaml
plan_unit_id: PLUG-046
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin config overrides expose hook_timeout_ms as a spinner with range 1000-30000 and default 5000, and allow_tool_override as a default-off toggle with warning label when enabled."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-043
- PLUG-037
- PLUG-029
- PLUG-031
unblocks: []
acceptance_criteria:
- "PLUG-046 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_config_override_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0053
preserved_exact_tokens:
- "Config overrides"
- "Collapsible card"
- "hook_timeout_ms"
- "spinner"
- "range 1000-30000"
- "default 5000"
- "allow_tool_override"
- "toggle"
- "default off"
- "warning label"
negative_constraints:
- "allow_tool_override must remain default off and visibly warned when enabled."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/FinalGUISpec.md"
```

### PLUG-047 - Plugin UI Interaction Mode Copy

```yaml
plan_unit_id: PLUG-047
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin UI elements follow the app-level Expert/ELI5 Interaction Mode toggle using tooltip.plugins.* keys, with ELI5 showing only the plugin list and enable/disable toggles while Expert exposes hook details, tool collision config, and timeout settings."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-043
- PLUG-044
- PLUG-046
unblocks: []
acceptance_criteria:
- "PLUG-047 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: interaction_mode_copy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0054
preserved_exact_tokens:
- "9.2 ELI5/Expert copy"
- "Interaction Mode"
- "Expert/ELI5"
- "tooltip.plugins.*"
- "ELI5"
- "plugin list"
- "enable/disable toggles"
- "Hook details"
- "tool collision config"
- "timeout settings"
- "Expert"
negative_constraints:
- "ELI5 mode hides hook details, tool collision config, and timeout settings."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/FinalGUISpec.md"
```

### PLUG-048 - Catalog Plugin Lifecycle State Surfacing

```yaml
plan_unit_id: PLUG-048
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Catalog-installed plugin, hook, and MCP config bundle lifecycle actions surface whether targets are enabled, loaded, or referenced by Persona settings, distinguish catalog-installed plugins from manual or local ones, and expose reload, deferred apply, or disable-before-remove state when required."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-043
- PLUG-038
- PLUG-040
unblocks: []
acceptance_criteria:
- "PLUG-048 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: catalog_plugin_lifecycle_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0055
preserved_exact_tokens:
- "9.3 Catalog-installed plugin and hook lifecycle"
- "explicit lifecycle semantics"
- "install/update/remove actions"
- "enabled"
- "loaded"
- "referenced by Persona settings"
- "reload"
- "deferred apply"
- "disable-before-remove"
- "catalog-installed plugins"
- "manual/local ones"
negative_constraints:
- "Catalog lifecycle actions must not hide enabled, loaded, Persona reference, reload, deferred, or disable-before-remove state."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/Skills_System.md"
```

### PLUG-049 - Catalog Uninstall Ownership Boundary

```yaml
plan_unit_id: PLUG-049
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Uninstalling a catalog plugin must not silently delete unrelated local overrides or config-sourced plugins with the same display name."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-010
- PLUG-037
- PLUG-048
unblocks: []
acceptance_criteria:
- "PLUG-049 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: catalog_uninstall_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0055
preserved_exact_tokens:
- "uninstalling a catalog plugin"
- "must not silently delete"
- "unrelated local overrides"
- "config-sourced plugins"
- "same display name"
negative_constraints:
- "Uninstalling a catalog plugin must not silently delete unrelated local overrides or config-sourced plugins with the same display name."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/FinalGUISpec.md"
```

### PLUG-050 - OpenCode Plugin Baseline Reference

```yaml
plan_unit_id: PLUG-050
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "The OpenCode plugin baseline is preserved as compatibility reference: JavaScript/TypeScript modules loaded through import(), internal, built-in npm, and config sources, PluginInput with SDK client, project metadata, Bun shell, named Hooks, and plugin tools overriding built-ins on collision."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-002
- PLUG-003
unblocks: []
acceptance_criteria:
- "PLUG-050 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: opencode_plugin_baseline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0056
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0057
preserved_exact_tokens:
- "BASELINE-DELTAS"
- "10. OpenCode baseline and Puppet Master deltas"
- "10.1 Baseline"
- "OpenCode plugins"
- "JavaScript/TypeScript modules"
- "import()"
- "built-in npm packages"
- "config-specified packages/paths"
- "PluginInput"
- "SDK client"
- "project metadata"
- "Bun shell"
- "Hooks interface"
- "~15 named hooks"
- "experimental.session.compacting"
- "tool property"
- "plugin tools override built-ins"
negative_constraints:
- "The OpenCode baseline is compatibility reference and does not override Puppet Master deltas."
preserved_contractrefs: []
compatibility_only_notes:
- "OpenCode baseline behavior is preserved as compatibility/source lineage only."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/OpenCode_Deep_Extraction.md"
```

### PLUG-051 - Platform-Agnostic Plugin Runtime Delta

```yaml
plan_unit_id: PLUG-051
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Puppet Master uses a platform-agnostic plugin API through WASM modules, subprocess-based entries, or dynamic libraries defined only by the PM-native pm-plugin.json entry, with no JavaScript runtime dependency; PM-internal interchange plugin.json and target-adapter output cannot declare native execution."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-009
- PLUG-016
- PLUG-050
unblocks: []
acceptance_criteria:
- "PLUG-051 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
- "The platform-agnostic runtime formats remain substantive PM-native requirements under pm-plugin.json entry."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: platform_agnostic_runtime_delta
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0058
preserved_exact_tokens:
- "Plugin runtime"
- "OpenCode uses JS import() with Bun"
- "Puppet Master uses a platform-agnostic plugin API"
- "WASM modules"
- "subprocess-based"
- "dynamic libraries"
- "plugin.json"
- "pm-plugin.json"
- "entry"
- "No JavaScript runtime dependency"
negative_constraints:
- "Puppet Master plugin runtime must not require a JavaScript runtime dependency."
- "PM-internal interchange plugin.json and target-adapter output must not declare or activate a PM-native runtime entry."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md"
compatibility_only_notes:
- "The preserved plugin.json entry token is legacy PM-shaped source lineage and migration input only."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/OpenCode_Deep_Extraction.md"
```

### PLUG-052 - Baseline Delta Alignment Set

```yaml
plan_unit_id: PLUG-052
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Puppet Master deltas preserve namespaced aliasing for tool collisions by default, strict priority and lexicographic deterministic load order, typed receipt/result/error logging with redacted projections pending Event Authority, and per-Persona plugin controls as the canonical divergences from the OpenCode baseline."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-013
- PLUG-031
- PLUG-041
- PLUG-040
- PLUG-050
unblocks: []
acceptance_criteria:
- "PLUG-052 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: baseline_delta_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0058
preserved_exact_tokens:
- "Tool collision policy"
- "namespaced aliasing"
- "built-in wins"
- "allow_tool_override"
- "Deterministic load order"
- "priority-ordered discovery"
- "lexicographic tiebreaking"
- "Structured logging"
- "typed ledger events"
- "Per-Persona overrides"
- "disabled_plugins"
negative_constraints:
- "OpenCode tool override defaults must not replace Puppet Master namespaced aliasing defaults."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md"
compatibility_only_notes:
- "OpenCode deltas are preserved without re-owning existing fine-grained units."
- "The preserved typed ledger events literal is non-current source lineage; plugin.* identities remain non-emitting candidates pending Event Authority."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/OpenCode_Deep_Extraction.md"
```

### PLUG-053 - Compaction Hook Alias Compatibility

```yaml
plan_unit_id: PLUG-053
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "OpenCode-era experimental.session.compacting subscriptions map to Puppet Master canonical session.compacting at registration time as an alias, with InjectContext versus ReplacePrompt return semantics and first-wins conflict resolution for ReplacePrompt."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-026
- PLUG-050
unblocks: []
acceptance_criteria:
- "PLUG-053 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: compaction_alias_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0058
preserved_exact_tokens:
- "Compaction hook naming and semantics"
- "experimental.session.compacting"
- "session.compacting"
- "dropping the experimental. prefix"
- "backward compatibility"
- "mapped to the canonical session.compacting hook at registration time"
- "alias"
- "InjectContext"
- "ReplacePrompt"
- "first-wins conflict resolution"
negative_constraints:
- "No runtime distinction exists between experimental.session.compacting alias subscribers and canonical session.compacting subscribers after registration."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md"
compatibility_only_notes:
- "experimental.session.compacting is compatibility alias only."
stale_retired_dispositions:
- "experimental.session.compacting is mapped to canonical session.compacting at registration time."
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/OpenCode_Deep_Extraction.md"
```

### PLUG-054 - CLI-Backed Provider Plugin Capability Evidence

```yaml
plan_unit_id: PLUG-054
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "When the claude local binary is used as a CLI-bridged provider, Puppet Master records observed provider-protocol capability evidence for native agents, effort and model selection, fallback models, MCP, plugins, settings injection, and headless JSON or stream-json output; plugin support remains capability-scoped and does not imply every provider account can load Puppet Master plugins."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-003
- PLUG-032
- PLUG-050
unblocks: []
acceptance_criteria:
- "PLUG-054 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: provider_plugin_capability_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0058
preserved_exact_tokens:
- "CLI-backed provider plugin capability evidence"
- "claude"
- "local binary"
- "CLI-bridged provider"
- "native agents"
- "effort selection"
- "model selection"
- "fallback model support"
- "MCP"
- "plugins"
- "settings injection"
- "headless JSON/stream-json output"
- "capability-scoped"
- "does not imply every provider account can load PM plugins"
negative_constraints:
- "Provider plugin support remains capability-scoped and must not imply every provider account can load Puppet Master plugins."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/CLI_Bridged_Providers.md"
- "Plans/OpenCode_Deep_Extraction.md"
```

### PLUG-055 - Backend Plugin Acceptance Overlay

```yaml
plan_unit_id: PLUG-055
unit_type: acceptance_overlay
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Backend acceptance overlay preserves AC-PL01 through AC-PL08 for discovery priority, deterministic load order, hook execution order, tool-execute blocking, central registry routing, built-in collision defaults, typed receipt/result/error logging with redacted projections and no plugin.* EventRecord emission pending Event Authority, and timeout or panic continuation behavior."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-008
- PLUG-010
- PLUG-013
- PLUG-015
- PLUG-021
- PLUG-029
- PLUG-031
- PLUG-032
- PLUG-041
unblocks: []
acceptance_criteria:
- "PLUG-055 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: backend_acceptance_overlay
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0059
preserved_exact_tokens:
- "ACCEPTANCE"
- "AC-PL01"
- "AC-PL02"
- "AC-PL03"
- "AC-PL04"
- "AC-PL05"
- "AC-PL06"
- "AC-PL07"
- "AC-PL08"
- "first-discovered plugin"
- "load order"
- "Hook execution order"
- "Block(reason)"
- "central tool registry"
- "permission policy engine"
- "namespaced aliasing"
- "typed events"
- "timeout"
- "panic"
- "Continue"
- "pipeline MUST NOT crash"
negative_constraints:
- "By default, plugin tools MUST NOT override built-in tools."
- "Hooks that timeout or panic MUST be treated as Continue with a warning logged; the pipeline MUST NOT crash."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Progression_Gates.md"
- "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Plugins_System.md#HOOK-EVENTS"
compatibility_only_notes:
- "The preserved typed events literal is non-current source lineage; AC-PL07 now requires typed receipts/projections and forbids candidate EventRecord emission pending Event Authority."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Progression_Gates.md"
- "Plans/Decision_Policy.md"
```

### PLUG-056 - Plugins GUI Tab Acceptance Overlay

```yaml
plan_unit_id: PLUG-056
unit_type: acceptance_overlay
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugins GUI acceptance overlay preserves AC-PL09 requiring the GUI Plugins tab to display all discovered plugins with enable/disable toggles and persist disable state across sessions."
gui_related: true
gui_classification_reason: "This unit defines plugin UI, user-visible approval, GUI references, or interface-facing extensibility behavior."
split_recommended: false
depends_on:
- PLUG-043
- PLUG-044
- PLUG-038
unblocks: []
acceptance_criteria:
- "PLUG-056 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: gui_acceptance_overlay
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0059
preserved_exact_tokens:
- "AC-PL09"
- "GUI Plugins tab"
- "display all discovered plugins"
- "enable/disable toggles"
- "persist disable state across sessions"
negative_constraints:
- "The GUI Plugins tab must not omit discovered plugins or fail to persist disable state."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Progression_Gates.md"
- "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Plugins_System.md#HOOK-EVENTS"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/FinalGUISpec.md"
- "Plans/Progression_Gates.md"
```

### PLUG-057 - Compaction Alias Acceptance Overlay

```yaml
plan_unit_id: PLUG-057
unit_type: acceptance_overlay
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Compaction alias acceptance overlay preserves AC-PL10 requiring plugins subscribing to OpenCode-era experimental.session.compacting to be treated as subscribers to canonical session.compacting at registration time, with no runtime distinction."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-053
unblocks: []
acceptance_criteria:
- "PLUG-057 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: compaction_alias_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0059
preserved_exact_tokens:
- "AC-PL10"
- "experimental.session.compacting"
- "canonical session.compacting"
- "alias mapping"
- "registration time"
- "no runtime distinction"
negative_constraints:
- "No runtime distinction exists between the OpenCode-era hook key alias and canonical session.compacting after registration."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Plugins_System.md, ContractName:Plans/Progression_Gates.md"
- "ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Plugins_System.md#HOOK-EVENTS"
compatibility_only_notes:
- "experimental.session.compacting is an OpenCode-era hook key alias."
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/OpenCode_Deep_Extraction.md"
- "Plans/Progression_Gates.md"
```

### PLUG-058 - Hook-Driven Blocking Scheduler Visibility

```yaml
plan_unit_id: PLUG-058
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin hook blocked outcomes map into explicit blocked-state handling and first-class blocked outcomes when they affect execution, without bypassing scheduler observability, retry classification, recovery-option rendering, queue analysis, or remediation observability."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-021
- PLUG-029
- PLUG-042
unblocks: []
acceptance_criteria:
- "PLUG-058 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_block_scheduler_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0060
preserved_exact_tokens:
- "Hook/Block Integration Addendum (2026-03-08)"
- "plugin.hook.blocked"
- "blocked/failure model"
- "explicit blocked-state handling"
- "generic plugin warnings"
- "scheduler observability"
- "retry classification"
- "recovery-option rendering"
- "shared scheduler/remediation contract"
- "first-class blocked outcomes"
- "queue analysis"
- "remediation observability"
negative_constraints:
- "Hook-driven blocking must not silently bypass scheduler observability, retry classification, or recovery-option rendering."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Executor_Protocol.md"
```

### PLUG-059 - Plugin Hook Blocked Runtime Taxonomy

```yaml
plan_unit_id: PLUG-059
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin-driven execution blocking maps into the canonical runtime blocked model with blocked_reason_code = plugin_hook_blocked, runtime-facing payload exposure of allowed_action_ids[], prerequisite or guard metadata, and preserved_local_work when relevant, without plugin-private retry or recovery semantics."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-058
unblocks: []
acceptance_criteria:
- "PLUG-059 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_block_runtime_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0061
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0062
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0063
preserved_exact_tokens:
- "Plugin Block Runtime Canonical Alignment (2026-03-09)"
- "Plugin Block Runtime Taxonomy Consolidation Addendum (2026-03-09)"
- "blocked_reason_code = plugin_hook_blocked"
- "allowed_action_ids[]"
- "guard metadata"
- "prerequisite metadata"
- "preserved_local_work"
- "canonical taxonomy"
- "Required rules"
negative_constraints:
- "Plugin hooks MUST NOT invent plugin-private retry or recovery semantics that bypass scheduler observability or canonical taxonomy."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Executor_Protocol.md"
- "Plans/Permissions_System.md"
```

### PLUG-060 - Plugin-Blocked Hook Eligibility

```yaml
plan_unit_id: PLUG-060
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Only execution-flow hooks pre_tool_invoke, pre_attempt_start, and pre_node_dispatch may trigger plugin_hook_blocked; observation-only hooks such as post_tool_invoke and post_attempt_complete cannot create plugin_hook_blocked."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-017
- PLUG-059
unblocks: []
acceptance_criteria:
- "PLUG-060 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_block_hook_eligibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0064
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0065
preserved_exact_tokens:
- "Plugin Hook Blocked Specification Addendum"
- "plugin Hook Blocked Specification"
- "Hooks that may block execution"
- "Only execution-flow hooks"
- "plugin_hook_blocked"
- "pre_tool_invoke"
- "pre_attempt_start"
- "pre_node_dispatch"
- "Observation-only hooks"
- "post_tool_invoke"
- "post_attempt_complete"
negative_constraints:
- "Observation-only hooks such as post_tool_invoke and post_attempt_complete cannot create plugin_hook_blocked."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Executor_Protocol.md"
```

### PLUG-061 - Plugin-Blocked Payload Metadata

```yaml
plan_unit_id: PLUG-061
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugin-blocked payloads include blocked_reason_code: plugin_hook_blocked, plugin_id, hook_name, block_reason, canonical allowed_action_ids[], and preserved_local_work."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-059
- PLUG-060
unblocks: []
acceptance_criteria:
- "PLUG-061 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_block_payload_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0066
preserved_exact_tokens:
- "Required metadata"
- "blocked_reason_code: plugin_hook_blocked"
- "plugin_id"
- "hook_name"
- "block_reason"
- "canonical allowed_action_ids[]"
- "preserved_local_work"
negative_constraints:
- "Plugin-blocked payloads must not omit canonical allowed_action_ids[] or preserved_local_work when required."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Permissions_System.md"
- "Plans/Contracts_V0.md"
```

### PLUG-062 - Plugin Recovery Scope Uses Canonical Actions

```yaml
plan_unit_id: PLUG-062
unit_type: constraint
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "Plugins do not invent plugin-private runtime recovery semantics and instead reuse canonical action families and runtime commands."
gui_related: false
gui_classification_reason: "This unit defines backend/runtime, policy, security, storage, dispatch, or governance behavior rather than visual presentation."
split_recommended: false
depends_on:
- PLUG-059
- PLUG-061
unblocks: []
acceptance_criteria:
- "PLUG-062 remains addressable as a fine-grained Plugins System PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plugins_system_drift
reasoning_tier: standard
context_scope: plugins_system_batch_210
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: plugin_recovery_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0067
preserved_exact_tokens:
- "Recovery scope"
- "Plugins MUST NOT invent plugin-private runtime recovery semantics"
- "canonical action families"
- "runtime commands"
negative_constraints:
- "Plugins MUST NOT invent plugin-private runtime recovery semantics."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/Plugins_System.md"
- "Plans/Permissions_System.md"
- "Plans/Executor_Protocol.md"
```

### PLUG-001 - Plugins System Source-Preserving Bridge Retired

```yaml
plan_unit_id: PLUG-001
unit_type: generated_artifact_residual
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: "PLUG-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 211 because Plugins_System-S0068 through S0071 are generated standardization tail material: Owner / Consumer Map, PlanUnits heading, former generated PLUG-001 bridge, and Migration Coverage. Plugins_System-S0001 through S0067 are covered by PLUG-002 through PLUG-062 or explicit structural and split dispositions. PLUG-001 no longer carries source_preserving_planunit compile mode and must not own product coverage."
gui_related: false
gui_classification_reason: "The retired bridge is generated migration lineage rather than implementation-facing GUI behavior, even though the retired source lineage preserved earlier GUI-related product tokens."
split_recommended: false
depends_on:
- PLUG-002
- PLUG-003
- PLUG-004
- PLUG-005
- PLUG-006
- PLUG-007
- PLUG-008
- PLUG-009
- PLUG-010
- PLUG-011
- PLUG-012
- PLUG-013
- PLUG-014
- PLUG-015
- PLUG-016
- PLUG-017
- PLUG-018
- PLUG-019
- PLUG-020
- PLUG-021
- PLUG-022
- PLUG-023
- PLUG-024
- PLUG-025
- PLUG-026
- PLUG-027
- PLUG-028
- PLUG-029
- PLUG-030
- PLUG-031
- PLUG-032
- PLUG-033
- PLUG-034
- PLUG-035
- PLUG-036
- PLUG-037
- PLUG-038
- PLUG-039
- PLUG-040
- PLUG-041
- PLUG-042
- PLUG-043
- PLUG-044
- PLUG-045
- PLUG-046
- PLUG-047
- PLUG-048
- PLUG-049
- PLUG-050
- PLUG-051
- PLUG-052
- PLUG-053
- PLUG-054
- PLUG-055
- PLUG-056
- PLUG-057
- PLUG-058
- PLUG-059
- PLUG-060
- PLUG-061
- PLUG-062
unblocks: []
acceptance_criteria:
- "Plugins_System-S0001 through S0067 remain mapped to fine-grained Plugins System PlanUnits or explicit structural/split dispositions rather than PLUG-001."
- "Plugins_System-S0068 through S0071 are generated standardization tail material or retired bridge lineage, not product implementation coverage."
- "PLUG-001 no longer uses source_preserving_planunit mode and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code."
- "Malformed generated ContractRefs from Plugins_System-S0070 remain preserved as span_map and coverage_map lineage only and are not promoted as active ContractRefs."
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: plugins_system_generated_tail_batch_211
implementation_surfaces:
- Plans/Plugins_System.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0068
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0069
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0070
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Plugins_System-S0071
preserved_exact_tokens:
- "source_preserving_planunit"
- "Plugins System (Canonical SSOT) Source-Preserving PlanUnit"
- "Plugins_System-S0068"
- "Plugins_System-S0071"
- "Owner / Consumer Map"
- "PlanUnits"
- "Migration Coverage"
negative_constraints:
- "PLUG-001 must not provide product implementation coverage for Plugins_System-S0001 through S0067 after Phase 2B batch 211."
- "PLUG-001 must not override PLUG-002 through PLUG-062 or later fine-grained Plugins System PlanUnits."
- "Do not rely on one coarse source_preserving_planunit as the final implementation standard for Plugins_System.md."
preserved_contractrefs:
- "Generated PLUG-001 ContractRefs, including malformed trailing apostrophes from Plugins_System-S0070, remain preserved in span_map and coverage_map as lineage only and are not active ContractRefs."
compatibility_only_notes:
- "The retired bridge is compatibility lineage for generated Owner / Consumer Map, generated PlanUnits heading, former PLUG-001 bridge, and Migration Coverage tail spans only."
stale_retired_dispositions:
- "Former generated source-preserving bridge material is retired as migration lineage only."
owner_hints:
- Plans/Plugins_System.md
```

## Migration Coverage

Original hash: `04bc2ed338211fd3b68a1271c39a517ad341f84e83a5dd1cb2c96db44f5ac7fb`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Plugins_System-S0001` through `Plugins_System-S0067` are preserved in place and mapped in `coverage_map.jsonl` to `PLUG-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
Phase 2B batch 209 atomized `Plugins_System-S0001` through `Plugins_System-S0044` into fine-grained PlanUnits `PLUG-002` through `PLUG-036`, including split coverage for P5 plugin boundary recovery, auto-load approval posture, arg-touching hook trust, and core-surface/host-policy extensibility boundaries. Container headings and section boundaries are carried by downstream PlanUnits rather than retained as product implementation bridges. `PLUG-001` is narrowed to residual source-preserving coverage for `Plugins_System-S0045` through `Plugins_System-S0067` only and must not override the fine-grained units. Batch 209 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
Phase 2B batch 210 atomized `Plugins_System-S0045` through `Plugins_System-S0067` into fine-grained PlanUnits `PLUG-037` through `PLUG-062`, including split coverage for child-run plugin/MCP inheritance, Plugins tab controls, catalog plugin lifecycle, OpenCode/Puppet Master deltas, acceptance overlays, and plugin-hook blocked runtime taxonomy. Container headings `Plugins_System-S0047`, `S0049`, `S0056`, `S0062`, and `S0064` are carried by downstream PlanUnits, while exact hook tokens such as `pre_tool_invoke`, `pre_attempt_start`, `pre_node_dispatch`, `post_tool_invoke`, and `post_attempt_complete` are preserved without normalization. `PLUG-001` is narrowed to generated-tail-only source-preserving coverage for `Plugins_System-S0068` through `Plugins_System-S0071`. Batch 210 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
Phase 2B batch 211 structurally dispositioned generated tail spans `Plugins_System-S0068` through `Plugins_System-S0071`: Owner / Consumer Map, PlanUnits heading, the former generated `PLUG-001` bridge, and Migration Coverage. `PLUG-001` is retired to migration-lineage-only compatibility disposition with `node_compile_hint.mode: source_preserving_bridge_retired`; `Plans/Plugins_System.md` no longer has active `source_preserving_planunit` product coverage. Malformed generated ContractRefs from `Plugins_System-S0070` remain preserved as lineage only and were not promoted as active ContractRefs. Batch 211 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### PLUG-063 - P1-PLUGIN-EXTENSION-POINT-CONTRACTS

```yaml
plan_unit_id: PLUG-063
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  P1-PLUGIN-EXTENSION-POINT-CONTRACTS (P1) is compiled as canonical Puppet Master intent for Typed plugin/UI extension points to avoid monkey patching: Imported external-repo finding extrepo-20260703-0034 / P1-PLUGIN-EXTENSION-POINT-CONTRACTS (P1). The preserved PM gap/delta is: Define typed UI slots and stable context object fields for MCP/tool/session/model/runtime rows; forbid monkey patching privileged surfaces; mutation hooks produce receipts and rechecks. The observed external-repo signal remains source-lineage evidence: Agent Zero added per-row extension points because plugins otherwise used MutationObserver/DOM scanning/store monkey-patching; settings hooks added for credential scanning.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Plugin can add MCP row badge through typed slot only
- Private store monkey-patch rejected on privileged surfaces
- Hook writes trigger permission re-evaluation
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Plugin can add MCP row badge through typed slot only
- Private store monkey-patch rejected on privileged surfaces
- Hook writes trigger permission re-evaluation
risk_class: p1_ui_projection_and_hard_gates_hardening
reasoning_tier: standard
context_scope: ui_projection_and_hard_gates
implementation_surfaces:
- Plans/Plugins_System.md
- Plans/Permissions_System.md
- Plans/MCP_Integration.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p1_plugin_extension_point_contracts
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0038
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0038
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0034/P1-PLUGIN-EXTENSION-POINT-CONTRACTS@line=34
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0034/P1-PLUGIN-EXTENSION-POINT-CONTRACTS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:14
source_atom_ids:
- atom-0038
external_atom_id: extrepo-20260703-0034
source_row_id: P1-PLUGIN-EXTENSION-POINT-CONTRACTS
priority: P1
finding_family: Typed plugin/UI extension points to avoid monkey patching
source_repos:
- agent0ai/agent-zero
target_docs:
- Plans/Plugins_System.md
- Plans/Permissions_System.md
- Plans/MCP_Integration.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/Plugins_System.md
- Plans/Permissions_System.md
- Plans/MCP_Integration.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0034
- P1-PLUGIN-EXTENSION-POINT-CONTRACTS
- P1
- Typed plugin/UI extension points to avoid monkey patching
- agent0ai/agent-zero
negative_constraints: []
observed_signal: Agent Zero added per-row extension points because plugins otherwise used MutationObserver/DOM scanning/store monkey-patching; settings hooks added for credential scanning.
pm_current_coverage: PM has Plugins_System and post-hook permission recheck concept.
pm_gap_or_delta: Define typed UI slots and stable context object fields for MCP/tool/session/model/runtime rows; forbid monkey patching privileged surfaces; mutation hooks produce receipts and rechecks.
compile_disposition: create_new_planunit
```

## FABLE Residual Plugin Contract Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High plugin rows for manifest permissions/capabilities, sandboxing, signature verification, and hook-name mapping. It does not create a plugin runtime implementation.

### PLUG-064 - Manifest, Sandbox, Signature, And Hook Mapping Contract

```yaml
plan_unit_id: PLUG-064
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  PM-native pm-plugin.json must declare permissions[], capabilities[], sandbox profile, signature metadata, and hook
  registrations before PM-native activation can be considered installable. PM-internal interchange plugin.json and
  target-adapter output cannot declare or acquire those PM-native authority fields. Hook names map to canonical lifecycle points instead of prose-only labels, and any
  mutation hook must emit a receipt and trigger permission re-evaluation.
gui_related: true
gui_classification_reason: Plugin install, permissions, and extension points are user-visible management and extension surfaces.
depends_on: [PLUG-001, PLUG-009, PLUG-017, PLUG-026, PLUG-040, PLUG-063, PS-131]
unblocks: []
acceptance_criteria:
  - PM-native pm-plugin.json permissions[] entries include permission_id, scope, purpose, default_state, requested_actions[], and approval_scope_key?.
  - PM-native pm-plugin.json capabilities[] entries include capability_id, provider_surface, hook_refs[], data_access, network_access, fs_access, and command_access.
  - Sandbox profiles are none, ui_extension_only, tool_proxy, filesystem_limited, network_limited, or trusted_local; any trusted_local request requires explicit signed provenance and user consent.
  - Signature verification records signature_algorithm, key_id, trust_root_ref, manifest_sha256, package_sha256, verification_status, and failure_reason_code.
  - Hook aliases map pre_tool_invoke to tool.execute.before, post_tool_invoke to tool.execute.after, pre_attempt_start to attempt.start.before, pre_node_dispatch to node.dispatch.before, and post_attempt_complete to attempt.complete.after.
  - Unknown hooks, unsigned privileged packages, and permission/capability mismatches fail install validation before activation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_plugin_contract_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Plugins_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: plugin_residual_manifest_sandbox_signature_hooks
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:937
  - fablereport.md:938
  - fablereport.md:939
  - fablereport.md:940
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "pm-plugin.json"
  - "plugin.json"
  - "permissions"
  - "capabilities"
  - "sandbox"
  - "signature"
  - "hook"
  - "pre_tool_invoke"
  - "post_tool_invoke"
negative_constraints:
  - Do not implement plugin execution, plugin marketplace behavior, WorkNodes, NodeSeeds, executable queues, production build tasks, or runtime certification evidence.
  - Do not allow a plugin hook to mutate privileged surfaces without a receipt and permission recheck.
  - Do not accept permissions, capabilities, sandbox, signature, hook, or native entry authority from PM-internal interchange plugin.json or a target adapter.
owner_hints:
  - Plans/Plugins_System.md
  - Plans/Permissions_System.md
  - Plans/MCP_Integration.md
```

## PM-Internal Interchange, Target Adapter, And PM-Native Package Contract Addendum - 2026-08-31

This addendum resolves the manifest conflict identified by the Egolite canon re-audit. The Plugins System remains the only plugin package, discovery, validation, activation, hook, tool, component, and lifecycle owner. Shared Integration Runtime supplies only the existing `RuntimeResourceGovernor`, `ObservableWork`, exact Host/Environment identity, leases, and generic durable command mechanics; Release Supply Chain owns package provenance admission. No `Integration_Runtime.md`, `Agent_Plugins_Compatibility.md`, or second plugin/runtime owner is created.

The closed package contract is `SchemaID:pm.plugins.package_contracts.v1` in `Plans/plugin_package_contracts.schema.json`. It is a pre-build package/receipt schema, not executable plugin runtime or Event Authority evidence. Central command and production-intent wiring registration is now separately admitted through `CS-071`, `UCC-149`, and `WM-048`; those records do not establish a native Plugins handler or runtime effect.

### Manifest split, target adaptation, and deterministic precedence

There are two distinct Puppet Master manifests plus separately generated external target packages:

1. PM-internal interchange `plugin.json` declares only the Puppet Master interchange floor: skills under `skills/` plus MCP configuration in `mcp.json`. It is not a directly loadable OpenAI/Codex or Claude Code package and cannot declare PM hooks, PM tools, PM commands, PM UI, PM rules, PM LSP adapters, PM Browser adapters, native entry modules, privileged permissions, or a PM sandbox. The schema's `portable_*`, `PortableConformanceReport`, `portable_conformant`, and `portable_partial` names are compatibility vocabulary for this internal lane only; they do not assert external portability.
2. PM-native `pm-plugin.json` declares Puppet Master agents, hooks, tools, commands, UI extensions, rules, LSP adapters, Browser adapters, runtime entry, permissions, capabilities, sandbox, signature, and supply-chain refs. It is the sole manifest that can request PM-native activation.

When both files exist, each validates independently against its own closed schema. `id` and `version` must match exactly; mismatch rejects the package before approval. Fields are never merged across files, and neither file can override the other's namespace. `pm-plugin.json` is authoritative only for PM-native components; `plugin.json` remains authoritative only for internal-interchange components. An interchange-only package may be imported and used only through its internal skill/MCP owners; it does not become a PM-native executable plugin.

Direct ecosystem output requires an explicit target adapter. The `openai_codex` adapter emits `.codex-plugin/plugin.json` plus `.mcp.json`; the `claude_code` adapter emits `.claude-plugin/plugin.json` plus `.mcp.json`. Each adapter output binds the source interchange-manifest hash, source `mcp.json` hash, source inventory hash, target manifest hash and schema ID, target `.mcp.json` hash and schema ID, generated-file inventory and inventory hash, target-specific conformance report, and an explicit authority mapping with `authority_widening=false`. Target output cannot activate PM-native components, and neither a matching ID/version nor successful syntax validation grants hooks, tools, commands, UI, Browser, filesystem, network, sandbox, or runtime authority.

This addendum supersedes the manifest-filename and unqualified external-portability portions of §2.2, §3.2, §9.1, §10.2, `PLUG-009`, `PLUG-014`, `PLUG-045`, `PLUG-051`, and `PLUG-064`. Their plugin ID, deterministic discovery, explicit approval, runtime-format, hook, permission, sandbox, signature, and UI semantics remain adopted under `pm-plugin.json`; internal `plugin.json` plus `mcp.json` remains only an interchange subject. OpenCode JavaScript/TypeScript/Bun remains compatibility evidence only.

### Legacy migration

An existing `plugin.json` containing the legacy PM-native `hooks/tools/entry` shape is classified `legacy_imported`; it is never reinterpreted as internal interchange or external target metadata. Discovery records its exact bytes/hash and previous approval identity and produces a migration preview to `pm-plugin.json`. Puppet Master does not silently rewrite or merge the file. A previously approved exact hash may remain active only under its existing bounded approval until the first update, manifest change, reload requiring revalidation, permission/capability change, or explicit migration. Any of those boundaries requires a valid `pm-plugin.json`, new conformance reports, permission diff, provenance recheck, and explicit approval before replacement activation. Fresh install of a legacy-shaped manifest fails closed with migration-required guidance.

Package classification remains exactly `portable_conformant | portable_partial | pm_extended | legacy_imported | nonconformant | rejected` for compatibility, where `portable_*` means internal-interchange conformance only. Component state is exactly `not_present | discovered | validated | approval_required | enabled | disabled | degraded | failed | quarantined`. A `portable_and_pm_native` package may be `pm_extended` while one optional component is disabled or degraded, but a failed required component, ID/version mismatch, containment failure, invalid signature, unknown privileged hook, or capability/permission mismatch rejects or quarantines the affected activation. External target-adapter conformance is a separate record and never changes PM-native activation authority. One human primary status summarizes the package without hiding component results.

### Package containment, execution, and authority

Archive extraction and local-directory admission validate every entry before writing. Absolute paths, drive/UNC roots, parent traversal, alternate data streams, device names, hard links outside the package, and symlinks that resolve outside the normalized package root are rejected. The final extracted tree is re-walked without following untrusted links, hashed, and compared with the signed package manifest before activation.

`PLUGIN_ROOT` is a read-only content root for the verified package generation. `PLUGIN_DATA` is a separate writable per-plugin data root with owner/scope/quota/retention identity; it cannot shadow executable content or escape to Project, config, credential, socket, or another plugin's data. GUI projections show safe source class, package identity, and redacted relative component labels; they do not expose private absolute entry/data paths, credential-store keys, internal sockets, or raw environment values.

A subprocess entry is represented as one exact executable token plus a bounded argv array; it is never reconstructed through a shell string. Environment variables are allowlisted and secret references remain broker-owned. Every external process uses a private runtime directory, bounded stdout/stderr/log capture, process-tree cancellation, timeout, crash budget, and `RuntimeResourceGovernor` admission. Off-loopback outbound transport is HTTPS-only and requires a declared allowlist plus Permissions/FileSafe/security approval. Plugins cannot open public ingress, debug/CDP, control, or callback sockets unless a named existing endpoint owner provides an authenticated, rate-gated, generation-fenced capability; possession of a plugin permission is not endpoint authority.

Hooks and registered commands remain least-authority components. Unknown hooks, unsigned privileged packages, tool/command collisions without explicit policy, and permission/capability mismatch fail before activation. Child runs receive only the effective compatible subset and cannot widen tool, Browser, MCP, filesystem, network, or command authority. Protected `AuthBrowserSession` remains inaccessible to plugins and plugin adapters.

### Conformance, supply chain, update, and rollback

`PortableConformanceReport` is a compatibility-named internal-interchange report; it records the internal `plugin.json` hash, skills-root containment, internal `mcp.json` validation, unsupported components, `interchange_scope=pm_internal_only`, `direct_external_loadability=false`, and result. `TargetAdapterOutput` and `TargetAdapterConformanceReport` separately record one named ecosystem, current target paths, source/output hashes, source/generated inventories, target manifest and MCP schema IDs/validation refs, authority mapping, and `authority_widening=false`. `AgentPluginConformanceReport` records PM manifest and package hashes, component results, permissions/capabilities, sandbox, signature/provenance, entry/argv/environment/transport bounds, root/data separation, and result. All reports are immutable and generation-bound; none is runtime proof.

Install/update admission requires package hash, publisher/signature/trust-root proof, license and SBOM refs, archive containment evidence, exact manifest hashes, target platform/architecture compatibility, known-bad check, and conformance refs. `PluginUpdateDiff` is the closed update-review record: it binds exact old/new package versions, generations, and hashes plus typed manifest, component, permission, capability, sandbox, executable/argv/environment/runtime-limit, transport/endpoint, license, SBOM, publisher, signature, provenance, known-bad, and runtime-compatibility axes. It also records authority change, reapproval state and ref, candidate signature status, retained prior generation, rollback package proof, and review disposition. `cmd.agent_plugin.update`, `.reload`, `.review_changes`, and `.rollback` request/result/receipt records require the exact `update_diff_ref`; an opaque permission/component ref is not a substitute. The prior verified generation remains available until replacement commit. Failure before commit leaves it active; failure after switch follows the recorded rollback plan and produces a typed rollback result. Missing rollback evidence cannot become success.

### Command, event, receipt, and wiring disposition

The plugin owner owns the following exact semantic commands, now centrally registered by `CS-071` and `UCC-149` with twelve `WM-048` production-intent rows:

`cmd.agent_plugin.scan`, `cmd.agent_plugin.install`, `cmd.agent_plugin.update`, `cmd.agent_plugin.enable`, `cmd.agent_plugin.disable`, `cmd.agent_plugin.reload`, `cmd.agent_plugin.remove`, `cmd.agent_plugin.validate`, `cmd.agent_plugin.review_changes`, `cmd.agent_plugin.rollback`, `cmd.agent_plugin.open_details`, and `cmd.agent_plugin.open_logs`.

Central identity and production-intent wiring do not make a command executable. No native Plugins lifecycle handler is admitted, so every exact command remains unavailable with `handler_unavailable` and no GUI control may claim an effect. The Plugins owner defines command request/result semantics in `pm.plugin.command_contracts.v1` and package/conformance/migration/update-diff/receipt relations in `pm.plugins.package_contracts.v1`: exact package/plugin identity, Project and Host/Environment where applicable, expected package/manifest/permission/topology generations, idempotency, confirmation/approval refs, `ObservableWork` ref, result/receipt/error, and stale-generation behavior.

No new `agent_plugin.*` EventRecord family is admitted here. New lifecycle effects use `event_effect_policy = receipt_only_no_eventrecord_pending_event_authority`. The eight historical `plugin.*` hook/log identifiers (`plugin.loaded`, `plugin.load_failed`, `plugin.hook.invoked`, `plugin.hook.error`, `plugin.hook.blocked`, `plugin.permission.override`, `plugin.tool.registered`, and `plugin.tool.collision`) are individual Event Authority candidates only: the live registry contains no `plugin.*` row, so they are non-emitting until separately admitted with closed payload schemas, producers, scope, redaction, retention, and consumers. This current addendum supersedes every earlier unqualified statement that those names are already ledger events or registrations. A prose token, schema enum, or GUI copy is not Event Authority.

Each registered production-intent control must still prove its native route, visible role/name, one exact command dispatch, typed request/result/error, state selector and disabled reason, Permissions/FileSafe/provenance checks, receipt persistence, idempotency/CAS/generation fencing, `ObservableWork`, route/focus/return context, keyboard/focus/accessibility, restart/reconnect/rollback, and redacted Details/Logs before enablement. Schema aliases preserve the same contract identity and do not receive a second handler or wiring row.

### GUI and reverse coverage

The existing Plugins list/card/details layout remains the consumer surface. It renders one human primary status/action, internal-interchange/native/target-adapter classification, source/trust badge, permission-change badge, component health count, missing/denied reason, freshness, and optional typed conformance/update/rollback details. It must not label internal interchange as directly OpenAI/Codex- or Claude Code-loadable. Lists are stable-ID, bounded, virtualized, generation-fenced projections. Hidden/off-screen Plugins surfaces suppress paint, animation, eager log/path hydration, and polling without cancelling install/update/rollback, dropping receipts, or unloading an enabled plugin. Low-resource mode reduces background scans/log hydration and plugin concurrency through the one governor; it never skips signature, containment, permission, adapter-conformance, or rollback gates.

| Owner fact | Forward consumer | Reverse proof required |
|---|---|---|
| PM-internal interchange `plugin.json` + `mcp.json` | internal Skills/MCP import and Plugins summary | internal schema, skills containment, separate manifest/MCP hashes, `direct_external_loadability=false`, no PM-native fields |
| target-adapter output | named OpenAI/Codex or Claude Code export | exact `.codex-plugin/plugin.json` or `.claude-plugin/plugin.json` plus `.mcp.json`, separate source/output hashes and inventories, target schema/conformance, no authority widening |
| PM-native `pm-plugin.json` | Plugins runtime and Settings | native schema, component map, permissions/capabilities, sandbox, signature, supply-chain refs |
| legacy manifest migration | Plugins scan/update UI | exact legacy hash/approval, non-silent preview, reapproval boundary, no field merge |
| package/component classification | list/card/details | closed package and component states, required/optional distinction, freshness/generation |
| install/update/rollback | command-driven controls | exact registered ID and production-intent row, missing native handler remains `handler_unavailable`, request/result/receipt, stale-generation and rollback tests |
| external process/network | plugin runtime adapter | exact executable+argv, allowlisted env/HTTPS, private runtime dir, bounded streams, process-tree cancellation, governor/work refs |
| hidden/low-resource UI | Plugins projection | virtualized stable IDs, paint suppression, durable lifecycle continuity, no skipped security gate |

ContractRef: SchemaID:pm.plugins.package_contracts.v1, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Release_Supply_Chain.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

### PLUG-065 - Internal Interchange, Target Adapter, And PM-Native Manifest Precedence

```yaml
plan_unit_id: PLUG-065
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  PM-internal interchange plugin.json owns only the skills/ plus mcp.json internal interchange and is not directly
  loadable OpenAI/Codex or Claude Code packaging. PM-native pm-plugin.json owns Puppet Master components and authority
  requests; simultaneous files validate independently with exact id/version agreement and no field merge. Named target
  adapters emit current ecosystem metadata plus .mcp.json with separate hashes, inventories, schemas, conformance, and
  no authority widening, while legacy PM-shaped plugin.json follows an explicit hash-bound migration.
gui_related: true
gui_classification_reason: Package classification, migration review, approval, and mismatch errors are visible Plugins management states.
depends_on: [PLUG-009, PLUG-014, PLUG-045, PLUG-051, PLUG-064]
unblocks: [PLUG-066, PLUG-067, PLUG-068, RSC-011]
acceptance_criteria:
  - PM-internal interchange plugin.json cannot request PM-native execution or authority, claim direct external loadability, or be reinterpreted as current ecosystem metadata; pm-plugin.json cannot redefine interchange skills/MCP content.
  - Simultaneous files require exact id/version agreement and never merge fields.
  - OpenAI/Codex output is exactly `.codex-plugin/plugin.json` plus `.mcp.json`; Claude Code output is exactly `.claude-plugin/plugin.json` plus `.mcp.json`; each has distinct source/output hashes, inventories, schema IDs, conformance refs, and `authority_widening=false`.
  - Legacy PM-shaped plugin.json is classified legacy_imported, never portable, never silently rewritten, and requires migration/reapproval at the first named boundary.
  - Package and component classifications use only their closed vocabularies.
validation_surfaces: [Plans/plugin_package_contract_fixtures.json, dual-manifest resolution, mismatch, no-field-merge, legacy-migration preview, OpenAI/Codex and Claude Code target conformance, and adapter round-trip fixtures]
risk_class: plugin_manifest_precedence_or_migration_drift
reasoning_tier: high
context_scope: plugin_dual_manifest_precedence
implementation_surfaces: [Plans/Plugins_System.md, Plans/plugin_package_contracts.schema.json]
node_compile_hint: {mode: plugin_dual_manifest_precedence, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - register-egolite.md#PLG-01..PLG-02 (audited 2026-08-31)
preserved_exact_tokens: [plugin.json, pm-plugin.json, skills/, mcp.json, .codex-plugin/plugin.json, .claude-plugin/plugin.json, .mcp.json, portable_conformant, portable_partial, pm_extended, legacy_imported, nonconformant, rejected]
negative_constraints:
  - Do not keep PM-native hooks, tools, entry, permissions, sandbox, or signature fields canonical in PM-internal interchange plugin.json or introduce them through a target adapter.
  - Do not call the PM-internal interchange directly loadable by OpenAI/Codex or Claude Code.
  - Do not silently rewrite, merge, or activate a mismatched dual-manifest package.
```

### PLUG-066 - Package Containment, Process, And Conformance

```yaml
plan_unit_id: PLUG-066
unit_type: security_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  Plugin packages fail closed on archive/path/symlink escape, use read-only PLUGIN_ROOT and separate writable
  PLUGIN_DATA, launch an exact executable plus bounded argv without shell reconstruction, and require allowlisted
  environment/HTTPS, private runtime directory, bounded streams, process-tree cancellation, conformance, and provenance.
gui_related: false
depends_on: [PLUG-064, PLUG-065, SIR-015]
unblocks: [PLUG-067, RSC-011]
acceptance_criteria:
  - Archive and final-tree validation reject traversal, absolute/device paths, escaping links, and hash mismatch before activation.
  - PLUGIN_ROOT is read-only and PLUGIN_DATA cannot shadow content or escape its per-plugin authority.
  - External processes and transport are bounded, allowlisted, governed, cancellable as a process tree, and unable to open unowned public/control/debug endpoints.
  - Internal-interchange, target-adapter, and PM-native conformance reports preserve exact generation, source/output hashes, inventories, schemas, component, authority, and provenance evidence without widening authority.
validation_surfaces: [Plans/plugin_package_contract_fixtures.json, path-traversal and symlink-escape rejection, broker-secret and HTTPS enforcement, component-isolation, crash-budget/bounded-log, stale-routine, signature-change, and containment fixtures]
risk_class: plugin_package_escape_or_authority_widening
reasoning_tier: high
context_scope: plugin_package_containment_conformance
implementation_surfaces: [Plans/Plugins_System.md, Plans/plugin_package_contracts.schema.json]
node_compile_hint: {mode: plugin_package_containment_conformance, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - register-egolite.md#PLG-02 (audited 2026-08-31)
negative_constraints:
  - Do not expose AuthBrowserSession, raw secrets, private absolute paths, internal sockets, or an unbounded process/log stream to a plugin.
  - Do not let a plugin manifest, permission, or adapter become public endpoint authority.
```

### PLUG-067 - Lifecycle Commands, Receipts, And Event Boundary

```yaml
plan_unit_id: PLUG-067
unit_type: integration_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  Centrally registered plugin lifecycle commands share one typed request/result/receipt family, preserve exact identity,
  permission and generation fencing, expose ObservableWork, retain rollback evidence, and remain unavailable with
  handler_unavailable until one native Plugins handler exists; no new agent_plugin EventRecord family is inferred.
gui_related: true
gui_classification_reason: Scan, install, update, enable, disable, reload, remove, validate, review, rollback, details, and logs are visible controls.
depends_on: [PLUG-065, PLUG-066]
unblocks: [PLUG-068]
acceptance_criteria:
  - All twelve exact cmd.agent_plugin IDs map to one schema family, CS-071/UCC-149 central identities, and twelve WM-048 production-intent rows without acquiring a native handler from those static records.
  - A registered ID without a native owner route is unavailable and cannot produce an effect through GUI, palette, natural language, or automation.
  - The current fixture phase returns all twelve exact IDs with `outcome=rejected`, `effect_state=none`, `state_changed=false`, `state=unavailable`, and `disabled_reason=handler_unavailable` until a native route exists.
  - Effects remain receipt-only pending Event Authority; all eight historical plugin.* producer names are non-emitting candidates because no plugin.* family is currently registered.
  - Update, reload, review, and rollback records bind the fully typed PluginUpdateDiff plus component, permission/provenance, generation, approval, prior-generation-retention, and rollback proof.
validation_surfaces: [Plans/plugin_contract_fixtures.json, Plans/plugin_package_contract_fixtures.json, CS-071, UCC-149, WM-048, current handler-unavailable results, update-diff binding negatives, and future native receipts]
risk_class: plugin_command_or_event_phantom_closure
reasoning_tier: high
context_scope: plugin_lifecycle_command_receipts
implementation_surfaces: [Plans/Plugins_System.md, Plans/plugin_package_contracts.schema.json]
node_compile_hint: {mode: plugin_lifecycle_command_receipts, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - register-egolite.md#TS-05 (audited 2026-08-31)
negative_constraints:
  - Do not claim a native handler, EventRecord producer, runtime implementation, or executable effect from owner prose, schema, central identity, or production-intent wiring alone.
  - Do not create a second lifecycle engine in Settings, Release, or Shared Integration Runtime.
```

### PLUG-068 - Plugins GUI, Virtualization, And Reverse Coverage

```yaml
plan_unit_id: PLUG-068
unit_type: gui_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  The existing Plugins list/card/details surface projects internal-interchange, target-adapter, PM-native, and legacy classification, one human status/action,
  trust and permission change, component health, conformance and rollback evidence through bounded stable-ID
  virtualization and redaction; hidden or low-resource presentation never cancels lifecycle work or skips security gates.
gui_related: true
gui_classification_reason: This unit defines the user-visible Plugins inventory, status, action, detail, redaction, and performance behavior.
depends_on: [PLUG-043, PLUG-044, PLUG-045, PLUG-048, PLUG-067]
unblocks: []
acceptance_criteria:
  - Internal-interchange/target-adapter/native/legacy classification, one human primary status/action, component health, and exact disabled reason are visible without raw enum/path/secret disclosure or a false direct-portability label.
  - Long inventories are bounded, virtualized, stable-ID and generation-fenced; hidden paint suppression preserves durable work and receipts.
  - Every action reverse-maps to one registered command/handler/wiring row before becoming enabled.
validation_surfaces: [Plans/plugin_package_contract_fixtures.json, future Plugins list virtualization, redaction, accessibility, low-resource, and reverse-wiring fixtures]
risk_class: plugin_gui_projection_or_path_disclosure
reasoning_tier: high
context_scope: plugin_gui_virtualized_reverse_coverage
implementation_surfaces: [Plans/Plugins_System.md]
node_compile_hint: {mode: plugin_gui_virtualized_reverse_coverage, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - canon-integration-plugins.md#7 (read-only audit 2026-08-31)
negative_constraints:
  - Do not add a duplicate Settings tab, manager, lifecycle engine, raw enum display, or absolute private path disclosure.
```

## Typed Lifecycle Command Closure Addendum

This addendum materializes the owner-side machine contract anticipated by PLUG-067 and reconciles it to the separately admitted `CS-071`/`UCC-149`/`WM-048` registration phase without changing the Event Authority boundary. The exact primaries are `cmd.agent_plugin.scan`, `.install`, `.update`, `.enable`, `.disable`, `.reload`, `.remove`, `.validate`, `.review_changes`, `.rollback`, `.open_details`, and `.open_logs`.

All twelve use:

- request: `Plans/plugin_contracts.schema.json#/$defs/PluginCommandRequest`;
- result: `Plans/plugin_contracts.schema.json#/$defs/PluginCommandResult`;
- wiring request alias: `Plans/plugin_contracts.schema.json#/$defs/plugin_command_request`, which is only a `$ref` to `PluginCommandRequest`;
- wiring result alias: `Plans/plugin_contracts.schema.json#/$defs/plugin_command_result`, which is only a `$ref` to `PluginCommandResult`;
- availability: `Plans/plugin_contracts.schema.json#/$defs/PluginCommandAvailability`;
- permission: `Plans/plugin_contracts.schema.json#/$defs/PluginPermissionDecision`;
- error: `Plans/plugin_contracts.schema.json#/$defs/PluginCommandError`;
- disabled reason: `Plans/plugin_contracts.schema.json#/$defs/PluginCommandDisabledReasonCode`.

Requests bind exact package/plugin, Host/Environment, topology, package, and permission generations, command instance, idempotency, permission snapshot, confirmation, work, return context, manifest class/hashes, supply-chain proof, conformance, permission diff, typed update diff, rollback, data disposition, and bounded projection. Results preserve before/after status and generation, component/conformance/supply-chain/update-diff/rollback evidence, exact permission/availability/error refs, work, and receipt. Open Details and Open Logs are bounded read-only projections with no `ObservableWork` mutation. Install, update, enable, remove, and rollback require explicit confirmation.

### Manifest precedence and migration

PM's portable/internal-interchange `plugin.json` and PM-native `pm-plugin.json` remain different signed subjects. `plugin.json` supplies only the portable/interchange baseline and is not, by name alone, a directly loadable OpenAI/Codex, Claude Code, or other external-agent package. `pm-plugin.json` is authoritative only for PM-native components, lifecycle, permissions, hooks, commands, UI, sandbox, and runtime declarations; it cannot retroactively make an interchange-only package PM-native.

For a dual-manifest package, both hashes are mandatory, shared `id` and `version` must agree, and `pm-plugin.json` may extend only PM-native fields under the package and permission ceilings established by admission. Identity mismatch, missing hash, authority widening, or an unsigned post-admission change fails closed. The command schema records the two hashes separately and never collapses them into one precedence-free manifest.

A legacy imported manifest is `legacy_imported`, retains its own `legacy_manifest_sha256`, and remains inactive or quarantined until a deterministic migration emits reviewed `plugin.json` and, only when PM-native declarations exist, `pm-plugin.json`. Migration records source/output hashes, field decisions, dropped/blocked fields, warnings, conformance, permissions, package proof, and rollback. Legacy fields never silently override either current manifest. Update/review/rollback preserve the last verified generation until commit and retain exact migration/provenance evidence.

### Availability, security, and evidence boundary

The semantic owner route is the single plugin lifecycle owner defined in this document. `CS-071`, `UCC-149`, and twelve `WM-048` production-intent rows now provide the central identity/wiring layer, but no native module path is asserted. Every exact ID therefore remains unavailable with `handler_unavailable`; registration cannot be promoted into handler or effect proof.

Because `PluginCommandId` is closed to these twelve now-registered identities, the owner disabled-reason and error enums no longer admit `command_not_registered` for this family. `handler_unavailable` is the exact current-phase code; stale generation, permissions, containment, conformance, supply-chain, approval, quarantine, recovery, and policy codes remain available for their distinct gates.

Permission decisions are exact-scope and snapshot-bound and fix `authority_widening=false`, `credential_material_exposed=false`, `protected_auth_access_allowed=false`, and `private_absolute_path_exposed=false`. Plugins and adapters cannot reach `AuthBrowserSession`, raw secrets, private absolute paths, unbounded logs/process streams, unowned public/control/debug endpoints, mutable Tool Store payloads, or a broader Host/Environment/project capability than admitted. Package/manifest declarations do not self-authorize activation.

GUI consumers are the canonical Plugins inventory/card/details flows and command palette. A bounded owner reconciler may scan/validate current admitted packages under explicit policy; it cannot silently install, update, enable, remove, rollback, grant permission, or accept a migration. Reverse coverage remains exact GUI action -> exact ID -> typed contracts -> one central catalog row -> one production wiring row -> one native lifecycle owner -> receipt projection.

Effects are receipt-only with `event_effect_policy=receipt_only_no_eventrecord_pending_event_authority`. The historical unregistered `plugin.*` producer names remain non-emitting candidates. Static schema/fixture validation does not prove package containment, signature/trust, activation, migration, rollback, native Slint behavior, runtime events, or cross-platform execution.

`Plans/plugin_contract_fixtures.json` provides one positive request and one current-phase fail-closed result for every exact command. All twelve results are `rejected`, preserve generation/status, set `state_changed=false`, expose `state=unavailable` with `handler_unavailable`, settle the exact return context, and retain the receipt-only policy. The pack rejects manifest-lane mixing, missing lifecycle proof/conformance/permission/update-diff/rollback inputs, invalid reload reapproval, missing destructive confirmation/data disposition, command/action mismatch, state change while unavailable, inconsistent availability/return settlement, authority widening, and protected-auth exposure.

ContractRef: SchemaID:pm.plugin.command_contracts.v1, SchemaID:pm.plugins.package_contracts.v1, ContractName:Plans/Release_Supply_Chain.md#RSC-011

### PLUG-069 - Exact Plugin Lifecycle Command Machine Contracts

```yaml
plan_unit_id: PLUG-069
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  Twelve exact cmd.agent_plugin primaries share one closed request, result, availability, permission,
  disabled-reason, and error contract; plugin.json remains the separately hash-bound portable/internal-interchange
  subject, pm-plugin.json remains the PM-native subject, and legacy import uses explicit reviewed migration with no
  silent precedence or authority widening.
gui_related: true
gui_classification_reason: The twelve exact lifecycle, review, details, and logs actions are Plugins management controls.
depends_on: [PLUG-065, PLUG-066, PLUG-067, RSC-011]
unblocks: [PLUG-068]
acceptance_criteria:
  - Every exact command has one positive typed request and result fixture plus closed result/availability/permission/error definitions.
  - Current-phase results for all twelve centrally registered commands remain rejected and unavailable with handler_unavailable and no state, generation, or status change; central identity and production-intent wiring cannot become available without one native handler.
  - Dual manifests bind both hashes and exact identity; legacy import cannot activate before reviewed migration and conformance.
  - Update, reload, review_changes, and rollback bind the same fully typed PluginUpdateDiff identity through request and result/receipt contracts.
  - Permission decisions forbid protected-auth access, credential disclosure, private-path disclosure, and authority widening.
  - Missing native handler remains a typed unavailable state and no EventRecord family is inferred from central registration or production-intent wiring.
  - Lowercase plugin_command_request and plugin_command_result are reference-only aliases to the canonical definitions and contain no duplicate schema substance.
validation_surfaces: [Plans/plugin_contract_fixtures.json, Plans/plugin_package_contract_fixtures.json, CS-071, UCC-149, WM-048, current handler-unavailable results, typed update-diff relation fixtures, and future native lifecycle receipts]
risk_class: plugin_lifecycle_contract_or_manifest_precedence_drift
reasoning_tier: high
context_scope: plugin_lifecycle_typed_closure
implementation_surfaces: [Plans/Plugins_System.md, Plans/plugin_contracts.schema.json, Plans/plugin_package_contracts.schema.json]
node_compile_hint: {mode: plugin_lifecycle_typed_closure, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:PLG-001, source_ref:egolite-requirement:PLG-002, source_ref:egolite-requirement:PLG-003, source_ref:egolite-requirement:PLG-004, source_ref:egolite-requirement:PLG-005, source_ref:egolite-requirement:PLG-006, source_ref:egolite-requirement:PLG-007, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:414-438]
negative_constraints:
  - Do not infer the separately admitted central registration or production wiring from owner schema closure, and do not promote either static central fact into a native handler, event producer, runtime success, or security certification.
  - Do not call plugin.json directly loadable by an external agent, let pm-plugin.json override portable identity, or silently promote a legacy manifest.
  - Do not expose AuthBrowserSession, secrets, private absolute paths, unbounded streams, or unadmitted authority to plugins or adapters.
```

## Owner Static Contract Gap Closure Addendum - 2026-09-01

This addendum closes only the owner-level machine shapes identified by `plugin-current-recheck-20260901`. Central catalog/UI catalog and production-intent wiring are now separately present through `CS-071`, `UCC-149`, and `WM-048`; this addendum still does not close Settings, Doctor, Touch Closure, native implementation, filesystem/process/network execution, signature verification, adapter generation, migration execution, or cross-platform evidence.

`Plans/plugin_package_contracts.schema.json` now owns these closed relation records in addition to the manifest/package/conformance/receipt records above:

- `PluginManifestResolutionRecord`: separately hashed `plugin.json`, `pm-plugin.json`, and legacy identities, exact manifest-set classification, explicit identity-alignment result, `field_merge_performed=false`, `precedence_policy=independent_validation_no_field_merge`, and no PM-native authority from target output;
- `PluginLegacyMigrationRecord`: exact source legacy hash, output hashes, per-field mapped/dropped/blocked decisions, warnings, conformance, update diff, package proof, rollback, review/approval, no silent rewrite, no legacy precedence, and no activation authority from the migration record;
- `PluginAdapterRoundTripReport`: OpenAI/Codex or Claude Code target path, source and reconstructed manifest/MCP/inventory hashes, generated-inventory relation, target conformance, no authority widening, and no PM-native activation;
- `PluginContainmentReport`: raw hostile entry, normalized path when safe, entry/link kind, forbidden-path/resolved-root/external-hardlink decisions, final-tree rewalk/hash status, and admitted/rejected result;
- `PluginRuntimeBoundsReport`: stdout/stderr/log limits and truncation, timeout/process-tree cancellation, crash count/budget, fail-closed lifecycle disposition, and rollback ref;
- `PluginPromotedRoutineDisposition`: source/current package generations, current/stale state, invocation authorization, exact disabled/rollback state, and reason;
- `PluginUpdateDiff`: every old/new axis named in the update contract plus authority/reapproval, signature freshness, prior-generation retention, rollback proof, and review disposition.

The static fixture denominator is explicit: the package pack contains 27 positive and 31 rejected-negative cases; the lifecycle pack contains 12 requests, 16 supporting/result positives, and 24 rejected negatives. Together the focused validator admits 55/55 positives and rejects 55/55 negatives. Positive cases include all three conformance-report kinds, both target adapters and round trips, dual/portable/legacy precedence, explicit migration preview, both portable component-isolation directions, optional PM-native component isolation, traversal and symlink rejection reports, crash-loop/bounded-log quarantine, stale promoted-routine disable/rollback, and the full update diff. Negative cases deny traversal admission, symlink escape admission, literal secret values, non-HTTPS off-loopback endpoints, unsigned or changed candidates, required incompatible component conformance, lost isolation, silent migration, field merge, adapter authority widening/hash mismatch, crash-loop enablement, stale routine invocation, and incomplete update axes.

The fixture pack binds related IDs and hashes to the same authored values. JSON Schema validates each closed record but does not itself prove that a referenced artifact exists, that two runtime records were generated together, that bytes hash to the asserted value, or that an operating loader enforced the decision. Those remain referential/native/runtime obligations and must retain `not_run` or missing evidence until executed.

All twelve current command-result fixtures remain fail-closed after central registration: `outcome=rejected`, `state_changed=false`, unchanged package generation/status, `state=unavailable`, and `disabled_reason=handler_unavailable`. The separate central identities and production-intent rows do not supply a native owner route. No fixture may simulate install/update/reload/rollback success.

The event boundary is unchanged. Every lifecycle result/receipt remains `event_effect_policy=receipt_only_no_eventrecord_pending_event_authority`; none of these new record kinds admits or emits `plugin.*` or `agent_plugin.*` EventRecord families.

### PLUG-070 - Plugin Relation, Hostile-Negative, And Update-Diff Static Closure

```yaml
plan_unit_id: PLUG-070
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  Plugin owner contracts type manifest resolution, legacy migration, both external-adapter round trips,
  package containment decisions, runtime bounds, stale promoted-routine disposition, component isolation,
  and one complete update diff spanning manifest, component, authority, runtime, transport, and supply-chain axes;
  every current lifecycle result remains unavailable with handler_unavailable pending a native owner route.
gui_related: true
gui_classification_reason: Migration preview, update review, component health, disabled reasons, bounded logs, and rollback state are user-visible Plugins facts even though this unit supplies only static owner contracts.
depends_on: [PLUG-065, PLUG-066, PLUG-067, PLUG-069, RSC-011]
unblocks: [PLUG-068]
acceptance_criteria:
  - PortableConformanceReport, TargetAdapterConformanceReport for both named adapters, and AgentPluginConformanceReport each have positive generation/hash/component/authority fixtures.
  - OpenAI/Codex and Claude Code each have a source/output/reconstructed hash-and-inventory round-trip fixture with authority_widening=false and pm_native_activation_authorized=false.
  - Dual, portable-only, and legacy resolution plus explicit hash-bound migration prove independent manifest validation, exact precedence, no field merge, and no silent rewrite.
  - Traversal, symlink escape, literal secret, non-HTTPS off-loopback transport, unsigned/changed update, incompatible required component, lost component isolation, crash-loop enablement, and stale routine invocation are rejected by static negative fixtures.
  - PluginUpdateDiff requires manifest, components, permissions, capabilities, sandbox, executable, transport, license, SBOM, publisher, signature, provenance, known-bad, and runtime-compatibility axes plus approval, signature freshness, retained prior generation, and rollback proof.
  - Update, reload, review_changes, and rollback request/result/receipt paths bind update_diff_ref; all twelve centrally registered command results remain rejected/unavailable with handler_unavailable and no state, generation, or status change.
  - All effects remain receipt-only and no plugin or agent_plugin EventRecord family is inferred.
validation_surfaces: [Plans/plugin_package_contracts.schema.json, Plans/plugin_package_contract_fixtures.json, Plans/plugin_contracts.schema.json, Plans/plugin_contract_fixtures.json, scripts/pm-new-contracts-verify.py]
risk_class: plugin_static_relation_or_security_fixture_drift
reasoning_tier: high
context_scope: plugin_owner_static_gap_closure
implementation_surfaces: [Plans/Plugins_System.md, Plans/plugin_package_contracts.schema.json, Plans/plugin_contracts.schema.json]
node_compile_hint: {mode: plugin_owner_static_gap_closure, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-integration-20260831/audits/plugin-current-recheck/plugin-current-recheck.md#PLUG-RECHECK-004..006
negative_constraints:
  - Do not promote schema/fixture acceptance into artifact existence, referential integrity, filesystem/process/network enforcement, signature verification, adapter/migration execution, native behavior, cross-platform proof, readiness, or certification.
  - Do not enable any cmd.agent_plugin action before its admitted central/catalog/production-intent records are joined to one native handler, reverse-route proof, and runtime receipt closure.
  - Do not emit EventRecord under a plugin.* or agent_plugin.* candidate identity.
```

## Retained Packet Candidate Inventory (Non-Canonical And Non-Emitting)

The following PKT-04 names are retained so packet extraction cannot silently disappear during typed closure. This is an inventory only: every row has `canonical=false`, `registered=false`, `emits_eventrecord=false`, and `disposition=deferred_non_emitting_event_candidate`. The common reason is `event_authority_and_native_producer_contract_absent`. These names are not added to the event registry or any schema enum:

`agent_plugin.discovered`, `agent_plugin.validated`, `agent_plugin.installed`, `agent_plugin.updated`, `agent_plugin.enabled`, `agent_plugin.disabled`, `agent_plugin.removed`, `agent_plugin.component_loaded`, `agent_plugin.component_skipped`, `agent_plugin.component_failed`, `agent_plugin.rollback_completed`.

The typed lifecycle contract is stricter than retention alone. Install, update, enable, reload, remove, and rollback require non-null admitted package proof, at least one applicable conformance ref, an exact permission diff, and rollback evidence; update, reload, review changes, and rollback additionally require the fully typed update-diff identity. Enable admits only a PM-native or dual manifest. Reload additionally requires human confirmation and a separately referenced authority-change/revalidation decision. Remove requires an explicit owned-data disposition. When centrally registered and natively available, Scan, Validate, Review Changes, Open Details, and Open Logs are machine-declared no-effect results; Review Changes and the two open projections require bounded projections. In the current unregistered phase every exact command result is rejected with no state change. Every result settles one non-secret caller return context. These predicates remain static admission shapes, not package, handler, activation, rollback, or native proof.
