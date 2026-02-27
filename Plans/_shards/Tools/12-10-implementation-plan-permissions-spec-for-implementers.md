## 10. Implementation plan: permissions (spec for implementers)

This section gives enough detail for someone to write an **implementation plan** or implement the permission layer without inferring schema or order. It locks config shape, resolution steps, and integration points.

### 10.1 Config schema (exact)

- **Config key:** `tool_permissions` in the same config blob as the rest of Settings (e.g. `GuiConfig`; persisted to redb as part of `config:v1`).
- **Simple form (MVP):** A single object: keys = tool name or wildcard pattern (e.g. `mymcp_*`), values = `"allow"` | `"deny"` | `"ask"`.

```json
{
  "tool_permissions": {
    "edit": "deny",
    "bash": "ask",
    "read": "allow",
    "webfetch": "allow",
    "context7_*": "ask"
  }
}
```

- **Granular form (optional, post-MVP):** A key can map to an **object** of pattern → action (for that tool only). Pattern matching: last matching rule wins; `*` = zero or more chars, `?` = one char. Example (OpenCode-style):

```json
{
  "tool_permissions": {
    "bash": {
      "*": "ask",
      "git *": "allow",
      "npm *": "allow",
      "rm *": "deny"
    },
    "edit": {
      "*": "deny",
      "src/**/*.rs": "allow"
    }
  }
}
```

- **Scope:** MVP = app-level only (one `tool_permissions` object). Per-project overrides (e.g. `project.{id}.tool_permissions`) are an enhancement; document in registry spec when added.
- **Validation:** Keys may be built-in canonical names (§3.1), discovered MCP/custom names, or wildcard patterns. Wildcard syntax for MVP: **prefix only** (e.g. `mymcp_*`); pattern must end with `*` and match by prefix. Invalid wildcards (e.g. `*only`, empty `*`) are ignored at load or treated as literal tool names; document in registry spec. Unknown tool names at resolution time fall through to default (§10.3).

### 10.2 Default policy table

When no rule matches (no exact tool name, no matching wildcard, no matching granular pattern), use this default. Implement as a **single source of truth** (e.g. constant table or function in code). Every built-in tool and special key must have exactly one row.

| Tool or key | Default | Notes |
|-------------|---------|-------|
| read | allow | Read-only; path-based deny for .env via §10.3 special guards |
| grep | allow | Read-only; low risk |
| glob | allow | Read-only; low risk |
| list | allow | Read-only; low risk |
| edit | ask | File modifications; require approval unless overridden |
| write | ask | Same permission as edit (§3.2) |
| patch | ask | Same permission as edit |
| multiedit | ask | Same permission as edit |
| bash | ask | Shell execution; FileSafe applies after permission |
| webfetch | ask | Network; optional allow per config |
| websearch | ask | Network; optional allow per config |
| question | allow | Session/UX; only meaningful when HITL/UI available |
| skill | allow | Load skill content; path under allowed roots |
| todowrite | allow | Subagent runs: default **deny** (run config may override) |
| todoread | allow | Subagent runs: default **deny** (run config may override) |
| lsp | allow | Read-only ops (references, definition, hover); rename requires approval (§3.4.1) |
| task | ask | Subagent launch; can override to allow/deny |
| codesearch | allow | Code/symbol search; low risk |
| external_directory | ask | Paths outside project cwd ([OpenCode](https://opencode.ai/docs/permissions/#external-directories)) |
| doom_loop | ask | Same tool 3× identical input ([OpenCode](https://opencode.ai/docs/permissions/)) |
| **Any unknown tool** (e.g. new MCP tool) | ask | Safe default until user sets explicit rule |

Document this table in the central registry or policy module so all callers use the same defaults.

### 10.3 Resolution algorithm (steps)

Use this order when deciding allow/deny/ask for a single tool invocation. Steps are deterministic; run them in order and return as soon as a step yields a result.

1. **YOLO override (Assistant only):** If session is YOLO, return **allow** (no prompt). **FileSafe still applies after permission:** the runner must then run FileSafe checks before executing (bash blocklist, write scope, sensitive paths). So: permission = allow; then if FileSafe blocks, do not execute and return a "Blocked by FileSafe" result to the agent; do not emit `tool.denied` for FileSafe blocks (emit only for permission deny or user-declined ask).
2. **Session "approve for session" cache (Assistant only):** If this tool (or matching pattern) was approved for session, return **allow**.
3. **Unknown tool name:** If `tool_name` is empty or not in the known set (built-in names §3.1, or discovered MCP/custom names for this run), skip to step 7 and use default **"Any unknown tool"** (ask).
4. **Exact tool name:** If `tool_permissions[tool_name]` exists and is a string (`"allow"` | `"deny"` | `"ask"`), use it and stop.
5. **Wildcard rules:** If not found by exact name, evaluate wildcard rules. MVP: only **prefix** wildcards (key ends with `*`). For each key that ends with `*`, let prefix = key with `*` removed; if `tool_name` starts with prefix, that rule matches. Use **longest matching prefix** (e.g. `mymcp_*` and `mymcp_foo_*` both match `mymcp_foo_bar` → use `mymcp_foo_*` if present). If multiple wildcards match with the same length, **deny** overrides allow/ask; else allow overrides ask. Invalid wildcards (e.g. `*only`, key that is just `*`) are skipped (do not match).
6. **Granular rules (if present):** If `tool_permissions[tool_name]` is an object, get **invocation context** (e.g. for bash: command string; for edit/read: path; for webfetch: URL). Evaluate pattern keys in **defined/iteration order**; **last matching pattern** wins. If **no pattern matches** the invocation context, fall through to step 7 (default for this tool name).
7. **Default:** Use the default from §10.2 for this tool (or "Any unknown tool" if tool was unknown). For subagent runs, apply subagent overrides (todowrite/todoread → deny unless run config overrides).
8. **Special guards:** If tool is `read` and invocation path matches sensitive pattern (e.g. `.env`, `*.env`, or FileSafe-configured sensitive list), return **deny** regardless of permission (align with FileSafe security filter). Apply after steps 1-7.

Result: **allow** | **deny** | **ask**. After result: if **deny**, emit `tool.denied` and do not execute. If **ask**, surface to UI; on user decline, emit `tool.denied` and do not execute. If **allow** (or ask approved), run FileSafe check if applicable; if FileSafe blocks, do not execute and return block reason to agent; then if actually executed, emit `tool.invoked` on completion.

### 10.4 Presets → config mapping

So the GUI "Apply preset" button can write a concrete `tool_permissions` object:

| Preset | Effect on tool_permissions |
|--------|----------------------------|
| **Read-only** | `edit`, `bash`, `webfetch`, `websearch` → deny; all others allow (or leave unset to use defaults). |
| **Plan mode** | Only `read`, `grep`, `glob`, `list` → allow; everything else → deny. |
| **Full** | **Default:** all built-in → allow except `bash` and `edit` → ask. User may then change bash/edit to allow. Alternative "Allow all" (no ask) may be a separate preset or GUI toggle; document in FinalGUISpec if implemented. |

Store as the same `tool_permissions` object; presets are just a shortcut to set multiple keys at once.

### 10.5 GUI ↔ config serialization

- **Save:** Per-tool list (tool name + dropdown Allow/Deny/Ask) → object `{ tool_name: "allow"|"deny"|"ask", ... }`. Wildcard rules (e.g. "Add rule: `context7_*` = Ask") → add key `context7_*` to same object. Preset button overwrites or merges (document: overwrite is simpler for MVP).
- **Load:** Read `tool_permissions`; for each key, if it's a string, show in per-tool list (or in wildcard list if key contains `*`). If it's an object (granular), show in "Advanced" or "Granular rules" UI if that exists; otherwise treat as "custom" and show tool name with badge "Custom rules."
- **MVP:** Simple form only (no granular object in GUI); advanced users can edit config or YAML. Full granular editing in GUI is an enhancement.

### 10.6 FileSafe integration order and API

- **Order:** (1) **Tool permission** (allow/deny/ask) -- if deny, stop and return "Tool disabled." (2) If **ask**, surface to user; on approve, continue. (3) **FileSafe** -- for bash: command blocklist; for edit/write: write scope; for read: sensitive-file filter. If FileSafe blocks, return "Blocked by FileSafe: &lt;reason&gt;" and do not execute.
- **Single API (recommended):** `policy.may_execute_tool(tool_name, invocation_context) -> Result<Allow | Deny(reason) | Ask, Error>`. Internally: resolve permission (allow/deny/ask); if allow (or ask and approved), then run FileSafe check; return Allow only if both pass. Runner calls this once per tool call before executing or forwarding.
- **FileSafe contract:** FileSafe exposes e.g. `check_bash_command(cmd)`, `check_write_path(path)`, `check_read_path(path)`. Policy engine calls these after permission resolves to allow (or ask-approved).

### 10.7 Ask UI contract

- **Assistant (interactive):** When policy returns **ask**, the runner must **not** execute the tool. It must surface a **pending approval** to the UI (e.g. event on a channel, or callback with `{ tool_name, invocation_summary, options: once | always }`). UI shows approval dialog (e.g. "Allow `bash: git status`?" with buttons Once / For session / Deny). On "Once" or "For session," runner proceeds with this invocation (and optionally caches "for session" for that tool/pattern). On "Deny," return error to agent and optionally emit `tool.denied`.
- **Orchestrator / Interview (headless):** When policy returns **ask**, no UI is available. **Map ask → deny** (recommended), or to **pending-HITL** if HITL is enabled at that tier (human-in-the-loop.md): pause run and surface "Approval required" to Dashboard; when user approves, resume. Document chosen behavior in human-in-the-loop.md and in the implementation plan.

### 10.8 Registry → CLI derivation (per platform)

Implement a single function or table that, given the **resolved** permission set (which tools are allow/deny/ask for this run), returns the **platform-specific CLI args** so the runner can invoke the CLI correctly. Example (expand per platform in implementation plan):

| Platform | Derivation rule |
|----------|------------------|
| Claude | Build `--allowedTools "Read,Edit,Bash"` from tools that are allow or ask (ask still needs runtime approval). Omit any tool that is deny. |
| Copilot | Build `--allow-tool '...'` list from allow+ask; build `--deny-tool '...'` from deny. If all allow, can use `--allow-all-tools` and only pass `--deny-tool` for denied. |
| Gemini | `--approval-mode yolo` if all tools allow; else `auto_edit` or more restrictive; document mapping in implementation plan. |
| Cursor, Codex | No single CLI flag for tool allowlist. Tool set is determined by MCP config and platform behavior. Runner **filters** tool calls against policy before forwarding: allow → forward; deny → return "Tool disabled" to agent; ask → map to deny or HITL in headless. Document in implementation plan. |

No hardcoded tool names in runner; all names come from registry + policy.

---

