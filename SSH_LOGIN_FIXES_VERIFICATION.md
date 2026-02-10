# SSH Verification for Login Page Fixes (2026-02-10)

## Mac (jaredsmacbookair@192.168.50.115)

**PATH when SSH (non-interactive):** `/Users/jaredsmacbookair/.cargo/bin:/usr/bin:/bin:/usr/sbin:/sbin`  
- Does NOT include `/opt/homebrew/bin` or `/usr/local/bin`
- When GUI launches from Desktop/dock, PATH may be even more minimal

**Findings:**
- `gh` not in Homebrew (`/opt/homebrew/bin/gh` does not exist on this Mac)
- `agent` not found in PATH; Cursor agent CLI may not be installed
- No `auth.json` in `~/.config/cursor`, `~/.cursor`, or `~/Library/Application Support/Cursor`
- `~/.cursor/cli-config.json` exists (IDE config, not auth)

**Implication:** Our PATH prepend (extra paths before current PATH) will help when gh is installed via Homebrew. If gh is not installed, CLI_NOT_FOUND is expected.

---

## Linux (sittingmongoose@192.168.50.72)

**Findings:**
- `gh` at `/usr/bin/gh`
- `codex` at `/usr/bin/codex`
- `agent` at `~/.local/bin/agent` (symlink to cursor-agent)
- `~/.config/cursor/` exists but empty (no auth.json)
- `~/.cursor/` has cli-config.json, ide_state.json, mcp.json (no auth.json)

**Implication:** auth-status.ts checks `~/.config/cursor/auth.json` and `~/.cursor/auth.json`. When user runs `agent login`, auth may be written elsewhere. Our added paths (cursor-agent, etc.) remain valid. Linux logout should work as gh and codex are in standard paths.

---

## Windows (sitti@192.168.50.253)

**Findings:**
- `C:\Users\sitti\AppData\Local\cursor-agent\agent.cmd` — EXISTS
- `C:\Users\sitti\AppData\Local\cursor-agent\cursor-agent.cmd` — EXISTS
- `C:\Users\sitti\AppData\Roaming\npm\codex.cmd` — EXISTS
- `C:\Users\sitti\AppData\Roaming\npm\codex` (no extension) — EXISTS

**Implication:** Our `getExtraPathDirectories` includes:
- `%LOCALAPPDATA%\cursor-agent` ✓
- `%APPDATA%\npm` ✓

With `shell: true` for Windows logout spawn, `agent.cmd` and `codex.cmd` should resolve via PATHEXT when these directories are in enriched PATH.

---

## Summary

| Platform | gh | agent | codex | auth.json location |
|----------|-----|-------|-------|---------------------|
| Mac | Not in Homebrew | Not found | — | Not found in checked paths |
| Linux | /usr/bin/gh | ~/.local/bin/agent | /usr/bin/codex | ~/.config/cursor empty |
| Windows | — | cursor-agent/agent.cmd | npm/codex.cmd | — |

Implemented fixes (PATH prepend, Windows paths, shell spawn) align with these findings.
