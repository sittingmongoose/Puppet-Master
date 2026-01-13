# Project Setup Guide - Cursor/Codex/Claude Code Configuration

This guide explains how to set up a new project with all the necessary wrappers and settings for Cursor, Codex, and Claude Code extensions when working over SSH.

## Conventions / Variables

- `{PROJECT_NAME}`: Folder name under `/mnt/user/Cursor/` (may include spaces), e.g. `Rom Runner`
- `{PROJECT_SLUG}`: Same name but safe for filenames, e.g. `rom-runner`
- `{CONTEXT7_API_KEY}`: Your Context7 key (do not commit)

## Overview

When working on a remote server via SSH, you need:
1. **Wrapper scripts** - So extensions launch in the correct project directory
2. **VS Code/Cursor settings** - To tell extensions where to find the wrappers
3. **MCP configurations** - For Context7 integration
4. **CLAUDE.md file** - For Claude Code project rules

---

## Step 1: Create Wrapper Scripts

Create two wrapper scripts in `/usr/local/bin/` for each project.

### 1.1 Claude Code Wrapper

Create `/usr/local/bin/claude-{PROJECT_SLUG}` (replace `{PROJECT_SLUG}` with a hyphenated project slug, e.g. `my-new-project`):

```bash
#!/bin/sh
PROJECT_DIR="/mnt/user/Cursor/{PROJECT_NAME}"
cd "$PROJECT_DIR" || exit 1

# Ensure HOME is set so Claude Code can find global IDE lock files
export HOME="${HOME:-/root}"

# Set Claude Code configuration directory
export CLAUDE_CONFIG_DIR="$PROJECT_DIR/.claude/_state"

# Create symlink from project-specific IDE directory to global IDE directory
# This ensures Claude Code CLI can find IDE lock files even with project-specific config
PROJECT_IDE_DIR="$PROJECT_DIR/.claude/_state/ide"
GLOBAL_IDE_DIR="/root/.claude/ide"
if [ ! -e "$PROJECT_IDE_DIR" ] || [ ! -L "$PROJECT_IDE_DIR" ]; then
    rm -rf "$PROJECT_IDE_DIR" 2>/dev/null
    ln -sf "$GLOBAL_IDE_DIR" "$PROJECT_IDE_DIR" 2>/dev/null
fi

# Set environment variables for IDE detection
export CURSOR_WORKSPACE_FOLDER="$PROJECT_DIR"
export VSCODE_AGENT_FOLDER="${VSCODE_AGENT_FOLDER:-/root/.cursor-server}"
export VSCODE_CWD="$PROJECT_DIR"  # Override Cursor's default /root

# Find and set VSCODE_IPC_HOOK_CLI (most recent active socket by modification time)
IPC_SOCKET=$(find /run/user/0 -name "vscode-ipc-*.sock" -type s -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2- | sed 's/=$//')
if [ -z "$IPC_SOCKET" ]; then
    # Fallback: if find doesn't support -printf, use ls -t
    IPC_SOCKET=$(ls -t /run/user/0/vscode-ipc-*.sock 2>/dev/null | head -1 | sed 's/=$//')
fi
if [ -n "$IPC_SOCKET" ] && [ -S "$IPC_SOCKET" ]; then
    export VSCODE_IPC_HOOK_CLI="$IPC_SOCKET"
fi

# Add cursor command to PATH - find cursor binary dynamically or use symlink
CURSOR_BIN=$(find /root/.cursor-server -name "cursor" -type f -path "*/remote-cli/cursor" 2>/dev/null | head -1)
if [ -n "$CURSOR_BIN" ] && [ -f "$CURSOR_BIN" ]; then
    export PATH="$(dirname "$CURSOR_BIN"):$PATH"
elif [ -f "/usr/local/bin/cursor" ]; then
    # Use symlink if it exists
    export PATH="/usr/local/bin:$PATH"
fi

exec /root/.local/bin/claude "$@"
```

**Make it executable:**
```bash
chmod +x /usr/local/bin/claude-{PROJECT_SLUG}
```

### 1.2 Codex Wrapper

Create `/usr/local/bin/codex-{PROJECT_SLUG}`:

```bash
#!/bin/sh
# Ensure a predictable PATH when launched from Finder.
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

PROJECT_DIR="/mnt/user/Cursor/{PROJECT_NAME}"
CODEX_HOME="$PROJECT_DIR/.codex"
CODEX_BIN="/root/.cursor-server/extensions/openai.chatgpt-0.4.58-universal/bin/linux-x86_64/codex"

cd "$PROJECT_DIR" || exit 1
export CODEX_HOME
export VSCODE_CWD="$PROJECT_DIR"
exec "$CODEX_BIN" "$@"
```

**Make it executable:**
```bash
chmod +x /usr/local/bin/codex-{PROJECT_SLUG}
```

**Note:** If your system is ARM64 (not x86_64), change `linux-x86_64` to `linux-aarch64` in the CODEX_BIN path.

### 1.3 Why the Codex Wrapper Matters (Isolation)

The two key lines for project isolation are:

- `CODEX_HOME="$PROJECT_DIR/.codex"`: keeps Codex auth, sessions, and MCP config isolated per project
- `cd "$PROJECT_DIR"` + `VSCODE_CWD="$PROJECT_DIR"`: ensures relative paths resolve correctly and file links work from Cursor

---

## Step 2: Create VS Code/Cursor Settings

Create `.vscode/settings.json` in your project root. This file tells the Codex and Claude Code extensions which wrapper scripts to use.

### 2.1 Complete Settings Template

```json
{
    // Make sure key extensions are always installed on the SSH host.
    "remote.SSH.defaultExtensions": [
      "openai.codex",
      "anthropic.claude-code"
    ],
  
    // Quality-of-life defaults (safe, project-scoped).
    "files.exclude": {
      "**/.git": true,
      "**/.DS_Store": true
    },
    "search.exclude": {
      "**/.git": true
    },
    
    // Point Codex extension to your wrapper script (REQUIRED)
    "chatgpt.cliExecutable": "/usr/local/bin/codex-{PROJECT_SLUG}",
    
    // Point Claude Code extension to your wrapper script (REQUIRED)
    "claudeCode.claudeProcessWrapper": "/usr/local/bin/claude-{PROJECT_SLUG}",
    
    // Optional: Set terminal working directory to project root
    "terminal.integrated.cwd": "${workspaceFolder}",
    
    // Disable PowerShell on Linux (PowerShell scripts in bin/ are for Windows only)
    "powershell.enabled": false,
    "terminal.integrated.defaultProfile.linux": "bash"
}
```

**Important:** Replace `{PROJECT_SLUG}` with your actual project slug (hyphenated, lowercase). For example:
- Project name: "RWM Puppet Master" → slug: "RWM-Puppet-Master"
- Project name: "Cacherr" → slug: "cacherr"
- Project name: "Rom Runner" → slug: "romrunner"

### 2.2 Real-World Examples

**RWM Puppet Master** (minimal):
```json
{
    "claudeCode.claudeProcessWrapper": "/usr/local/bin/claude-RWM-Puppet-Master"
}
```

**Cacherr** (complete):
```json
{
    "remote.SSH.defaultExtensions": [
      "openai.codex",
      "anthropic.claude-code"
    ],
    "files.exclude": {
      "**/.git": true,
      "**/.DS_Store": true
    },
    "search.exclude": {
      "**/.git": true
    },
    "chatgpt.cliExecutable": "/usr/local/bin/codex-cacherr",
    "claudeCode.claudeProcessWrapper": "/usr/local/bin/claude-cacherr",
    "powershell.enabled": false,
    "terminal.integrated.defaultProfile.linux": "bash"
}
```

**Rom Runner** (with terminal cwd):
```json
{
    "remote.SSH.defaultExtensions": [
      "openai.codex",
      "anthropic.claude-code"
    ],
    "files.exclude": {
      "**/.git": true,
      "**/.DS_Store": true
    },
    "search.exclude": {
      "**/.git": true
    },
    "terminal.integrated.cwd": "${workspaceFolder}",
    "chatgpt.cliExecutable": "/usr/local/bin/codex-romrunner",
    "claudeCode.claudeProcessWrapper": "/usr/local/bin/claude-romrunner"
}
```

**Key Settings Explained:**
- `chatgpt.cliExecutable`: Absolute path to Codex wrapper script (required for Codex extension)
- `claudeCode.claudeProcessWrapper`: Absolute path to Claude Code wrapper script (required for Claude Code extension)
- `remote.SSH.defaultExtensions`: Ensures extensions are installed on the remote SSH host
- `terminal.integrated.cwd`: Sets terminal working directory to project root (optional but helpful)

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
/usr/local/bin/codex-{PROJECT_SLUG} mcp add context7 \
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
/usr/local/bin/claude-{PROJECT_SLUG} mcp add context7 -- npx -y @upstash/context7-mcp --api-key "{CONTEXT7_API_KEY}"
```

**Alternative: Use direct node path (faster startup, but may timeout in GUI):**

```bash
cd "/mnt/user/Cursor/{PROJECT_NAME}"
/usr/local/bin/claude-{PROJECT_SLUG} mcp add context7 -- \
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

### 6.1 Test Claude Code Wrapper

```bash
/usr/local/bin/claude-{PROJECT_SLUG} --version
```

Should output: `2.1.2 (Claude Code)` or similar.

### 6.2 Test Codex Wrapper

```bash
/usr/local/bin/codex-{PROJECT_SLUG} --version
```

Should output: `codex-cli 0.78.0` or similar.

### 6.3 Verify Claude Code MCP

```bash
cd "/mnt/user/Cursor/{PROJECT_NAME}"
/usr/local/bin/claude-{PROJECT_SLUG} mcp list
```

Should show `context7` as connected.

### 6.4 Verify Codex MCP

```bash
cd "/mnt/user/Cursor/{PROJECT_NAME}"
/usr/local/bin/codex-{PROJECT_SLUG} mcp list
/usr/local/bin/codex-{PROJECT_SLUG} mcp get context7
```

---

## Quick Reference: File Locations

| Component | Location | Notes |
|-----------|----------|-------|
| **Claude Wrapper** | `/usr/local/bin/claude-{PROJECT_SLUG}` | System-wide, executable |
| **Codex Wrapper** | `/usr/local/bin/codex-{PROJECT_SLUG}` | System-wide, executable |
| **VS Code Settings** | `{PROJECT}/.vscode/settings.json` | Project-specific |
| **Claude MCP Config** | `{PROJECT}/.claude/_state/.claude.json` | Auto-generated by `claude mcp add` |
| **CLAUDE.md** | `{PROJECT}/.claude/CLAUDE.md` | Project-specific rules |
| **Cursor MCP Config** | `~/.cursor/mcp.json` (remote) | Global, shared across all projects |
| **Cursor MCP Config (Override)** | `{PROJECT}/.cursor/mcp.json` | Per-project override (keep local-only) |
| **Windows User Settings** | `C:\Users\sitti\AppData\Roaming\Cursor\User\settings.json` | Client-side SSH config |
| **Windows SSH Config** | `C:\Users\sitti\.ssh\config` | SSH host definitions |
| **Codex Config** | `{PROJECT}/.codex/config.toml` | Project-specific (optional) |

---

## Current Working Setup (Verified Configuration)

This is how the “3 project” setup is structured when it’s working correctly:

### Project: RWM Puppet Master

**Wrapper Scripts:**
- Claude Code: `/usr/local/bin/claude-RWM-Puppet-Master`
- Codex: `/usr/local/bin/codex-RWM-Puppet-Master`

**Settings:**
- `.vscode/settings.json`: `claudeCode.claudeProcessWrapper: "/usr/local/bin/claude-RWM-Puppet-Master"`
- `CODEX_HOME`: `/mnt/user/Cursor/RWM Puppet Master/.codex`

**MCP Configuration:**
- **Claude Code**: Uses `npx -y @upstash/context7-mcp --api-key ...` (stored in `.claude/_state/.claude.json`)
- **Codex**: Uses direct node path to `.codex/node_modules/@upstash/context7-mcp/dist/index.js` (in `.codex/config.toml`)

### Project: Cacherr

**Wrapper Scripts:**
- Claude Code: `/usr/local/bin/claude-cacherr`
- Codex: `/usr/local/bin/codex-cacherr`

**Settings:**
- `.vscode/settings.json`: 
  - `chatgpt.cliExecutable: "/usr/local/bin/codex-cacherr"`
  - `claudeCode.claudeProcessWrapper: "/usr/local/bin/claude-cacherr"`
- `CODEX_HOME`: `/mnt/user/Cursor/Cacherr/.codex`

**MCP Configuration:**
- **Claude Code**: Uses `npx -y @upstash/context7-mcp --api-key ...` (stored in `.claude/_state/.claude.json`)
- **Codex**: Uses direct node path to `.codex/node_modules/@upstash/context7-mcp/dist/index.js` (in `.codex/config.toml`)

### Project: Rom Runner

**Wrapper Scripts:**
- Claude Code: `/usr/local/bin/claude-romrunner`
- Codex: `/usr/local/bin/codex-romrunner`

**Settings:**
- `.vscode/settings.json`: 
  - `chatgpt.cliExecutable: "/usr/local/bin/codex-romrunner"`
  - `claudeCode.claudeProcessWrapper: "/usr/local/bin/claude-romrunner"`
  - `terminal.integrated.cwd: "${workspaceFolder}"`
- `CODEX_HOME`: `/mnt/user/Cursor/Rom Runner/.codex`

**MCP Configuration:**
- **Claude Code**: Uses `npx -y @upstash/context7-mcp --api-key ...` (stored in `.claude/_state/.claude.json`)
- **Codex**: Uses direct node path to `.codex/node_modules/@upstash/context7-mcp/dist/index.js` (in `.codex/config.toml`)

### Key Isolation Principles

Each wrapper script:
1. `cd`s into the project directory
2. Exports `CODEX_HOME` to project-specific `.codex/` directory
3. Sets `CLAUDE_CONFIG_DIR` to project-specific `.claude/_state/` directory
4. Ensures sessions, auth, and MCP state do not leak between projects

---

## Example: Setting Up "My New Project"

1. **Create wrappers:**
   ```bash
   # Create Claude wrapper
   sudo nano /usr/local/bin/claude-my-new-project
   # (paste Claude wrapper template, replace {PROJECT_NAME} with "My New Project")
   sudo chmod +x /usr/local/bin/claude-my-new-project
   
   # Create Codex wrapper
   sudo nano /usr/local/bin/codex-my-new-project
   # (paste Codex wrapper template, replace {PROJECT_NAME} with "My New Project")
   sudo chmod +x /usr/local/bin/codex-my-new-project
   ```

2. **Create VS Code settings:**
   ```bash
   mkdir -p "/mnt/user/Cursor/My New Project/.vscode"
   nano "/mnt/user/Cursor/My New Project/.vscode/settings.json"
   # (paste settings template, replace {PROJECT_NAME} with "my-new-project")
   ```

3. **Install Context7 MCP locally (project-scoped):**
   ```bash
   cd "/mnt/user/Cursor/My New Project"
   mkdir -p .codex
   cd .codex
   npm init -y
   npm install -D @upstash/context7-mcp
   ```

4. **Configure Codex MCP (Context7):**
   ```bash
   nano "/mnt/user/Cursor/My New Project/.codex/config.toml"
   # Add the [mcp_servers.context7] block from Step 3.2
   ```

5. **Configure Claude Code MCP (using npx - recommended):**
   ```bash
   cd "/mnt/user/Cursor/My New Project"
   /usr/local/bin/claude-my-new-project mcp add context7 -- npx -y @upstash/context7-mcp --api-key "{CONTEXT7_API_KEY}"
   ```
   
   **Verify:**
   ```bash
   /usr/local/bin/claude-my-new-project mcp list
   ```
   Should show: `context7: npx -y @upstash/context7-mcp --api-key ... - ✓ Connected`

6. **Create CLAUDE.md:**
   ```bash
   mkdir -p "/mnt/user/Cursor/My New Project/.claude"
   nano "/mnt/user/Cursor/My New Project/.claude/CLAUDE.md"
   # (paste CLAUDE.md template, replace {PROJECT_NAME} with "My New Project")
   ```

7. **Verify:**
   ```bash
   /usr/local/bin/claude-my-new-project --version
   /usr/local/bin/codex-my-new-project --version
   /usr/local/bin/claude-my-new-project mcp list
   /usr/local/bin/codex-my-new-project mcp list
   ```

---

## Important Notes

1. **Project Name Format**: 
   - In file paths: Use exact project name (e.g., "My New Project")
   - In wrapper script names: Use hyphens (e.g., "my-new-project")
   - In settings.json: Use hyphens (e.g., "my-new-project")

2. **Architecture**: 
   - Current system: `x86_64`
   - If on ARM64, change Codex binary path from `linux-x86_64` to `linux-aarch64`

3. **SSH Remote Connection**: 
   - **Windows Client**: Configure `C:\Users\sitti\AppData\Roaming\Cursor\User\settings.json` with SSH settings
   - **Windows SSH Config**: Set up `C:\Users\sitti\.ssh\config` with your remote host
   - **Project Settings**: The `remote.SSH.defaultExtensions` setting ensures extensions are installed on the SSH host
   - **Wrappers**: Handle setting the correct working directory for SSH remote sessions
   - **Connection**: Use `Remote-SSH: Connect to Host...` in Cursor to connect

4. **Context7 API Key**: 
   - Store `{CONTEXT7_API_KEY}` somewhere safe (environment variable, 1Password, etc.)
   - Avoid committing it to git (prefer env vars or local-only config files)

5. **Claude Binary Location**: 
   - Currently: `/root/.local/bin/claude` (symlink to `/root/.local/share/claude/versions/2.1.2`)
   - If Claude is installed elsewhere, update the wrapper script

6. **Codex Binary Location**: 
   - Currently: `/root/.cursor-server/extensions/openai.chatgpt-0.4.58-universal/bin/linux-x86_64/codex`
   - Version may change; find current location with:
     ```bash
     find /root/.cursor-server/extensions -name "codex" -type f -path "*/bin/linux-x86_64/codex" 2>/dev/null
     ```

---

## Troubleshooting

### Wrapper Script Not Found
- Check that script exists: `ls -la /usr/local/bin/claude-{PROJECT_SLUG}`
- Check permissions: `chmod +x /usr/local/bin/claude-{PROJECT_SLUG}`
- Verify PATH includes `/usr/local/bin`

### Extension Can't Find Wrapper
- Check `.vscode/settings.json` has correct path
- Path should be absolute: `/usr/local/bin/claude-{PROJECT_SLUG}`
- Reload Cursor window after changing settings

### Claude Code MCP Not Working
- Verify MCP is added: `claude-{PROJECT_SLUG} mcp list`
- Check `.claude/_state/.claude.json` contains context7 configuration
- Ensure API key is correct
- **If CLI works but GUI shows "failed"**: 
  - Reload Cursor window (`Cmd/Ctrl+Shift+P` → "Developer: Reload Window")
  - The GUI may have a shorter timeout; using `npx` (recommended) handles this better than direct node paths
  - Warm up npx cache: `npx -y @upstash/context7-mcp --api-key {KEY} < /dev/null & sleep 3 && kill %1`

### Codex MCP Not Working
- Verify the wrapper sets `CODEX_HOME` to `{PROJECT}/.codex`
- Verify config exists: `{PROJECT}/.codex/config.toml`
- Verify Codex sees the server: `codex-{PROJECT_SLUG} mcp list`
- If Context7 was configured with a relative path, switch to an absolute path

### Wrong Working Directory
- Verify wrapper script has correct `PROJECT_DIR`
- Check wrapper script `cd` command succeeds
- Test wrapper: `claude-{PROJECT_SLUG} pwd` should show project directory

### SSH Connection Issues
- Verify Windows SSH config has correct host entry
- Check `remote.SSH.remotePlatform` matches SSH config `Host` name
- Ensure SSH key permissions are correct: `chmod 600 ~/.ssh/id_rsa` (on Windows, use file properties)
- Test SSH connection directly: `ssh unraid` (or your host name)
- Check Windows firewall allows SSH connections

### Claude Wrapper Not Found in Cursor GUI
- Verify `.vscode/settings.json` has `claudeCode.claudeProcessWrapper` set correctly
- Check the path is absolute: `/usr/local/bin/claude-{PROJECT_SLUG}`
- Reload Cursor window after changing settings
- Check that wrapper script exists and is executable on the remote server

---

## Complete Setup Checklist

For a new project, you need to configure:

### On Remote Server (Linux/Unraid):
- [ ] Create Claude wrapper: `/usr/local/bin/claude-{PROJECT_SLUG}`
- [ ] Create Codex wrapper: `/usr/local/bin/codex-{PROJECT_SLUG}`
- [ ] Create `.vscode/settings.json` with wrapper paths
- [ ] Run `claude mcp add context7` command
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

### 1. Create Wrapper Scripts (on remote server)
- [ ] Create `/usr/local/bin/claude-{PROJECT_SLUG}` using the template from Step 1.1
- [ ] Replace `{PROJECT_NAME}` with actual project folder name (may include spaces)
- [ ] Make executable: `chmod +x /usr/local/bin/claude-{PROJECT_SLUG}`
- [ ] Create `/usr/local/bin/codex-{PROJECT_SLUG}` using the template from Step 1.2
- [ ] Replace `{PROJECT_NAME}` with actual project folder name
- [ ] Update `CODEX_BIN` path if needed (check with `find /root/.cursor-server/extensions -name "codex"`)
- [ ] Make executable: `chmod +x /usr/local/bin/codex-{PROJECT_SLUG}`

### 2. Create Project Settings (on remote server)
- [ ] Create `.vscode/settings.json` in project root
- [ ] Set `chatgpt.cliExecutable` to `/usr/local/bin/codex-{PROJECT_SLUG}`
- [ ] Set `claudeCode.claudeProcessWrapper` to `/usr/local/bin/claude-{PROJECT_SLUG}`
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
- [ ] Verify: `codex-{PROJECT_SLUG} mcp list` shows context7 as enabled

### 5. Configure Claude Code MCP (on remote server)
- [ ] Run: `claude-{PROJECT_SLUG} mcp add context7 -- npx -y @upstash/context7-mcp --api-key {CONTEXT7_API_KEY}`
- [ ] Verify: `claude-{PROJECT_SLUG} mcp list` shows `✓ Connected`
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
- [ ] Test Claude wrapper: `/usr/local/bin/claude-{PROJECT_SLUG} --version`
- [ ] Test Codex wrapper: `/usr/local/bin/codex-{PROJECT_SLUG} --version`
- [ ] Test Claude MCP: `/usr/local/bin/claude-{PROJECT_SLUG} mcp list`
- [ ] Test Codex MCP: `/usr/local/bin/codex-{PROJECT_SLUG} mcp list`
- [ ] Connect via Remote-SSH in Cursor
- [ ] Open project folder
- [ ] Verify extensions can find wrappers (check extension output logs if issues)

---

*Last updated: 2026-01-13*
