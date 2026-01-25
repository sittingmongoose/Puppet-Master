# Project Setup Guide - All Supported Platforms

This guide explains how to set up a new project for RWM Puppet Master with all supported platforms:

## Supported Platforms

**IDE Extensions (VS Code/Cursor):**
- **Codex** - OpenAI Codex extension (no wrapper scripts, stock config)
- **Claude Code** - Anthropic Claude Code extension (stock config)

**Standalone CLI Tools:**
- **Cursor** - `cursor-agent` CLI
- **Gemini** - `gemini` CLI (Google Gemini CLI)
- **Copilot** - `copilot` CLI (GitHub Copilot CLI)
- **Antigravity** - `agy` launcher (Google Antigravity, GUI-only)

This guide focuses on **Codex** and **Claude Code** extension setup (no wrapper scripts, stock configuration). For standalone CLI tool installation, see the sections below.

## Conventions / Variables

- `{PROJECT_NAME}`: Folder name under `/mnt/user/Cursor/` (may include spaces), e.g. `Rom Runner`
- `{PROJECT_SLUG}`: Same name but safe for filenames, e.g. `rom-runner`
- `{CONTEXT7_API_KEY}`: Your Context7 key (do not commit)

## Overview

When working on a remote server via SSH, you typically only need:
1. **VS Code/Cursor settings** (optional) - Quality-of-life project settings
2. **MCP configurations** (optional) - For Context7 integration
3. **CLAUDE.md file** (optional) - For Claude Code project rules

---

## Step 1: Keep Codex stock (no wrappers)

Do **not** create wrapper scripts and do **not** pin Codex to a custom CLI path.

In particular, leave `chatgpt.cliExecutable` **unset / `null`**. The Codex extension ships with its own CLI binary; overriding it is fragile and can break extension startup.

### If Codex shows an infinite spinner

Check the Codex extension log on the remote host. A common failure mode is a stale `chatgpt.cliExecutable` pointing at a non-existent wrapper path, e.g.:

```text
Failed to spawn codex mcp process at /usr/local/bin/codex-RWM-Puppet-Master
Error: spawn /usr/local/bin/codex-RWM-Puppet-Master ENOENT
```

**Reset to stock:** remove/clear the `chatgpt.cliExecutable` setting and reload the window.

---

## Step 2: Optional project settings (safe, stock-compatible)

Create `.vscode/settings.json` in your project root only if you want project-scoped quality-of-life settings. These settings are compatible with stock Codex/Claude Code (no wrappers).

### 2.1 Minimal Settings Template

```json
{
  // Make sure key extensions are always installed on the SSH host.
  "remote.SSH.defaultExtensions": [
    "openai.codex",
    "anthropic.claude-code"
  ],

  // Optional: Set terminal working directory to project root
  "terminal.integrated.cwd": "${workspaceFolder}",

  // Disable PowerShell on Linux (PowerShell scripts in bin/ are for Windows only)
  "powershell.enabled": false,
  "terminal.integrated.defaultProfile.linux": "bash"
}
```

---

## Step 3: Configure Context7 MCP (Codex + Cursor + Claude Code)

Context7 typically exposes MCP **tools** (resolve/query), not MCP **resources**. It’s normal for `list_mcp_resources` to be empty even when Context7 is working.

### 3.1 Install Context7 MCP Locally (Recommended)

To avoid relying on `npx` downloads (and to keep each project self-contained), install the server under `.codex/`:

```bash
cd "/mnt/user/Cursor/{PROJECT_NAME}"
mkdir -p .codex
cd .codex
npm init -y
npm install -D @upstash/context7-mcp
```

The entrypoint will be:

`/mnt/user/Cursor/{PROJECT_NAME}/.codex/node_modules/@upstash/context7-mcp/dist/index.js`

Context7 supports both:

- `--api-key {CONTEXT7_API_KEY}`
- or `CONTEXT7_API_KEY` environment variable

### 3.1.1 Keep Secrets Out of Git

Recommended patterns:

- Track `{PROJECT}/.codex/config.toml` (settings), but ignore everything else under `.codex/` (auth, sessions, node_modules).
- Keep `{PROJECT}/.cursor/mcp.json` local-only (it often contains secrets).

Example `{PROJECT}/.codex/.gitignore`:

```gitignore
*
!.gitignore
!config.toml
!AGENTS.md
```

### 3.2 Codex MCP (Project-Local)

Codex can load MCP servers from `{PROJECT}/.codex/config.toml`. Add (or update) this block:

```toml
[mcp_servers.context7]
command = "node"
args = ["/mnt/user/Cursor/{PROJECT_NAME}/.codex/node_modules/@upstash/context7-mcp/dist/index.js", "--api-key", "{CONTEXT7_API_KEY}"]
```

Notes:
- Prefer **absolute** paths here; Codex/Cursor can spawn servers with a non-project working directory.
- If you don’t want the key in config, use `codex mcp add` with `--env` instead (example below).

Alternative (CLI-managed MCP entry, no secrets in `config.toml`):

```bash
cd "/mnt/user/Cursor/{PROJECT_NAME}"
codex mcp add context7 \
  --env CONTEXT7_API_KEY="{CONTEXT7_API_KEY}" \
  -- node "/mnt/user/Cursor/{PROJECT_NAME}/.codex/node_modules/@upstash/context7-mcp/dist/index.js" --transport stdio
```

### 3.3 Cursor MCP (Global or Per-Project)

Cursor supports MCP configuration in two common places:

1) **Global (remote)**: `/root/.cursor/mcp.json` (applies to all projects)
2) **Per-project (recommended when you need overrides)**: `{PROJECT}/.cursor/mcp.json`

If you want Cursor to use the local stdio server (recommended when you want consistent behavior across projects), use:

```json
{
  "mcpServers": {
    "context7": {
      "command": "node",
      "args": [
        "/mnt/user/Cursor/{PROJECT_NAME}/.codex/node_modules/@upstash/context7-mcp/dist/index.js",
        "--api-key",
        "{CONTEXT7_API_KEY}"
      ]
    }
  }
}
```

If you use a per-project `{PROJECT}/.cursor/mcp.json`, keep it **out of git** (it contains secrets).

### 3.4 Claude Code MCP (Project-Local)

Add Context7 MCP to Claude Code (stored under `.claude/_state/.claude.json`):

**Recommended: Use `npx` (works reliably in both CLI and GUI):**

```bash
cd "/mnt/user/Cursor/{PROJECT_NAME}"
claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key "{CONTEXT7_API_KEY}"
```

**Alternative: Use direct node path (faster startup, but may timeout in GUI):**

```bash
cd "/mnt/user/Cursor/{PROJECT_NAME}"
claude mcp add context7 -- \
  node "/mnt/user/Cursor/{PROJECT_NAME}/.codex/node_modules/@upstash/context7-mcp/dist/index.js" --api-key "{CONTEXT7_API_KEY}"
```

**Note:** The `npx` approach is recommended because:
- It works reliably in both CLI and GUI
- It automatically handles package installation and caching
- It matches the working configuration used in all three projects (RWM Puppet Master, Cacherr, Rom Runner)

This will:
- Add Context7 MCP to `.claude/_state/.claude.json`
- Configure it with your API key (don’t commit the generated state file if it contains secrets)

### 3.5 Create CLAUDE.md File

Create `.claude/CLAUDE.md` in your project root:

```markdown
# {PROJECT_NAME} — Claude Code Notes

## Goal
Work only inside this repository and keep changes small and reviewable.

## Workflow
- Prefer a short plan first, then implement.
- Run relevant tests/linters after changes (fill in commands below).

## Commands (fill these in)
- Install:
- Dev:
- Test:
- Lint:

## Conventions
- Don't add secrets or tokens to the repo.
- Keep edits focused; avoid drive-by refactors.
- Always use the Context7 MCP server when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
```

---

## Step 4: Windows User Settings (Client-Side Configuration)

On your **Windows client machine**, configure Cursor's user settings to properly connect to the SSH remote server.

### 4.1 Windows User Settings File

Location: `C:\Users\sitti\AppData\Roaming\Cursor\User\profiles\{PROFILE_ID}\settings.json`

Or the main user settings: `C:\Users\sitti\AppData\Roaming\Cursor\User\settings.json`

Add these settings:

```json
{
  // SSH Remote Connection Settings
  "remote.SSH.useLocalServer": false,
  "remote.SSH.showLoginTerminal": true,
  
  // Specify the remote platform for your SSH host
  // Replace "unraid" or your SSH hostname with the actual Host name from your SSH config
  "remote.SSH.remotePlatform": {
    "unraid": "linux"
  },
  
  // Auto-forward ports for better remote development
  "remote.autoForwardPorts": true,
  "remote.autoForwardPortsSource": "hybrid",
  
  // Ensure extensions are installed on remote
  "remote.SSH.defaultExtensions": [
    "openai.codex",
    "anthropic.claude-code"
  ]
}
```

**Important:** The `remote.SSH.remotePlatform` key must match the `Host` name in your Windows SSH config file (`C:\Users\sitti\.ssh\config`).

### 4.2 Windows SSH Config File

Your Windows SSH config file is located at: `C:\Users\sitti\.ssh\config`

**Example SSH config entry:**

```
Host unraid
  HostName 192.168.50.223
  User root
  Port 22
  # Add your SSH key path if using key-based auth
  # IdentityFile C:\Users\sitti\.ssh\id_rsa
```

**Important Notes:**
- The `Host` name (e.g., "unraid") is what you use in `remote.SSH.remotePlatform` in your Windows user settings
- The `HostName` should be the actual IP address or hostname of your remote server
- If using key-based authentication, uncomment and set the `IdentityFile` path
- The `User` should match the user account on the remote server (typically `root` for Unraid)

**Multiple Host Entries (if needed):**
```
Host unraid
  HostName 192.168.50.223
  User root
  Port 22

Host backup-server
  HostName 192.168.50.100
  User admin
  Port 2222
```

### 4.3 Connecting to Remote

1. In Cursor on Windows, press `Ctrl+Shift+P`
2. Type: `Remote-SSH: Connect to Host...`
3. Select your SSH host (e.g., "unraid")
4. Cursor will open a new window connected to the remote server
5. Open your project folder: `File > Open Folder > /mnt/user/Cursor/{PROJECT_NAME}`

---

## Step 5: Global Cursor MCP Configuration (Optional One-Time Setup)

If you want Context7 available by default in every workspace, you can add a global MCP config on the **remote server** at `/root/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "{CONTEXT7_API_KEY}"
      }
    }
  }
}
```

This is a **global** configuration that applies to all projects.

**Note:** This file is on the **remote server** at `/root/.cursor/mcp.json`, not on your Windows machine.

If you run into project-specific issues (sandboxing, working directory, offline mode), prefer a per-project `{PROJECT}/.cursor/mcp.json` using the local stdio server in Step 3.3.

---

## Step 6: Verify Setup

### 6.1 Verify Codex extension is stock

- Ensure `chatgpt.cliExecutable` is unset / `null`.
- Reload the Cursor window.
- Open the Codex sidebar and confirm it loads (no infinite spinner).

### 6.3 Verify Claude Code MCP

```bash
cd "/mnt/user/Cursor/{PROJECT_NAME}"
claude mcp list
```

Should show `context7` as connected.

### 6.4 Verify Codex MCP

```bash
cd "/mnt/user/Cursor/{PROJECT_NAME}"
codex mcp list
codex mcp get context7
```

---

## Quick Reference: File Locations

| Component | Location | Notes |
|-----------|----------|-------|
| **VS Code Settings** | `{PROJECT}/.vscode/settings.json` | Project-specific |
| **Claude MCP Config** | `{PROJECT}/.claude/_state/.claude.json` | Auto-generated by `claude mcp add` |
| **CLAUDE.md** | `{PROJECT}/.claude/CLAUDE.md` | Project-specific rules |
| **Cursor MCP Config** | `~/.cursor/mcp.json` (remote) | Global, shared across all projects |
| **Cursor MCP Config (Override)** | `{PROJECT}/.cursor/mcp.json` | Per-project override (keep local-only) |
| **Windows User Settings** | `C:\Users\sitti\AppData\Roaming\Cursor\User\settings.json` | Client-side SSH config |
| **Windows SSH Config** | `C:\Users\sitti\.ssh\config` | SSH host definitions |
| **Codex Config** | `{PROJECT}/.codex/config.toml` | Project-specific (optional) |

---

## Deprecated: wrapper-based setup (removed)

This repo previously documented per-project wrapper scripts and `chatgpt.cliExecutable` overrides to force a project working directory.
That approach is **not stock**, is fragile across extension updates, and can break Codex startup (infinite spinner) if the wrapper path goes stale.
If you see a `chatgpt.cliExecutable` setting pointing at `/usr/local/bin/codex-...`, remove it to restore stock behavior.

## Important Notes

1. **Project Name Format**:
   - In file paths: Use exact project name (e.g., "My New Project")
   - In settings.json: Prefer `${workspaceFolder}` instead of hard-coded paths when possible

2. **SSH Remote Connection**:
   - **Windows Client**: Configure `C:\Users\sitti\AppData\Roaming\Cursor\User\settings.json` with SSH settings
   - **Windows SSH Config**: Set up `C:\Users\sitti\.ssh\config` with your remote host
   - **Project Settings**: `remote.SSH.defaultExtensions` ensures extensions are installed on the SSH host
   - **Connection**: Use `Remote-SSH: Connect to Host...` in Cursor to connect, then open the project folder

3. **Context7 API Key**:
   - Store `{CONTEXT7_API_KEY}` somewhere safe (environment variable, password manager, etc.)
   - Avoid committing it to git (prefer env vars or local-only config files)

---

## Troubleshooting

### Codex stuck on an infinite spinner
- Check the Codex extension log (for Remote-SSH, this is on the remote host under `/root/.cursor-server/data/logs/.../openai.chatgpt/Codex.log`)
- If you see errors like `Failed to spawn codex mcp process at /usr/local/bin/codex-...` or `ENOENT`, remove/clear `chatgpt.cliExecutable` so it is unset / `null`
- Reload the Cursor window

### Claude Code MCP Not Working
- Verify MCP is added: `claude mcp list`
- Check `.claude/_state/.claude.json` contains context7 configuration
- Ensure API key is correct
- **If CLI works but GUI shows "failed"**: 
  - Reload Cursor window (`Cmd/Ctrl+Shift+P` → "Developer: Reload Window")
  - The GUI may have a shorter timeout; using `npx` (recommended) handles this better than direct node paths
  - Warm up npx cache: `npx -y @upstash/context7-mcp --api-key {KEY} < /dev/null & sleep 3 && kill %1`

### Codex MCP Not Working
- Verify config exists: `{PROJECT}/.codex/config.toml`
- Verify Codex sees the server: `codex mcp list`
- If Context7 was configured with a relative path, switch to an absolute path

### Codex auth/config seems corrupted (optional reset)
- If Codex still fails after restoring stock settings, temporarily move aside `~/.codex` and restart Cursor to force a clean regen/re-auth.

### SSH Connection Issues
- Verify Windows SSH config has correct host entry
- Check `remote.SSH.remotePlatform` matches SSH config `Host` name
- Ensure SSH key permissions are correct: `chmod 600 ~/.ssh/id_rsa` (on Windows, use file properties)
- Test SSH connection directly: `ssh unraid` (or your host name)
- Check Windows firewall allows SSH connections

---

## Complete Setup Checklist

For a new project, you need to configure:

### On Remote Server (Linux/Unraid):
- [ ] Do **not** set `chatgpt.cliExecutable` (leave it unset / `null`)
- [ ] (Optional) Create `.vscode/settings.json` (stock-compatible settings only)
- [ ] (Optional) Run `claude mcp add context7` command
- [ ] Create `.claude/CLAUDE.md` file

### On Windows Client:
- [ ] Configure `C:\Users\sitti\AppData\Roaming\Cursor\User\settings.json` with SSH settings
- [ ] Set up `C:\Users\sitti\.ssh\config` with SSH host entry
- [ ] Connect via `Remote-SSH: Connect to Host...` in Cursor
- [ ] Open project folder on remote server

### Global (One-Time):
- [ ] (Optional) Remote server: `/root/.cursor/mcp.json` (Context7 MCP for Cursor)

---

---

## AI Agent Setup Checklist

When setting up a new project, an AI agent should follow these steps in order:

### 1. Keep Codex stock (no wrappers)
- [ ] Do **not** create wrapper scripts
- [ ] Do **not** set `chatgpt.cliExecutable` (leave it unset / `null`)

### 2. Create Project Settings (on remote server, optional)
- [ ] Create `.vscode/settings.json` in project root
- [ ] Add `remote.SSH.defaultExtensions` array with `"openai.codex"` and `"anthropic.claude-code"`
- [ ] Add optional quality-of-life settings (files.exclude, search.exclude, etc.)

### 3. Install Context7 MCP (on remote server)
- [ ] Create `.codex/` directory in project root
- [ ] Create `package.json`: `cd .codex && npm init -y`
- [ ] Install Context7: `npm install -D @upstash/context7-mcp`
- [ ] Verify installation: `test -f .codex/node_modules/@upstash/context7-mcp/dist/index.js`

### 4. Configure Codex MCP (on remote server)
- [ ] Create or update `.codex/config.toml`
- [ ] Add `[mcp_servers.context7]` block with absolute path to `node_modules/@upstash/context7-mcp/dist/index.js`
- [ ] Include `--api-key {CONTEXT7_API_KEY}` in args array
- [ ] Verify (if Codex CLI is installed): `codex mcp list` shows context7 as enabled

### 5. Configure Claude Code MCP (on remote server)
- [ ] Run: `claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key {CONTEXT7_API_KEY}`
- [ ] Verify: `claude mcp list` shows `✓ Connected`
- [ ] If GUI shows "failed" but CLI works, reload Cursor window

### 6. Create CLAUDE.md (on remote server)
- [ ] Create `.claude/CLAUDE.md` with project-specific rules
- [ ] Include instruction to use Context7 MCP server

### 7. Configure Windows Client (one-time, if not already done)
- [ ] Edit `C:\Users\sitti\AppData\Roaming\Cursor\User\settings.json`
- [ ] Add `remote.SSH.remotePlatform` with host name matching SSH config
- [ ] Add `remote.SSH.defaultExtensions` array
- [ ] Ensure `C:\Users\sitti\.ssh\config` has correct host entry
- [ ] Test SSH connection: `ssh {HOST_NAME}`

### 8. Verify Everything Works
- [ ] Open Codex sidebar and verify no infinite spinner
- [ ] Test Claude MCP: `claude mcp list`
- [ ] Test Codex MCP (if Codex CLI is installed): `codex mcp list`
- [ ] Connect via Remote-SSH in Cursor
- [ ] Open project folder
- [ ] If issues, check extension output logs

---

## Installing Standalone CLI Tools

### Gemini CLI

**Installation:**
```bash
# npm (recommended)
npm install -g @google/gemini-cli

# Homebrew (macOS/Linux)
brew install gemini-cli
```

**Authentication:**
- Run `gemini` and complete OAuth flow
- Or set `GOOGLE_API_KEY` environment variable
- Or configure Vertex AI credentials

**Configuration Notes:**
- Default CLI path: `gemini`
- Headless mode: `-p "prompt" --output-format json --approval-mode yolo`
- Model selection: `--model gemini-2.5-pro` (or other supported models)
- Plan Mode: Requires `experimental.plan: true` in Gemini CLI settings for `--approval-mode plan`

**Context Files (Custom Instructions):**

Gemini CLI reads custom instructions from `GEMINI.md` files:
- `~/.gemini/GEMINI.md` - User-level instructions (applied to all projects)
- `GEMINI.md` in project root - Project-specific instructions
- Files are searched up the directory tree from cwd to root

Recommended for RWM Puppet Master projects:
- Create `GEMINI.md` in project root with project-specific conventions
- Instructions from `AGENTS.md` can be copied to `GEMINI.md` for Gemini CLI awareness

### GitHub Copilot CLI

**Installation:**
```bash
# npm (recommended)
npm install -g @github/copilot

# Homebrew (macOS/Linux)
brew install copilot-cli

# WinGet (Windows)
winget install GitHub.Copilot

# curl (Unix-like)
curl -fsSL https://gh.io/copilot-install | bash
```

**Authentication:**
- Run `copilot` and use `/login` command
- Or set `GH_TOKEN` or `GITHUB_TOKEN` environment variable with "Copilot Requests" permission
- Requires active GitHub Copilot subscription (Individual, Business, or Enterprise)

**Configuration Notes:**
- Default CLI path: `copilot`
- Headless mode: `-p "prompt" --allow-all-tools --allow-all-paths --silent --stream off`
- Model selection: Use `/model` command interactively (programmatic selection not documented)

**Model Selection Limitation (P0-G16):**

> ⚠️ **Important:** The Copilot CLI does **NOT** support programmatic model selection via command-line flags.
> 
> If you configure a `model` in your Puppet Master config for the Copilot platform, it will be **ignored** 
> when using the CLI runner (`CopilotRunner`). The default model (Claude Sonnet 4.5) will be used instead.

**Context Files (Custom Instructions):**

Copilot CLI automatically reads context files for custom instructions. These files are loaded in order:
1. `CLAUDE.md` (in project root and cwd)
2. `GEMINI.md` (in project root and cwd)
3. `AGENTS.md` (in git root & cwd)
4. `.github/instructions/**/*.instructions.md` (in git root & cwd)
5. `.github/copilot-instructions.md` (repository-wide)
6. `$HOME/.copilot/copilot-instructions.md` (user-level)
7. Directories in `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` environment variable

Recommended for RWM Puppet Master projects:
- Create `AGENTS.md` in project root with project-specific conventions
- Optionally create `.github/copilot-instructions.md` for repository-wide instructions
>
> **Workarounds:**
> 1. **Use the SDK Runner:** `CopilotSdkRunner` supports model selection via `SessionConfig.model`. 
>    This requires `@github/copilot-sdk` to be installed.
> 2. **Interactive Mode:** Use `/model` command in interactive Copilot sessions (not automated).
> 3. **GitHub Settings:** Configure preferred models in your GitHub account settings at 
>    github.com → Settings → Copilot → Model preferences.

### Google Antigravity

**Installation:**
- Manual download from https://antigravity.google/download
- Install the desktop application
- The launcher command is typically `agy` or `antigravity`

**Authentication:**
- Google account via Antigravity GUI

**Configuration Notes:**
- Default CLI path: `agy` (or `antigravity` on some systems)
- **Headless mode: NOT AVAILABLE** - Antigravity is GUI-only
- For headless automation, use `gemini` platform instead
- Antigravity features:
  - Rules: `~/.gemini/GEMINI.md` (global), `.agent/rules/` (workspace)
  - Workflows: Markdown files invoked via `/workflow-name`
  - Skills: `.agent/skills/` (workspace), `~/.gemini/antigravity/global_skills/` (global)
  - Fast Mode vs Planning Mode available in GUI
  - Model selection: Reasoning Model selector in GUI (includes Gemini, Claude, GPT-OSS models)

**Troubleshooting:**
- If `agy` command not found, check if the executable is named `antigravity` instead
- Update `cliPaths.antigravity` in Puppet Master config to match your system's executable name
- Puppet Master will show a clear error if Antigravity is selected for automation (use `gemini` instead)

---

*Last updated: 2026-01-22*
