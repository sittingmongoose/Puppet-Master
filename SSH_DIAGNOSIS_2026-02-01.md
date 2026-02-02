# SSH Diagnosis - 2026-02-01

Cross-platform log collection and Codex/Copilot verification via SSH.

---

## Linux (sittingmongoose@192.168.50.72)

### Environment
- **OS**: Linux ubuntudevvm 6.8.0-94-generic (x86_64)
- **Node**: v25.5.0 (system: /usr/bin/node)
- **npm**: 11.8.0 (system: /usr/bin/npm)
- **puppet-master**: 0.1.0
- **Install type**: System (.deb) - rwm-puppet-master 0.1.0-1 amd64
- **Install dir**: /opt/puppet-master/ (bin/, app/, node/, playwright-browsers/ present)

### Logs Collected
- **~/.puppet-master/logs/crash.log**: exists, mtime recent
  - Last entries: GUI startup messages (no terminal), no crash stack traces in recent entries
  - `[2026-02-01T20:19:23.477Z] Puppet Master GUI starting (no terminal)...`
- **.puppet-master/logs/runtime.log**: not found (project logs dir not present)
- **.puppet-master/logs/iterations/**: not found
- **~/.npm/_logs/**: exists, 15+ debug logs
  - Most recent: 2026-02-01T20_32_55_003Z-debug-0.log (npm config get prefix)
  - Earlier Codex EACCES log (2026-02-01T20_20_32_879Z) may have been rotated (npm logs-max:10)

### Codex
- **Status**: NOT installed
- **CLI**: `codex: command not found`
- **npm -g @openai/codex**: (empty)
- **npm @openai/codex-sdk**: (empty)
- **Exact error** (from user transcript): `EACCES: permission denied, mkdir '/opt/puppet-master/node/lib/node_modules/@openai'` — GUI Install Codex runs `npm install -g @openai/codex && npm install @openai/codex-sdk`; when puppet-master runs, PATH may include /opt/puppet-master/node/bin, causing npm to target system install dir (root-owned).

### Copilot
- **Status**: NOT installed
- **CLI**: `copilot: command not found`
- **gh auth**: "You are not logged into any GitHub hosts"
- **npm -g @github/copilot**: (empty)
- **npm @github/copilot-sdk**: (empty)

### File Paths
- /opt/puppet-master/ (root:root)
- /opt/puppet-master/node/lib/node_modules/ (no @openai)
- ~/.puppet-master/logs/crash.log
- ~/.npm/_logs/

---

## macOS (jaredsmacbookair@192.168.50.115)

### Environment
- **OS**: Darwin 25.3.0 (ARM64)
- **Node** (in app): v20.11.1
- **npm** (in app): BROKEN — symlink points to CI path `/Users/runner/work/RWM-Puppet-Master/...`
- **puppet-master**: Not in default PATH when SSH (no interactive shell profile)
- **Install type**: App bundle
- **Install dir**: /Applications/Puppet Master.app/Contents/Resources/puppet-master/

### Logs Collected
- **~/.puppet-master/logs/crash.log**: exists
  - **CRITICAL**: `ERR_STREAM_DESTROYED` at `[2026-01-31T17:30:12.588Z]`
  - Stack: `vscode-jsonrpc` → `StreamMessageWriter.doWrite` at `ril.js:88`, `messageWriter.js:99`
  - Path: `/Applications/Puppet Master.app/Contents/Resources/puppet-master/app/node_modules/vscode-jsonrpc/lib/node/ril.js`
- **~/Library/Logs/com.rwm.puppet-master/puppet-master.log**: exists
  - Port retry observed: 3848, 3849, 3851, 3847 (port conflict with Cursor)
- **~/Library/Logs/DiagnosticReports/**: No Puppet Master crash reports (other .diag files present)

### Codex / Copilot
- **Status**: Not verified (node/npm not in PATH; app's npm symlink broken)
- **Node symlinks** (BROKEN): npm, npx, corepack → `/Users/runner/work/RWM-Puppet-Master/RWM-Puppet-Master/installer-work/downloads/extracted/node-v20.11.1-darwin-arm64/...`

### Port 3847
- **In use by**: Cursor (PID 3802), node (PID 3995) — msfw-control
- Port auto-retry is working (Tauri log shows 3848, 3849, 3851, 3847)

### File Paths
- /Applications/Puppet Master.app/Contents/Resources/puppet-master/
- ~/.puppet-master/logs/crash.log
- ~/Library/Logs/com.rwm.puppet-master/puppet-master.log

---

## Windows (sitti@192.168.50.253)

### Environment
- **OS**: Microsoft Windows 10.0.26200.7623
- **Node**: v22.18.0
- **npm**: 10.9.3
- **puppet-master**: (version not captured in truncated output; CLI available)
- **Install type**: NSIS installer
- **Install dir**: C:\Program Files\Puppet Master\

### Logs Collected
- **%USERPROFILE%\.puppet-master\logs\crash.log**: exists
  - Single entry: `[2026-01-31T20:37:12.753Z] Puppet Master GUI starting (no terminal)...`
  - No crash stack traces
- **VBS launcher**: CWD fix applied — `WshShell.CurrentDirectory = %USERPROFILE%`

### Codex
- **Status**: INSTALLED
- **CLI**: codex-cli 0.93.0
- **npm -g @openai/codex**: @openai/codex@0.93.0 (C:\Users\sitti\AppData\Roaming\npm)

### Copilot
- **Status**: INSTALLED
- **npm -g @github/copilot**: @github/copilot@0.0.400

### better-sqlite3
- **Path**: C:\Program Files\Puppet Master\app\node_modules\better-sqlite3\
- **build/Release/better_sqlite3.node**: EXISTS (1,896,448 bytes)
- User-reported "Error opening file for writing" may have occurred during initial NSIS install or a prior run; current state shows .node file present.

### File Paths
- C:\Program Files\Puppet Master\
- C:\Program Files\Puppet Master\Launch-Puppet-Master-GUI.vbs (CWD fix present)
- %USERPROFILE%\.puppet-master\logs\crash.log

---

## Summary

### Critical Issues
1. **Linux Codex/Copilot install EACCES**: GUI Install triggers `npm install -g` which, when PATH includes /opt/puppet-master/node, targets root-owned dir. Need user-local install (e.g. `npm config get prefix` → user dir) or elevation prompt.
2. **macOS ERR_STREAM_DESTROYED**: Confirmed in crash.log. vscode-jsonrpc writes after stream destroyed (Copilot SDK). uncaughtException handler added in gui.ts; verify fix is in deployed build.
3. **macOS Node symlinks broken**: npm/npx/corepack point to CI paths; npm won't work from app. Fix installer to use relocatable paths.

### High Priority
4. **macOS port 3847**: Cursor occupies port; auto-retry (3848–3857) is working per Tauri log.
5. **Linux Doctor/Config inconsistency**: Top-level "not installed" vs "object object" saying installed — UI bug to fix.

### Resolved / Improved
- **Windows CWD**: VBS launcher uses %USERPROFILE%; better_sqlite3.node present.
- **Windows Codex/Copilot**: Both installed globally.

### Recommendations
- Run Codex/Copilot install with `npm config get prefix` ensuring user dir (not /opt/...) when on Linux system install.
- Rebuild macOS app with fixed Node symlinks (use relative paths or post-install fix).
- Confirm uncaughtException handler is in macOS CI build.
- Fix Doctor page "object object" display and Config slow-load/platform delay.
