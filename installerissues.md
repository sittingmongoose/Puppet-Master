# Installer Issues - Progress Document

## Date: 2026-01-31

## Platforms
- Linux: sittingmongoose@192.168.50.72 (current machine)
- macOS: jaredsmacbookair@192.168.50.115
- Windows: sitti@192.168.50.253

---

## Phase 1: SSH Diagnosis

### SSH Run 2026-02-01
Full diagnosis: [SSH_DIAGNOSIS_2026-02-01.md](SSH_DIAGNOSIS_2026-02-01.md)

**Linux**: rwm-puppet-master 0.1.0-1 now installed; Codex/Copilot install fails with EACCES on `/opt/puppet-master/node/lib/node_modules/@openai`.  
**macOS**: ERR_STREAM_DESTROYED confirmed in crash.log; Node symlinks (npm/npx) point to CI paths; port 3847 in use by Cursor, auto-retry working.  
**Windows**: Codex 0.93.0 and Copilot 0.0.400 installed; VBS CWD fix present; better_sqlite3.node exists.

### Linux Diagnosis - COMPLETE (updated 2026-02-01)
- Package status: `dpkg -l rwm-puppet-master` shows "ii" (installed)
- `/opt/puppet-master/` now has full structure: bin/, app/, node/, playwright-browsers/
- **Codex/Copilot install**: GUI Install fails with EACCES — npm targets `/opt/puppet-master/node/lib/node_modules/@openai` (root-owned) when PATH includes app's node
- Crash log: GUI startup messages; no runtime crash traces

### macOS Diagnosis - COMPLETE
- App bundle is COMPLETE: bin/, node/, app/, playwright-browsers/, Tauri binary all present
- `puppet-master --version` returns 0.1.0 (CLI works)
- Tauri binary exists at `bin/puppet-master-gui` (2.9MB)
- React build exists at `app/dist/gui/react/dist/`
- node_modules exist
- **CRITICAL BUG**: Node symlinks (npm, npx, corepack) point to CI runner paths (`/Users/runner/work/...`) - broken on user machine
- **CRASH CAUSE**: `ERR_STREAM_DESTROYED` from `vscode-jsonrpc` (Copilot SDK) when launched from Finder (no TTY)
  - CopilotSdkRunner catches its own error ("SDK unavailable") but vscode-jsonrpc fires async write callback
  - The async error is UNCAUGHT and crashes the process
  - `installCrashHandlers()` only handles `unhandledRejection`, NOT `uncaughtException`
- **PORT CONFLICT**: Default port 3847 conflicts with Cursor IDE (which uses it for `msfw-control`)
- GUI starts fine from SSH (TTY) on a free port - the issue is exclusively the non-TTY launch path

### Windows Diagnosis - COMPLETE
- SSH connected via `expect` (password has special characters)
- Full install present: `bin/`, `node/`, `app/`, `node_modules/` all exist
- `puppet-master --version` returns 0.1.0
- GUI works when launched from terminal with CWD set to `%USERPROFILE%`
- **ROOT CAUSE**: VBS/BAT launchers set CWD to `C:\Program Files\Puppet Master\` which is read-only
- **ISSUE**: NSIS installer has interactive PowerShell CLI install page that requires manual terminal input

---

## Issues Found

1. **[CRITICAL] macOS: ERR_STREAM_DESTROYED crashes app on Finder launch**
   - vscode-jsonrpc async callback fires after CopilotSdkRunner catch block
   - No `uncaughtException` handler installed
   - Fix: Add uncaughtException handler for ERR_STREAM_DESTROYED

2. **[CRITICAL] Linux: .deb installation completely broken**
   - Only 4 files installed out of thousands
   - Need to investigate CI build / nfpm packaging

3. **[HIGH] macOS: Port 3847 conflicts with Cursor IDE**
   - Cursor uses port 3847 for msfw-control
   - Fix: Auto-detect port conflict and try next port, or change default

4. **[HIGH] Windows: Interactive PowerShell CLI install page**
   - Opens terminal requiring user interaction during install

5. **[MEDIUM] macOS: Node symlinks broken**
   - npm/npx/corepack symlinks point to CI runner paths
   - Won't affect puppet-master CLI (uses node directly) but npm won't work

6. **[MEDIUM] All platforms: PlatformSetupWizard never appears**
   - App crashes before GUI loads (macOS/Linux)
   - First-boot endpoint uses wrong capabilities path

---

## Fixes Applied

### 1. ERR_STREAM_DESTROYED crash fix (macOS critical)
**File: `src/cli/commands/gui.ts`**
- Added `process.on('uncaughtException')` handler in `installCrashHandlers()`
- Catches `ERR_STREAM_DESTROYED`, `EPIPE`, `ERR_STREAM_WRITE_AFTER_END` without crashing
- Other uncaught exceptions still terminate the process
- Also added `wrapStreamWriteToIgnoreDestroyed()` to proactively wrap stdout/stderr

### 2. Port auto-retry (macOS port conflict)
**File: `src/cli/commands/gui.ts`**
- When default port 3847 is in use, automatically tries ports 3848-3857
- Only retries if user didn't explicitly set `--port`
- Logs which port was selected

### 3. Windows launcher CWD fix
**Files: `installer/win/scripts/Launch-Puppet-Master-GUI.vbs`, `.bat`, `-Debug.bat`**
- Changed CWD from install dir (`C:\Program Files\Puppet Master\`) to `%USERPROFILE%`
- Ensures config/auth files can be written in a user-writable directory

### 4. Linux desktop entry fix
**File: `installer/linux/applications/com.rwm.puppet-master.desktop`**
- Changed `Exec=puppet-master-gui` to `Exec=puppet-master gui`
- Changed `Terminal=true` to `Terminal=false`
- Added `StartupNotify=true`

### 5. Removed broken NSIS CLI install page
**File: `installer/win/puppet-master.nsi`**
- Removed `CLIInstallPageCreate`, `CLIInstallPageLeave`, `ShowCLIInstructions` functions
- Removed `SHOWREADME` defines and `nsDialogs` include
- Removed PowerShell helper script copy
- Updated finish page text to mention first-boot setup wizard

### 6. Simplified macOS postinstall
**File: `installer/mac/scripts/postinstall`**
- Removed verbose CLI installation instructions (not visible in GUI installer)
- Added `/usr/local/bin/puppet-master` symlink for terminal access
- Updated messaging to reference first-boot setup wizard

### 7. Simplified Linux postinstall
**File: `installer/linux/scripts/postinstall`**
- Removed verbose CLI installation instructions
- Added `update-desktop-database` call for .desktop file registration
- Updated messaging to reference first-boot setup wizard

### 8. Fixed PlatformSetupWizard first-boot detection
**File: `src/gui/routes/platforms.ts`**
- Changed `capabilitiesPath` from `process.cwd()` to `baseDirectory` parameter
- Fixed capabilities check: was looking for nonexistent `capabilities.json`, now scans for actual platform files (claude.json, codex.json, etc.)
- Added `baseDirectory` parameter to `createPlatformRoutes()`

**File: `src/gui/server.ts`**
- Updated call to pass `this.config.baseDirectory` to `createPlatformRoutes()`

### 9. Linux: Add autostart entry for GUI
**Files: `installer/linux/autostart/puppet-master-gui.desktop`, `installer/linux/nfpm.yaml`**
- Added XDG autostart desktop entry to start GUI after login
- Installed into `/etc/xdg/autostart/puppet-master-gui.desktop` via nfpm
- Updated Linux postinstall to refresh autostart desktop database

### 10. macOS: Fix npm/npx/corepack launchers
**File: `installer/mac/scripts/postinstall`**
- Rewrote npm/npx/corepack launchers to point to bundled Node runtime
- Avoids broken CI symlink paths in app bundle

### 11. GUI: Auth/login improvements + errors
**Files: `src/gui/routes/login.ts`, `src/gui/react/src/pages/Login.tsx`, `src/gui/react/src/components/wizard/PlatformSetupWizard.tsx`**
- Enriched PATH for login commands with user npm global prefix
- Encode platform in login URL to avoid invalid URL errors
- Added error normalization helper for readable messages
- Added GitHub login card to onboarding wizard (uses gh auth login)

### 12. GUI: Doctor/config stability + uninstall placement
**Files: `src/gui/react/src/pages/Doctor.tsx`, `src/gui/react/src/pages/Config.tsx`**
- Keep cache in sync after fixes and platform status refresh
- Move Linux uninstall control to Advanced tab only

### 13. API: Ledger session ID validation
**File: `src/gui/routes/ledger.ts`**
- Return 400 for invalid sessionId instead of warning

### 14. Installers: npm prefix for CLI installs
**File: `src/doctor/installation-manager.ts`**
- Use ~/.npm-global prefix and PATH when running global npm installs

### 15. Tauri: Tray/menu bar status + actions
**Files: `src-tauri/src/main.rs`, `src-tauri/Cargo.toml`**
- Added TrayIconBuilder menu (Open GUI, Open CLI, Restart App, Quit)
- Left-click tray icon focuses the GUI
- Added tray-icon feature to Tauri dependency

---

## Linux .deb Build Investigation

**Findings:**
- `nfpm.yaml` config is correct (`type: tree` + `expand: true`)
- `build-installer.ts` staging code is correct (copies full `dist/` + `node_modules` + Node runtime)
- `run()` function properly inherits `process.env` (PATH preserved)
- **Most likely cause**: CI TypeScript compilation was incomplete, producing only 4 `.js` files
- **Action**: Push fixes and verify with fresh CI build

---

## Test Results
(Pending - awaiting CI build with fixes)

---

## CI Build Status
- **Commit**: `fa2bd55` - pushed to `main`
- **CI Workflow**: "Build installers" triggered on push
- **Status**: In progress (builds on windows-latest, macos-14, ubuntu-latest)
- **URL**: https://github.com/sittingmongoose/RWM-Puppet-Master/actions
