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

### Linux Validation 2026-02-02
Four-step runbook on sittingmongoose@192.168.50.72: install/versions, GUI/autostart, doctor, logs. See [SSH_DIAGNOSIS_2026-02-01.md](SSH_DIAGNOSIS_2026-02-01.md) "SSH Run 2026-02-02" and [.puppet-master/evidence/linux-ssh-validation-2026-02-02-raw.txt](.puppet-master/evidence/linux-ssh-validation-2026-02-02-raw.txt). Summary: install PASS (rwm-puppet-master 0.1.0-1), autostart desktop present, GUI already running at localhost:3847, doctor run from home (expected git-repo/subdirectories failures), crash.log startup-only. Codex/Copilot EACCES unchanged per prior diagnosis.

### macOS Validation 2026-02-02
Five-step validation on jaredsmacbookair@192.168.50.115: [MACOS_VALIDATION_2026-02-02.md](MACOS_VALIDATION_2026-02-02.md). Summary: app bundle present; in-bundle npm/npx/corepack symlinks still broken (CI paths); GUI launch via `open -a` succeeded with no crash in this run; port retry working; **observer reports tray icon missing and GUI opens to blank screen**; Open CLI not verified (manual).

### Windows Validation 2026-02-02
SSH validation on sitti@192.168.50.253 (JaredGamingPC):

| Check | Result |
|-------|--------|
| **Version** | 0.1.0 (VERSION.txt) |
| **better_sqlite3.node** | PASS — exists (1,896,448 bytes) at `app\node_modules\better-sqlite3\build\Release\` |
| **puppet-master-gui.exe** (Tauri) | PASS — exists (3,185,664 bytes) at `app\` |
| **bin/ directory** | FAIL — **missing**; VBS/BAT launchers reference `bin\puppet-master.cmd` which does not exist |
| **Start Menu shortcut** | Would fail — VBS runs `bin\puppet-master.cmd gui` |
| **Tauri GUI (direct launch)** | PASS — `Start-Process app\puppet-master-gui.exe` succeeds; process runs (PID confirmed) |
| **crash.log** | Single benign entry at `%USERPROFILE%\.puppet-master\logs\crash.log` |
| **Tray icon** | FAIL — **missing** per observer |
| **Open CLI** | Not verified (requires graphical session) |

**Findings:**
- Install dir structure: `app/`, `node/`, launchers (VBS, BAT), VERSION.txt — no `bin/`
- VBS launcher has CWD fix (uses %USERPROFILE%) but invokes missing `bin\puppet-master.cmd`
- Tauri GUI works when launched directly; Start Menu shortcut would fail
- Node CLI (`puppet-master --version`) not in PATH; direct Node invocation fails with ERR_MODULE_NOT_FOUND (needs app cwd)
- Recommend: either ensure `bin/` is staged/copied in Windows build, or update launchers to use `app\puppet-master-gui.exe` for Tauri builds

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

### Windows Diagnosis - COMPLETE (updated 2026-02-02)
- SSH connected via `sshpass` (password has special characters)
- Install present: `app/`, `node/` exist; **`bin/` missing** on this machine (see Windows Validation 2026-02-02)
- VBS/BAT launchers reference `bin\puppet-master.cmd` — Start Menu shortcut would fail without bin/
- Tauri GUI (`app\puppet-master-gui.exe`) works when launched directly
- better_sqlite3.node: EXISTS (1.8 MB)
- VBS CWD fix applied (uses %USERPROFILE%); Codex 0.93.0 and Copilot 0.0.400 installed

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

4. **[HIGH] Windows: bin/ directory missing — Start Menu shortcut broken**
   - VBS/BAT launchers invoke `bin\puppet-master.cmd` which does not exist on sitti@192.168.50.253
   - Tauri GUI (`app\puppet-master-gui.exe`) works when launched directly
   - Either ensure bin/ is staged/copied in Windows build, or update launchers to use Tauri exe

5. **[HIGH] macOS: GUI opens to blank screen**
   - Observer reports Tauri window opens blank (no UI), despite server log showing load.

6. **[HIGH] Tray icon missing on macOS + Windows**
   - Menu bar/tray icon does not appear in current builds.

7. **[MEDIUM] macOS: Node symlinks broken**
   - npm/npx/corepack symlinks point to CI runner paths
   - Won't affect puppet-master CLI (uses node directly) but npm won't work

8. **[MEDIUM] All platforms: PlatformSetupWizard never appears**
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

### 16. GUI: eliminate remaining raw fetch() calls
**Files: `src/gui/react/src/lib/api.ts`, `src/gui/react/src/pages/Config.tsx`, `src/gui/react/src/pages/Wizard.tsx`, `src/gui/react/src/hooks/useFirstBoot.ts`**
- Added API helpers: `getFirstBootStatus()` and `uninstallSystem()`
- Replaced remaining `fetch('/api/...')` calls (models refresh, first-boot check, uninstall) with the shared API wrapper to prevent invalid relative URL behavior and reduce duplicate/delayed loads.
**Follow-up hotfixes (2026-02-02):**
- Fixed Express wildcard route for AGENTS to avoid path-to-regexp pattern failures ("The string did not match the expected pattern") by switching `/api/agents/:path(*)` → `/api/agents/*`.
- Linux tray "Open CLI" now uses an explicit `read` prompt instead of `exec bash` to reliably keep terminal windows open.
- Tray launcher: removed unsupported `gnome-terminal --hold` flag and switched konsole to `--noclose` to avoid immediate failures when launching the CLI from tray.
- Login flow: Gemini now uses `gemini auth login` (matches UI docs), and terminal keep-open uses `read` prompt for Linux/macOS.
- PlatformDetector: Copilot "installed" is now based on runnable `copilot --version` (with enriched PATH for ~/.npm-global/bin), not env token presence; aligns Doctor summary vs details.
- **Doctor state persistence:** persisted Doctor store (checks/platform status/selection) to sessionStorage so it survives navigation without rerunning.
- **Windows Cursor install:** updated winget fallback to use `--name Cursor` (instead of `-e Cursor`) to reduce "No package found" errors.
- **Linux Codex/Copilot install:** installation runs now prefer bundled Node/NPM pairing (via PATH ordering) while forcing user-writable `~/.npm-global` prefix for `npm install -g`, preventing npm@11 + embedded Node mismatches and reducing EACCES under `/opt/puppet-master`.
- **Config models loading:** `api.getModels(true)` now clears the frontend module cache so Refresh Models actually refetches, and backend per-platform discovery timeout was reduced (3s → 1.5s) to improve perceived speed.
- **Login page:** migrated Login.tsx off raw `fetch('/api/login/*')` to API wrapper to avoid invalid relative URL errors.

**Files: `src-tauri/src/main.rs`, `src-tauri/Cargo.toml`**
- Added TrayIconBuilder menu (Open GUI, Open CLI, Restart App, Quit)
- Left-click tray icon focuses the GUI
- Added tray-icon feature to Tauri dependency
- Keep TrayIcon handle alive via app state (prevents tray icon disappearing on macOS/Windows)

### 16. Tauri: GUI load + tray icon fixes in progress (2026-02-02)
**Files: `src-tauri/src/main.rs`, `src-tauri/tauri.conf.json`**
- Tray icon missing fix: store TrayIcon in app state (prevents drop)
- CSP updated to allow asset: protocol (required for bundled `asset://` resources), including script-src asset
- Added tray icon fallbacks for platform-specific formats
- External server optional: Tauri uses bundled frontend unless `--server-url` provided
- **Pending validation:** macOS/Windows tray icon and blank screen should be re-tested on new build

### 17. Windows installer: bin/ directory missing fix (2026-02-02)
**Files: `installer/win/puppet-master.nsi`**
- NSIS file copy now uses `*` instead of `*.*` to include directories/files without extensions (ensures `bin/` is copied)
- better_sqlite3.node copied separately with retry + rebuild after install

### 18. macOS installer: Node symlink fix at build time (2026-02-02)
**File: `scripts/build-installer.ts`**
- Rewrites npm/npx/corepack launchers in bundled Node to relative scripts during staging
- Prevents CI absolute symlinks from shipping in app bundle
- Ensures React GUI is built and staged in payload (builds if missing)

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
2026-02-02 (local):
- `npm test -- --run tests/e2e/multi-platform.test.ts` ✅ pass
- `npm test -- --run src/gui/gui.integration.test.ts` ✅ pass

---

## CI Build Status
- **Commit**: `fa2bd55` - pushed to `main`
- **CI Workflow**: "Build installers" triggered on push
- **Status**: In progress (builds on windows-latest, macos-14, ubuntu-latest)
- **URL**: https://github.com/sittingmongoose/RWM-Puppet-Master/actions

### 2026-02-03 Progress Update (local changes; re-validate on packaged builds)

#### What was done (since last log update)

##### Files touched (working tree / not yet committed)
- `installer/win/puppet-master.nsi`
- `installerissues.md`
- `package.json`
- `src-tauri/Cargo.lock`
- `src-tauri/Cargo.toml`
- `src-tauri/capabilities/default.json`
- `src-tauri/src/main.rs`
- `src-tauri/tauri.conf.json`
- `src/cli/commands/evidence.ts`
- `src/doctor/checks/cli-tools.test.ts`
- `src/doctor/checks/cli-tools.ts`
- `src/doctor/installation-manager.test.ts`
- `src/doctor/installation-manager.ts`
- `src/gui/auth-middleware.ts`
- `src/gui/react/package.json`
- `src/gui/react/src/components/layout/Panel.tsx`
- `src/gui/react/src/components/shared/StatusBadge.tsx`
- `src/gui/react/src/components/ui/Modal.tsx`
- `src/gui/react/src/components/wizard/PlatformSetupWizard.tsx`
- `src/gui/react/src/hooks/index.ts`
- `src/gui/react/src/hooks/useFirstBoot.ts`
- `src/gui/react/src/lib/api.ts`
- `src/gui/react/src/lib/index.ts`
- `src/gui/react/src/pages/Config.tsx`
- `src/gui/react/src/pages/Doctor.tsx`
- `src/gui/react/src/pages/History.tsx`
- `src/gui/react/src/pages/Ledger.tsx`
- `src/gui/react/src/pages/Login.tsx`
- `src/gui/react/src/pages/Wizard.tsx`
- `src/gui/react/src/stores/index.ts`
- `src/gui/react/src/test/setup.ts`
- `src/gui/react/vitest.config.ts`
- `src/gui/routes/config.ts`
- `src/gui/routes/doctor.ts`
- `src/gui/routes/evidence.ts`
- `src/gui/routes/login.ts`
- `src/gui/routes/state.ts`
- `src/gui/server.ts`
- `src/platforms/platform-detector.ts`
- `src/gui/react/src/stores/doctorStore.ts` (new)

- **Doctor API: fix Copilot install-status contradictions**
  - **File:** `src/gui/routes/doctor.ts`
  - Registered `CopilotSdkCheck` in addition to `CopilotCliCheck` so Doctor “installed” state is based on *runnable binaries* and the SDK probe is visible as its own check.
  - Goal: remove the confusing situation where the top UI summary says “not installed” but the deeper check list says “installed”.

- **Linux Codex/Copilot installs: reduce EACCES + Node/npm mismatch failures**
  - **File:** `src/doctor/installation-manager.ts`
  - Global npm installs now consistently use a **user-writable prefix** (`~/.npm-global`) and set `npm_config_prefix`/`NPM_CONFIG_PREFIX` when running `npm install -g`.
  - PATH ordering now **prefers the bundled Node runtime** (when present) for `npm ...` commands, while still using the user prefix for global installs.

- **Tray icon lifetime: verified implementation matches Tauri v2 docs**
  - **File:** `src-tauri/src/main.rs`
  - Tray handle is stored with `app.manage(tray)` (required so it doesn’t get dropped).
  - Per Tauri v2 system-tray docs (Context7), this is the correct pattern; if tray is still missing in builds, the cause is likely **icon format/assets, build config, or runtime errors** rather than the Rust handle being dropped.

#### What still needs to be done / problems remaining (and how to address)
1. **macOS blank screen + runtime JS error:** `undefined is not an object (evaluating 'a.toUpperCase')`
   - **Likely impact:** can cause a completely blank GUI (React crash before render).
   - **Next steps:**
     - Search for remaining unsafe `.toUpperCase()` callsites in the GUI (there are a few in `Doctor.tsx`/`Config.tsx` and `StatusBadge.tsx`).
     - Make the relevant label formatting fully defensive (treat unknown/undefined values as empty strings) and rebuild.
     - Validate on macOS build (Finder launch path), then re-check for blank screen.

2. **Tray icon still reported missing on macOS/Windows builds (despite correct code)**
   - **Next steps:**
     - Check Tauri logs for either `Tray icon created successfully` or `Failed to create tray icon: ...`.
     - If tray creation fails:
       - Verify the bundled icon fallback (`include_bytes!("../icons/32x32.png")`) exists in the final app bundle.
       - Consider switching to a platform-appropriate tray icon (macOS template monochrome, Windows .ico) and/or explicit icon asset selection.

3. **Linux: Codex + Copilot install reliability**
   - Even with `~/.npm-global` prefix, installs can still fail if the **wrong npm binary** is invoked.
   - **Next steps:** if installs still fail in packaged app, make installs call the bundled npm explicitly (not just PATH ordering), or use the Copilot install script (`https://gh.io/copilot-install`) as an alternative flow.

4. **Windows: Cursor install via winget can still fail (“No package found…”)**
   - Current install command has fallbacks; if still failing, the robust fix is to **detect the correct winget ID** via `winget search cursor` and use that exact ID for the user’s environment/source.

5. **CI/build verification needs to be re-run**
   - Previously logged CI failure mentioned `NpmNodeCompatibilityCheck` export; re-run `npm run typecheck` and the installer workflow after the latest changes to confirm it’s resolved.

---

### 2026-02-02 CI Run 48
- **Commit**: `34a1cd5`
- **Status**: FAIL
- **Failure**: `npm run build` → `src/gui/routes/doctor.ts(35,3): error TS2305: Module '../../doctor/checks/runtime-check.js' has no exported member 'NpmNodeCompatibilityCheck'.`
- **Fix**: Export `NpmNodeCompatibilityCheck` from runtime checks and re-run CI.
