# Claude Code Extension in Cursor — MCP & Updates

## Global install (recommended if project config isn't seen)

If Cursor or the Claude Code extension still don't see project-level config, install the same MCP servers into **Cursor's global config** so they load no matter which folder is open:

```bash
./scripts/install-mcp-global-cursor.sh
```

This writes to `~/.cursor/mcp.json`. **Quit Cursor completely and reopen it** (not just Reload Window) so it loads the global file. After that, context7, context7-local, and gui-automation should appear in MCP/tools.

---

## The app must see the right file (workspace root)

Cursor and the Claude Code extension decide "project root" from the **workspace folder** you open. If you open a **parent** folder (e.g. "Cursor" or your home), they look for MCP config in that folder — not in this repo — so they never see our config.

**Do this:**
1. **File → Open Folder** and choose the **repo folder** itself (the one that contains `.cursor/`, `.claude/`, `.mcp.json`).
2. Do **not** open "Cursor" or a parent; the workspace root must be this repo.
3. Restart Cursor (or Reload Window) after opening the correct folder.

To confirm the path the repo expects, run:
```bash
./scripts/which-mcp-config-path.sh
```
It prints the repo root path to open in Cursor.

**We put MCP config in four places** so whichever path/filename the app looks for, it finds it:
- `.mcp.json` (project root) — Claude Code project scope
- `mcp.json` (project root) — in case the app looks for no-dot name
- `.cursor/mcp.json` — Cursor project MCP (with `${workspaceFolder}` paths)
- `.claude/mcp.json` — in case the extension looks inside `.claude/`

---

## CLI vs extension use different paths (why extension can't see project .mcp.json)

The **CLI** uses your **terminal cwd** (e.g. `<repo-root>`) to find `.mcp.json`. The **extension** uses the **workspace path** that Cursor reports, which can be different (e.g. another mount or normalization). So the extension may look for `.mcp.json` in a different directory and not find it. See **`.cursor/MCP-CLI-vs-EXTENSION-PATHS.md`** for details.

**Fix:** Add the same MCP servers to **user scope** in `~/.claude.json` so the extension sees them regardless of workspace path:

```bash
./scripts/add-claude-user-mcp.sh
```

Then restart Cursor and open a new Claude Code session; run `/mcp` to confirm.

---

## Alternative: user-scope via CLI (user-scope fallback)

You can also add servers to user scope with the CLI (same effect as the script above):

```bash
./scripts/setup-claude-mcp-user-scope.sh
```

Then fully quit Cursor and reopen it, and open a new Claude Code session. Run `/mcp` in Claude Code to confirm the servers appear.

---

## Why two MCP config files?

| Config file | Used by | Purpose |
|-------------|---------|---------|
| **`.cursor/mcp.json`** | Cursor IDE (built-in AI, Cursor MCP) | Project MCP for Cursor’s native features |
| **`.mcp.json`** (project root) | **Claude Code extension** | Project MCP for the Claude Code extension |

The **Claude Code extension** does **not** read `.cursor/mcp.json`. It reads project MCP only from **`.mcp.json`** at the project root (see [Claude Code settings](https://code.claude.com/docs/en/settings)).

- **CLI** (`claude` in terminal): Uses its own config (e.g. `claude mcp add` → `~/.claude.json`) or `--mcp-config` path.
- **Extension** (Claude in Cursor): Uses **`.mcp.json`** in the project root.

Both `.cursor/mcp.json` and `.mcp.json` are kept in sync in this repo so Cursor and the Claude Code extension see the same MCP servers (context7, context7-local, gui-automation).

---

## Extension not updating in Cursor

The Claude Code extension often **does not auto-update** inside Cursor (known issue: [anthropics/claude-code#3574](https://github.com/anthropics/claude-code/issues/3574), [anthropics/claude-code#11236](https://github.com/anthropics/claude-code/issues/11236)).

### Workaround: install from VSIX (recommended)

1. Install Claude Code CLI globally so you get the bundled VSIX:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
2. Find the VSIX path (replace `USER` with your username if needed):
   - Linux: `$(npm root -g)/@anthropic-ai/claude-code/vendor/claude-code.vsix`
   - Or run: `npm root -g` then look under `@anthropic-ai/claude-code/vendor/claude-code.vsix`
3. In Cursor: **Ctrl+Shift+P** (or Cmd+Shift+P on Mac) → **“Extensions: Install from VSIX...”** → select that `.vsix` file.
4. Reload the window if prompted (or restart Cursor).

After that, to “update” the extension, run `npm install -g @anthropic-ai/claude-code` again and re-run “Install from VSIX...” with the new file.

---

## Project settings that enable MCP

This repo has **`.claude/settings.json`** with `enableAllProjectMcpServers: true` so the Claude Code extension auto-approves all servers defined in **`.mcp.json`** (no approval prompt).

## After changing MCP config

- **Cursor**: Reload window (Developer: Reload Window) so `.cursor/mcp.json` is picked up.
- **Claude Code extension**: Fully close the Claude Code panel/session and start a new one so it reloads `.mcp.json` and `.claude/settings.json`. Open the repo as the **single workspace folder** (File → Open Folder → this repo) so the extension sees `.mcp.json` at the workspace root.
