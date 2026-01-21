# RWM Puppet Master

RWM Puppet Master is a CLI + local web GUI that orchestrates the Ralph Wiggum Method (Phase → Task → Subtask → Iteration) across multiple **CLI** platforms (Cursor, Codex, Claude Code). It does **not** call any LLM APIs directly.

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

## Important Note (GUI “Fix” Buttons)

Doctor “Fix” actions run on the **machine where the GUI server is running**. If you want the GUI to install tools on *your* computer, run `puppet-master gui` locally (not on a remote host).

