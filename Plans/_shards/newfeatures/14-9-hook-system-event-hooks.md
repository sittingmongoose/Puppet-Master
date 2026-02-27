## 9. Hook System (Event Hooks)

### 9.1 Concept

**Hooks** are user- or plugin-defined handlers that run at specific **events** and can:

- **Continue:** Do nothing, let the pipeline proceed.
- **Block:** Abort the action (e.g. don't send this message, don't run this tool).
- **Modify:** Change the payload (e.g. append to the message, change tool arguments) and then continue.

Events could include: before sending user message, before tool use, after tool use, on context warning (e.g. approaching token limit), on compaction trigger, on session start/end, on error. Hooks are configured per event (e.g. a list of script paths or plugin hook IDs); the app invokes them in order and respects block/modify.

### 9.2 Relevance to Puppet Master

- **Safety and policy:** Enforce "no write to prod" or "always run tests before commit" by blocking or modifying tool use.
- **Audit:** Log every message or tool use to a file or external system.
- **Integration:** Call out to linters, formatters, or custom checks before/after tool use.
- **Interview/orchestrator:** Inject project-specific instructions (e.g. "when starting Phase 3, always add this checklist") without hardcoding.

### 9.3 Implementation Directions

- **Event enum:** Define a fixed set of events (e.g. `UserMessageSubmit`, `PreToolUse`, `PostToolUse`, `ContextWarning`, `CompactionTrigger`, `SessionStart`, `SessionEnd`, `Error`). Document payload per event.
- **Hook runner (Rust):** When an event fires, load hook list for that event (from config + plugins), run each hook (script or inline). Scripts can be shell, or we accept a small JSON in/out protocol (stdin: payload, stdout: `{"action":"continue"|"block"|"modify", "payload":...}`).

**Hook Timeout (Resolved):**
- Default timeout: **5 seconds** per hook invocation.
- Config: `hooks.timeout_ms`, default `5000`. Per-hook override: `hooks.{hook_name}.timeout_ms`.
- On timeout: **continue** (hook invocation is skipped, warning logged as `hook.timeout` seglog event).
- Configurable behavior: `hooks.on_timeout` — `"continue"` (default) or `"block"` (halt execution until hook responds or is manually dismissed).
- Rationale: hooks are advisory; they should not block the critical path by default. Users who need blocking hooks can opt in.
- **Dangerous-command blocking:** Dangerous-command blocking is part of FileSafe (Plans/FileSafe.md): FileSafe already blocks destructive commands in `BaseRunner::execute_command()` and exposes a Command blocklist. PreToolUse hooks can call into FileSafe's blocklist so we have one extension point (FileSafe for core, hooks for optional/user rules). See §17.3-17.4.
- **Wiring:** In the execution path (e.g. in runner or orchestrator), call the hook runner at the right points. Start with 2-3 events (e.g. `UserMessageSubmit`, `PreToolUse`) and add more as needed.
- **Config:** Hooks listed in config (or in plugin manifests); GUI settings page to add/remove/reorder hooks per event.
- **No new runtime:** Prefer spawning a process per hook so we don't embed a script engine; keep the contract simple (JSON in/out).

---

