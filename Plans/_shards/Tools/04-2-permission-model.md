## 2. Permission model

By default, tools can be **enabled** without per-call approval. Behavior is controlled by a **permission** per tool (or wildcard): **allow**, **deny**, or **ask** (require user approval before running).

### 2.1 Values and semantics

- **allow** -- Tool may run without prompting. Use for read-only or low-risk tools (read, grep, glob, list) or when the user has opted into full automation (e.g. YOLO mode).
- **deny** -- Tool is disabled for the run. The agent cannot invoke it; attempts are blocked and optionally logged.
- **ask** -- User must approve each use, or "approve for session" (per assistant-chat-design). Applies to bash, edit, webfetch, websearch, and any MCP/custom tool where approval is desired.

### 2.2 Config and precedence

Config key: **`tool_permissions`** in the same config blob as the rest of Settings (e.g. GuiConfig; persisted to redb as part of `config:v1`). Full schema: §10.1.

Example:

```json
{
  "tool_permissions": {
    "edit": "deny",
    "bash": "ask",
    "webfetch": "allow",
    "mymcp_*": "ask"
  }
}
```

- **Wildcards:** e.g. `mymcp_*` applies one permission to all tools from an MCP server or namespace. Enables "ask for all tools from server X" without listing each tool.
- **Precedence:** **deny** overrides allow/ask when multiple rules match (e.g. `edit: deny` and `*: allow` → edit is denied). Resolution order: §10.3.
- **Default:** If a tool has no explicit permission, use the default policy table (§10.2). Pattern matching: `*` = zero or more chars, `?` = one char ([OpenCode Permissions -- Wildcards](https://opencode.ai/docs/permissions/#wildcards)). With granular rules (object syntax), last matching rule wins ([OpenCode Permissions](https://opencode.ai/docs/permissions/)).

### 2.3 Session vs run; subagents

- **Session (Assistant):** "Approve for session" can persist allow for that chat session only; do not persist across restarts (per assistant-chat-design).
- **Run (Orchestrator/Interview):** Permissions are fixed from run config at start; no interactive ask unless HITL is enabled at tier boundaries (human-in-the-loop.md).
- **Subagents:** todowrite and todoread default to **deny** for subagent runs to avoid conflicting task state. Run config may override via e.g. `subagent_tool_overrides: { "todowrite": "allow", "todoread": "allow" }` (exact key and schema in implementation plan; document in orchestrator-subagent-integration.md). All other tools use the same default table (§10.2) unless run config specifies otherwise.

### 2.4 Interaction with FileSafe

FileSafe (command blocklist, write scope, sensitive files) runs **in addition to** tool permissions. A tool may be **allowed** by permission but still **blocked** by FileSafe (e.g. bash allowed, but command `rm -rf /` blocked). Tool permission = "may the agent call this tool?"; FileSafe = "may this specific invocation proceed?". See **FileSafe.md**; ensure policy engine applies both layers.

### 2.5 OpenCode Permissions alignment and cross-plan references

Permission semantics and optional **granular rules** align with [OpenCode Permissions](https://opencode.ai/docs/permissions/). Summary and cross-plan ties:

**Granular rules (object syntax):** Per-tool, permission can be an **object** with pattern-based rules ([OpenCode -- Granular Rules](https://opencode.ai/docs/permissions/#granular-rules-object-syntax)): **bash** -- command pattern (`"git *": "allow"`, `"rm *": "deny"`); **edit** -- file path; **read**, **glob**, **grep**, **list** -- path/pattern; **webfetch** -- URL. **Last matching rule wins.** FileSafe-style: bash blocklist ≈ bash deny patterns, write scope ≈ edit path allowlist, sensitive files ≈ read path deny.

**Special permissions:** **external_directory** -- paths outside project cwd; default ask; `~`/`$HOME` expansion ([OpenCode -- External Directories](https://opencode.ai/docs/permissions/#external-directories)). **doom_loop** -- same tool 3× identical input; default ask. **Defaults:** read allows except `.env` denied (`*.env`, `*.env.*`; `*.env.example` allowed) ([OpenCode -- Defaults](https://opencode.ai/docs/permissions/#defaults)). **What "Ask" does:** once, always, reject ([OpenCode](https://opencode.ai/docs/permissions/#what-ask-does)); our "approve for session" ≈ always. **Per-agent overrides:** [OpenCode -- Agents](https://opencode.ai/docs/permissions/#agents); relevant for orchestrator/interview tier config.

| Plan | Relation to tool permissions |
|------|------------------------------|
| **FileSafe.md** | Command blocklist ≈ bash deny; write scope ≈ edit path allowlist; security filter ≈ read path deny (.env). Central policy engine; permission + FileSafe both apply. |
| **FileManager.md** | Workspace roots, open paths; external_directory and path rules may affect File Manager/editor exposure. |
| **assistant-chat-design.md** | YOLO/Regular (§3); approve for session ≈ always; bash audit trail and FileSafe. |
| **orchestrator-subagent-integration.md** | Run config snapshot includes tool permissions; headless ask → deny or HITL; tier/subagent overrides. |
| **interview-subagent-integration.md** | Same run config and permission snapshot for interview runs. |

---

