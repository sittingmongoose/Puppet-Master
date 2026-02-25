# Check command – status (GUI / Tauri / launcher)

**Date:** 2026-02-03

## Post-commit code review (2026-02-03)

- **Status:** PASS
- **Summary:** Reviewed all code modified or added since the last commit using five parallel subagent reviews (A: GUI backend, B: GUI frontend, C: Tests and doctor, D: Installer and CI, E: Tauri and docs). All checks passed. One consistency fix applied: added `logoutGuiSession` to `src/gui/react/src/lib/index.ts` barrel export.
- **Findings:** Subagent A–E: auth allowlist, baseDirectory wiring, platforms refresh, login/logout, config/models, API 5xx parsing, getPlatformStatus(refresh), Header/Login/Config/Doctor/Wizard behavior, archive-manager temp dir, integration spawn queue, runtime-check getEnrichedEnv, MAKENSIS quoting, NSIS payload/PowerShell/ClearErrors, workflow matrix, installerissues fix #19, main.rs CLI launch and tauri::Error::Io, OAuth doc — all as specified. No blocking issues.
- **Cleanup:** `.test-cache` and `.test-quota` checked; none present in workspace.

## Platform wizard and doctor consistency (2026-02-03)

- **Status:** PASS
- **Summary:** Fixed (1) Platform setup wizard 401 "authentication required" by allowing all `/api/platforms/*` in server auth allowlist; (2) Install failure UX so 5xx responses show readable error messages and wizard always refreshes status after install so failed installs never appear as success; (3) Consistent wizard/doctor results via optional `?refresh=true` on GET platform status and refresh after install/fix.
- **Changes:**
  - **Backend (Auth):** `src/gui/server.ts` — allow `req.path.startsWith('/api/platforms/')` instead of only `/api/platforms/first-boot`.
  - **Backend (Platforms):** `src/gui/routes/platforms.ts` — GET `/platforms/status` accepts `?refresh=true` and calls `detectInstalledPlatforms(forceRefresh)`.
  - **Frontend (API):** `src/gui/react/src/lib/api.ts` — parse 5xx response body for `body.error`/`body.code`; `getPlatformStatus(refresh?)` with `?refresh=true` when true.
  - **Wizard:** `src/gui/react/src/components/wizard/PlatformSetupWizard.tsx` — `loadPlatformStatus(forceRefresh)`; after every install attempt (success or fail) call `loadPlatformStatus(true)` in `finally`; install-all calls `loadPlatformStatus(true)` at end.
  - **Doctor:** `src/gui/react/src/pages/Doctor.tsx` — after fix and after install-all use `api.getPlatformStatus(true)`.
- **Cleanup:** `.test-cache` and `.test-quota` checked; none present in workspace.

## GUI Logout (2026-02-03)

- **Status:** PASS
- **Summary:** Added logout in the GUI: (1) GUI session logout via "Log out" in the header (clears token and redirects to /login); (2) platform logout on the Login page for GitHub, Codex, and Copilot (runs `gh auth logout` or `codex logout` via new POST /api/login/:platform/logout).
- **Changes:**
  - **Phase 1 (Frontend Auth+Layout):** `logoutGuiSession()` in api.ts; Header "Log out" button that clears token and reloads.
  - **Phase 2 (Backend):** LOGOUT_COMMANDS map and POST /api/login/:platform/logout in login.ts (github, copilot → gh auth logout; codex → codex logout).
  - **Phase 3 (Frontend Login):** `logoutPlatform()`, `getLoginStatusForPlatform()`, `LOGOUT_SUPPORTED_PLATFORMS` in api; Login page "LOG OUT" per platform (Codex, Copilot) and GitHub in Git Configuration panel.
- **Files changed:** `src/gui/react/src/lib/api.ts`, `src/gui/react/src/lib/index.ts`, `src/gui/react/src/components/layout/Header.tsx`, `src/gui/routes/login.ts`, `src/gui/react/src/pages/Login.tsx`
- **Cleanup:** `.test-cache` and `.test-quota` checked; none present in workspace.

## OAuth confirmation: coding platforms and GitHub (2026-02-03)

- **Status:** PASS
- **Summary:** Confirmed that all coding platforms (Cursor, Codex, Claude Code, Gemini, Copilot) and GitHub use OAuth (or OAuth device/browser flow) for interactive sign-in where available. Headless/CI use API keys or tokens as documented.
- **Output:** [docs/PLATFORM_AUTH_OAUTH_CONFIRMATION.md](../../docs/PLATFORM_AUTH_OAUTH_CONFIRMATION.md)
- **Findings:**
  - **Cursor:** Web/app sign-in (OAuth/SSO typical); no CLI login; `CURSOR_API_KEY` for headless.
  - **Codex:** OAuth (browser + localhost callback); `OPENAI_API_KEY` for headless.
  - **Claude Code:** OAuth (browser, port 54545); `ANTHROPIC_API_KEY` for headless.
  - **Gemini:** OAuth (“Login with Google”); `GEMINI_API_KEY` / Vertex for headless.
  - **GitHub:** OAuth device flow (`gh auth login --web`); PKCE support (2025); `GH_TOKEN` for automation.
  - **Copilot:** Same GitHub OAuth; `GH_TOKEN` with Copilot scope for headless.
- **Cleanup:** `.test-cache` and `.test-quota` checked; none present in workspace.

## Failing tests fixed (2026-02-03)

- **Status:** PASS
- **Summary:** Fixed two previously failing tests: archive-manager ENOENT and integration “should discover capabilities” (empty output).
- **Changes:**
  - **archive-manager.test.ts:** Use unique temp dir per run via `mkdtemp(join(tmpdir(), 'archive-manager-'))` and set `testDir`, `archiveDir`, `testFile` in `beforeEach` so parallel/cleanup races no longer cause ENOENT on `.test-archive-manager/AGENTS.md`.
  - **integration.test.ts:** CursorRunner runs an approval-flag `--help` probe before execute; the spawn mock consumes one queue item per spawn. Set `spawnOutputQueue = [dummyHelp, mockOutput]` so the first spawn (--help) gets dummy help and the second (execute) gets the output containing `<pm>COMPLETE</pm>`.
- **Files changed:** `src/agents/archive-manager.test.ts`, `src/platforms/integration.test.ts`
- **Cleanup:** `.test-cache` and `.test-quota` removed when done (none were present).

## Config page: models and platforms (2026-02-03)

- **Status:** PASS
- **Summary:** Config page was showing all platforms as "not installed" and models not loading; Refresh models did nothing. Root cause: API routes used `process.cwd()` for config and capabilities paths, so when the server ran with a different cwd (e.g. Tauri, desktop shortcut), platform detection and model discovery failed.
- **Changes:**
  - **Backend:** Pass server `baseDirectory` into config and platform routes. Resolve config path as `join(baseDirectory, '.puppet-master', 'config.yaml')` and capabilities dir from baseDirectory; use `ConfigManager(configPath)` and `CapabilityDiscoveryService(capabilitiesDir, ...)` so all endpoints use the project root the server was started with.
  - **Frontend:** On Refresh models failure, set `modelsError` and show it in the UI (panel below main error); clear on success or after 8 seconds.
- **Files changed:** `src/gui/server.ts`, `src/gui/routes/config.ts`, `src/gui/routes/platforms.ts`, `src/gui/react/src/pages/Config.tsx`
- **Cleanup:** `.test-cache` and `.test-quota` checked; none present in workspace.

## SSH Cross-Platform Build (2026-02-03)

- **Status:** COMPLETE (Linux PASS; Windows PASS after fixes; macOS FAIL – host npm cache EACCES)
- **Purpose:** Replicate GitHub Action “Build installers” via SSH to Linux, macOS, Windows (GitHub Action experiencing outage).
- **Output:** [SSH_BUILD_2026-02-03.md](../../SSH_BUILD_2026-02-03.md)
- **Results:**
  - **Linux** (sittingmongoose@192.168.50.72): **PASS** – `dist/installers/linux-x64/rwm-puppet-master-0.1.0-linux-x64.deb`, `rwm-puppet-master-0.1.0-linux-x64.rpm`. Tauri deps installed via `SUDO_PASS_LINUX`; cleanup `.test-cache`/`.test-quota` in remote script.
  - **Windows** (sitti@192.168.50.253): **PASS** (after fixes) – NSIS installer builds; Tauri binary and custom NSIS step succeed. Fixes: `tauri::Error::Setup` → `tauri::Error::Io` (SetupError not public); `scripts/build-installer.ts` quote `MAKENSIS_PATH` when path contains spaces. **2026-02-03:** Windows installer crash-after-Install fixed: better_sqlite3 embedded in main File (no CopyFiles from STAGE_DIR); wmic replaced with PowerShell; npm rebuild made non-fatal. See installerissues.md fix #19.
  - **macOS** (jaredsmacbookair@192.168.50.115): **FAIL** – `npm ci` fails with EACCES on `~/.npm/_cacache` (permission denied). Rust installed successfully; Node/npm in PATH. Host fix: fix npm cache dir permissions or run `npm cache clean --force` and ensure write access to `~/.npm`.
- **Cleanup:** `.test-cache` and `.test-quota` removed in remote build scripts on each host; none present in workspace. After Windows installer fix (2026-02-03): confirmed removed when done (none present).

## SSH Cross-Platform Log Collection (2026-02-01)

- **Status:** COMPLETE
- **Agent:** Debugger (plan-based)
- SSH into Linux, macOS, Windows; collected installer/runtime logs; verified Codex/Copilot install errors.
- **Output:** [SSH_DIAGNOSIS_2026-02-01.md](../../SSH_DIAGNOSIS_2026-02-01.md)
- **Findings:** Linux Codex/Copilot EACCES (npm targets /opt); macOS ERR_STREAM_DESTROYED + broken Node symlinks; Windows Codex/Copilot installed, VBS CWD fix present.
- **Cleanup:** `.test-cache` and `.test-quota` removed when done (none were present).

## VM uninstall (2026-02-01, run again)

- **Linux VM** `sittingmongoose@192.168.50.72`: Puppet Master uninstalled without touching the project folder (same steps repeated on request).
  - Removed **.deb package** `rwm-puppet-master` (system install under `/opt/puppet-master`, `/usr/bin/puppet-master`, `/usr/bin/puppet-master-gui`, systemd service, `/usr/share/applications/com.rwm.puppet-master.desktop`).
  - Removed **dev desktop entry** `~/.local/share/applications/com.rwm.puppet-master-dev.desktop`.
  - **Project folder** `/home/sittingmongoose/Cursor/RWM Puppet Master/` on the VM was **not modified**.
- **Check cleanup:** `.test-cache` and `.test-quota` removed when done (none were present).

## CI

- **Commit:** `6f3e4a2` – pm: gui stream freeze fix, launcher, check status
- **Pushed:** origin/main
- **GitHub Action:** Build installers (run 39) – **PASSED** (status: completed, conclusion: success)

## Done

1. **Tauri from project**
   - `resolveTauriGuiBinary()` in `src/cli/commands/gui.ts` now looks for the Tauri binary in the project when there is no install root: `src-tauri/target/release/puppet-master` (Linux) or `puppet-master.exe` (Windows). Running `node dist/cli/index.js gui` from the repo will open the Tauri window when the binary exists.

2. **Project launcher**
   - Added `run-puppet-master-gui.sh` in the project root. Run `./run-puppet-master-gui.sh` to start the GUI (server + open browser or Tauri). Run `./run-puppet-master-gui.sh --install-desktop` to add “Puppet Master” to the application menu (uses `~/.local/share/applications/com.rwm.puppet-master-dev.desktop`).

3. **Desktop entry**
   - Desktop entry installed so “Puppet Master” appears in the app menu and runs the project launcher (no system install required).

4. **Check cleanup**
   - `.test-cache` and `.test-quota` removed when done (none were present).

## Not done (environment limits)

- **Tauri build:** Building the Tauri desktop binary on this host failed: `pkg-config` and GTK/WebKit dev packages are required (`apt install pkg-config libwebkit2gtk-4.1-dev ...`). Without those, the Tauri window is not built; the GUI still opens in the browser when you run the launcher.
- **System install (.deb):** No `.deb` was built or installed; the app runs from the project via the launcher and desktop entry above.

## How to run the app

- **From app menu:** Open “Puppet Master” in the application menu (if you ran `./run-puppet-master-gui.sh --install-desktop`).
- **From project:** `./run-puppet-master-gui.sh` or `node dist/cli/index.js gui`.  
The server starts and the UI opens in the browser (or in the Tauri window if you build Tauri).
