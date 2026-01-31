# RWM Puppet Master

RWM Puppet Master is a CLI + local web GUI that orchestrates the Ralph Wiggum Method (Phase → Task → Subtask → Iteration) across multiple **CLI** platforms:

- **Cursor Code** (cursor-agent) - Full orchestration support
- **Codex CLI** (codex) - Full orchestration support
- **Claude Code** (claude) - Full orchestration support
- **Gemini CLI** (gemini) - Headless JSON output, approval modes, model selection
- **GitHub Copilot CLI** (copilot) - Headless text output, programmatic flags
- **Google Antigravity** (agy) - GUI-only (headless mode unavailable; use gemini for automation)

It does **not** call any LLM APIs directly.

## Install (Mac / Linux)

Prereqs: Node.js 18+ and npm.

From this repo:

```bash
./scripts/install.sh
```

## Install (Windows)

Prereqs: Node.js 18+ and npm.

From this repo (PowerShell):

```powershell
.\scripts\install.ps1
```

## Quickstart

```bash
puppet-master init
puppet-master doctor
puppet-master plan ./REQUIREMENTS.md
puppet-master start
```

Start the local GUI:

```bash
puppet-master gui
```

## Intensive logging mode

Enable via CLI:

```bash
puppet-master start --intensive-logging
```

Or via GUI: **Config → Advanced → Intensive logging**.

Logs:
- `.puppet-master/logs/runtime.log` (file transport + optional raw console capture)
- console output remains unchanged

## Desktop Application (Tauri v2)

A native desktop wrapper is available in `src-tauri/`. It provides:
- Native window management
- System tray integration  
- tauri-plugin-log (LogDir, Stdout, Webview)
- Connects to existing GUI server (http://127.0.0.1:3847)

See [src-tauri/README.md](src-tauri/README.md) for setup and usage instructions.

Quick start:
```bash
npm run gui          # Terminal 1: Start server
npm run tauri:dev    # Terminal 2: Launch desktop app
```

## Important Note (GUI “Fix” Buttons)

Doctor “Fix” actions run on the **machine where the GUI server is running**. If you want the GUI to install tools on *your* computer, run `puppet-master gui` locally (not on a remote host).

