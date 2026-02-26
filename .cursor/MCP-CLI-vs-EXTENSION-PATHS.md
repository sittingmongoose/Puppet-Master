# Where CLI vs extension look for MCP config

## CLI (terminal)

- **Binary**: Native install at `~/.local/share/claude/versions/<ver>` (or npm global).
- **Project root**: The **current working directory (cwd)** when you run `claude` — e.g. `~/Cursor/<repo>` → `/home/<user>/Cursor/<repo>`.
- **Project MCP**: Reads **`.mcp.json`** from that cwd.
- **User config**: **`~/.claude.json`** — `projects["<path>"]` is keyed by that same path; user-scope MCP can live at top-level `mcpServers`.

So when you run `claude` in the repo terminal, it uses **`<repo-root>`** and finds `.mcp.json` there.

---

## Extension (inside Cursor)

- **Process**: Started by Cursor; may use the same native binary or an extension bundle.
- **Project root**: Comes from **Cursor’s workspace API** (e.g. the folder you opened), not from the terminal cwd. Cursor can report a **different path** (e.g. different mount, URI normalization, or multi-root).
- **Project MCP**: Extension looks for **`.mcp.json`** at whatever path Cursor reports as the workspace folder. If that path is different (e.g. `/mnt/user/Cursor/<repo>` on another mount), the file there may not exist and the extension sees no project MCP.
- **User config**: Same **`~/.claude.json`**. User-scope MCP (top-level `mcpServers`) is available in **all** projects and does not depend on workspace path.

So if the extension’s “workspace path” is not the same as the CLI’s cwd, it won’t see project `.mcp.json`. **User-scope MCP in `~/.claude.json`** is the reliable way to make the same servers visible in the extension regardless of path.

---

## What we did

1. **Doc** (this file): Explains CLI vs extension paths.
2. **Script** `scripts/add-claude-user-mcp.sh`: Merges the three MCP servers (context7, context7-local, gui-automation) into **top-level `mcpServers`** in `~/.claude.json` so the extension sees them as user-scope MCP in every project.
3. After running the script, **restart Cursor** and open a new Claude Code session; run `/mcp` to confirm.
