## 10. Implementation plan: permissions (spec for implementers)

> **SSOT:** The canonical permission specification (actions, precedence, granular rules, wildcards, special guards, ask-flow, defaults, resolution algorithm, persistence, and GUI) is **`Plans/Permissions_System.md`**. This section provides implementation-oriented guidance for the tool registry and policy engine integration. It references the SSOT for normative definitions and adds tool-registry-specific details (FileSafe integration, CLI derivation, presets) that are scoped to this document.

ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules

### 10.1 Config schema

The durable permission config uses TOML files at `~/.config/puppet-master/permissions.toml` (global) and `<project_root>/.puppet-master/permissions.toml` (project). Full schema: `Plans/Permissions_System.md` §9.1.

For backward compatibility, the merged permission set is also projected to redb as `tool_permissions` in `config:v1`.

### 10.2 Default policy table

Canonical default table: `Plans/Permissions_System.md` §7. Tool-to-default mapping includes `read` → allow (with §7.1 `.env` deny), `edit`/`bash` → ask, `glob`/`grep`/`list`/`codesearch`/`skill`/`lsp`/`capabilities.get`/`media.generate` → allow, `webfetch`/`websearch`/`task` → ask, `todoread`/`todowrite` → allow (subagent: deny), `external_directory`/`doom_loop` → ask, unknown tools → ask.

### 10.3 Resolution algorithm

Canonical algorithm: `Plans/Permissions_System.md` §8. Summary: Mode override → Session cache → Persona overrides → Project rules → Global rules → Defaults → Special guards. Post-resolution, FileSafe applies (§10.6).

### 10.4 Presets → config mapping

Presets apply batch permission rules. Canonical preset definitions: `Plans/Permissions_System.md` §10.4.

| Preset | Effect on tool_permissions |
|--------|----------------------------|
| **Read-only** | `edit`, `bash`, `webfetch`, `websearch`, `task` → deny; all others allow (or leave unset to use defaults). |
| **Plan mode** | Only `read`, `grep`, `glob`, `list`, `codesearch` → allow; everything else → deny. |
| **Full** | All built-in → allow except `bash` and `edit` → ask. |

Store as the same TOML config; presets are a GUI shortcut to set multiple keys at once.

### 10.5 GUI ↔ config serialization

The Permissions GUI is specified in `Plans/Permissions_System.md` §10 and `Plans/FinalGUISpec.md` §7.4.10. The tool registry supplies the list of known tool names (built-in + MCP-discovered) to populate the GUI's per-tool list.

### 10.6 FileSafe integration order and API

- **Order:** (1) **Tool permission** (allow/deny/ask per `Plans/Permissions_System.md` §8) — if deny, stop and return "Tool disabled." (2) If **ask**, surface to user; on approve, continue. (3) **FileSafe** — for bash: command blocklist; for edit/write: write scope; for read: sensitive-file filter. If FileSafe blocks, return "Blocked by FileSafe: &lt;reason&gt;" and do not execute.
- **Single API (recommended):** `policy.may_execute_tool(tool_name, invocation_context) -> Result<Allow | Deny(reason) | Ask, Error>`. Internally: resolve permission (allow/deny/ask); if allow (or ask and approved), then run FileSafe check; return Allow only if both pass. Runner calls this once per tool call before executing or forwarding.
- **FileSafe contract:** FileSafe exposes e.g. `check_bash_command(cmd)`, `check_write_path(path)`, `check_read_path(path)`. Policy engine calls these after permission resolves to allow (or ask-approved).

### 10.7 Ask UI contract

Ask-flow semantics (`once`/`always`/`reject`) are defined in `Plans/Permissions_System.md` §6. Implementation notes for the runner:

- **Assistant (interactive):** When policy returns **ask**, surface a **pending approval** to the UI with `{ tool_name, invocation_summary, options: once | always | reject }`. See `Plans/Permissions_System.md` §6 for response semantics.
- **Orchestrator / Interview (headless):** Map `ask` → `deny`, or to **pending-HITL** if HITL is enabled (`Plans/human-in-the-loop.md`).

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

