# Installer Issues - Progress Document

## Date: 2026-01-31

## Platforms
- Linux: sittingmongoose@192.168.50.72 (current machine)
- macOS: jaredsmacbookair@192.168.50.115
- Windows: sitti@192.168.50.253

---

## Phase 1: SSH Diagnosis

### Linux Diagnosis - COMPLETE
- Package status: `dpkg -l puppet-master` shows "un" (not installed)
- `/opt/puppet-master/` exists but only contains 4 files: `app/dist/cli/commands/gui.js` and `app/dist/gui/public/js/event-stream.test.js` plus map files
- Missing: `bin/`, `node/`, `node_modules/`, React build, Tauri binary, everything else
- `/usr/bin/puppet-master` does not exist
- **Root cause**: The .deb package was never successfully installed, or the build is producing a broken .deb
- Crash log contains only test errors (vitest), not runtime errors

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
(Pending - will push and monitor)
