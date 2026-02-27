## 6. Plugin and Skills Extensibility

### 6.1 Concept

**Plugins** are self-contained bundles (e.g. under a single directory) that can add:

- **Commands:** New slash-style or named commands (e.g. `/review`, `/compact`) implemented as prompts or scripts.
- **Agents/roles:** Named "agents" (e.g. architect, explorer, implementer, guardian) with fixed system prompts and tool sets; the app can invoke them by name.
- **Hooks:** Code or scripts that run on events (e.g. before sending a message, before/after tool use, on context warning) and can block, modify, or continue.
- **Skills:** Context that is auto-injected when a trigger matches (e.g. file extension, keyword, or regex in the prompt or path). One skill might add "Python style guide" when `*.py` is in context.

A **plugin directory** (e.g. under app data or project `.puppet-master/plugins/`) is scanned at startup; each plugin declares components (commands, agents, hooks, skills) in a manifest (e.g. `plugin.json`). The app merges them into the main command list and event pipeline.

### 6.2 Relevance to Puppet Master

- **Orchestrator and interview:** "Agents" map well to our subagent personas; we could load agent definitions from plugins so power users can add custom roles without changing code.
- **Hooks:** Pre-send and pre-tool-use hooks could enforce project rules, add audit logs, or modify prompts (e.g. inject AGENTS.md sections). Aligns with our verification and memory layers.
- **Skills:** Auto-injecting context by file type or keyword could reduce repetition in prompts and keep AGENTS.md smaller (e.g. "when working in `src/doctor/`, add this checklist").
- **Commands:** Custom commands could wrap common workflows (e.g. "run doctor and then wizard") or internal tools.

### 6.3 Implementation Directions

- **Manifest format:** e.g. `plugin.json`: `id`, `name`, `version`, `commands[]`, `agents[]`, `hooks[]`, `skills[]`. Each entry points to a file (e.g. markdown for command/agent body, script path for hooks, JSON for skill triggers/content).
- **Loading (Rust):** On startup, scan plugin dirs, parse manifests, validate paths. Build in-memory registries: command name → handler, agent name → system prompt + tools, hook event → list of scripts, skill trigger → content. Expose via e.g. `plugin_registry` module.
- **Invocation:** When user runs a custom command, orchestrator resolves it to a plugin command and runs it (e.g. as a prompt with that command's body). When we need an "agent", we look up by name and append that agent's prompt. Hooks are called at defined points with a small payload (e.g. message text, tool name); they return continue/block/modify.
- **Skills:** When building the iteration prompt (or interview prompt), check open files and prompt text against skill triggers; concatenate matching skill content into context. Prefer deterministic ordering (e.g. by plugin id, then skill id).
- **GUI:** A "Plugins" or "Extensions" section in settings to list plugins, enable/disable, and show component counts. No need to implement full install-from-URL in v1; local directory is enough.
- **Bundled "default" plugin:** Ship one built-in plugin (e.g. `puppet-master-default`) with a few commands and agents so the mechanism is used from day one and we dogfood it.
- **One-click install, no code:** To make extension truly "no code," provide a **curated catalog** of commands, agents, hooks, and skills that users can install with one click (§15.14). The catalog lists pre-built items; install = copy into plugin dir and enable. No editing of config or writing scripts required.

> **Canonical SSOT:** The authoritative specification for plugin discovery, load order, hook events, custom tool registration, compaction hooks, and plugin logging is `Plans/Plugins_System.md`. This section (§6) provides feature-level context and relevance; all normative plugin behavior is defined in the SSOT.

ContractRef: ContractName:Plans/Plugins_System.md#DISCOVERY, ContractName:Plans/Plugins_System.md#HOOK-EVENTS

---

