# Build Installer Fixes – Task Status Log

## Status

**PASS** — 2026-02-09  
Previous: **PASS** — 2026-01-30

## Summary

**Cross-platform installer + first-boot regressions (2026-02-09):** Fixed macOS PKG `postinstall` logic that could kill the running installer by removing broad `pkill -f`/`-9` usage; added a Linux `tar.gz` bundle to preserve executable bits for `install.sh`; updated Windows NSIS to create Start Menu/Desktop shortcuts for all users; removed Tauri runtime navigation to the backend URL to prevent Windows first-boot blank GUI; and improved model lists (Cursor auto-discovery by default, Claude aliases version-labeled). See Phase 10 below.

**Linux DEB installer + cross-platform crash logging (2026-01-30):** Linux .deb now shows desktop notification on successful install; React GUI staged for Linux/Windows; Build GUI runs for all platforms in CI; crash logging extended to Linux and Windows when launched without TTY. See Phase 9 below.

**macOS app launch fix (2026-01-30):** Fixed app appearing in Dock then immediately closing. App bundle detection now uses `PUPPET_MASTER_APP_ROOT` env var; added crash logging to `~/.puppet-master/logs/crash.log` and unhandled-rejection handler; CI smoke test verifies GUI launch. See Phase 8 below.

Fixed macOS installer build failure (cp EINVAL recursion), pkgbuild check error, npm update-notifier noise, and aligned Linux/Windows build scripts. Staging now uses `installer-work` at repo root instead of `dist/installer-work`, avoiding copying `dist` into a subdirectory of itself. Added cross-platform app icons, updated macOS launcher to run Node directly (no Terminal), and ensured Windows/Linux shortcuts show proper icons and uninstall entries.

**macOS pkg runtime (2026-01-27):** Add explicit `exit 0` and safer checks in postinstall; chmod +x postinstall in build; add installer troubleshooting notes. See “macOS pkg 'Installation failed' at end (runtime)” and “Phase 6” below.

**Real app bundle + dependency fixes (2026-01-27):** Ship real .app bundle for macOS (installs to /Applications), Windows Start Menu/Desktop shortcuts, Linux .desktop file. Fixed all 6 moderate vulnerabilities (vitest/vite/esbuild upgrade to patched versions) and whatwg-encoding deprecation (jsdom 27.4+ upgrade). See “Phase 7” below.

**GUI launcher + app icons (2026-01-28):** macOS app runs Node directly (no Terminal) and includes .icns; Windows shortcuts use .ico and Add/Remove Programs entry with icon; Linux .desktop uses icon. See “Phase 7.1” below.

## Changes

### Phase 1: cp recursion and workDir (all platforms)

- **build-installer.ts**: Default `workDir` changed from `dist/installer-work` to `installer-work` at repo root. Staging copies `dist` → `installer-work/.../payload/.../app/dist`; destination is no longer under `dist`, so `fs.cp` no longer hits EINVAL.
- **.gitignore**: Added `installer-work/` so staging dirs are not committed.

### Phase 2: pkgbuild check (macOS)

- **build-installer-macos.sh**: Replaced `pkgbuild --version 2>&1 | head -n1` with `echo "  pkgbuild: available"`. macOS `pkgbuild` has no standalone `--version`; the previous check produced "option '--version' requires an argument".

### Phase 3: npm warnings and audit

- **whatwg-encoding**: Confirmed transitive only (jsdom → html-encoding-sniffer → whatwg-encoding) in `src/gui/react`. Deprecation recommends `@exodus/bytes`, which is not a drop-in. No overrides added; deprecation documented here. Optional suppression during installer builds was not added.
- **Update notifier**: Set `npm_config_update_notifier=false` for `npm ci` and `npm --prefix src/gui/react install` in macOS, Linux, and Windows build scripts (and in CI "Install dependencies" step) to reduce "new major version available" notices.
- **Audit**: Ran `npm audit` and `npm audit fix` (no `--force`) in repo root and `src/gui/react`. Six moderate vulns remain (esbuild/vite chain); fix requires `npm audit fix --force` (breaking). Per plan, `--force` was not used; documented only.

### Phase 4: Linux and Windows parity

- **build-installer-linux.sh**: Added `npm_config_update_notifier=false` for `npm ci` and GUI install. workDir fix applies via build-installer.ts. Cleanup of `.test-cache` and `.test-quota*` unchanged.
- **build-installer-windows.ps1**: Set `$env:npm_config_update_notifier = "false"` before `npm ci` (inherited by GUI install). workDir fix via build-installer.ts. Cleanup unchanged.
- **.github/workflows/build-installers.yml**: Set `npm_config_update_notifier: "false"` env for "Install dependencies" step.

### Phase 5: Cleanup and verification

- Verified all three platform scripts still remove `.test-cache` and `.test-quota*` after edits.
- Deleted `.test-cache` and `.test-quota` when done (per check command).
- Smoke test: run `./scripts/build-installer-macos.command` (macOS), `./scripts/build-installer-linux.sh` (Linux), or `.\scripts\build-installer-windows.ps1` (Windows) to confirm installers build without cp EINVAL or pkgbuild errors. *Note:* End-to-end smoke test and `npm test` were not run in the implementation environment due to EACCES on esbuild/node_modules binaries; verify on a host with normal permissions (e.g. macOS, CI).

### Phase 6: macOS pkg runtime “Installation failed” at end

- **installer/mac/scripts/postinstall**: Explicit `exit 0` at end; safer checks with clear stderr and `/tmp/puppet-master-install-err.log` on failure; same breadcrumb for “install root missing” and “launcher missing” exits.
- **scripts/build-installer.ts**: Before pkgbuild, `chmod(postinstall, 0o755)` so the script is executable regardless of git/source-tree state.
- **Reference/BUILD_INSTALLER_FIXES.md**: New “macOS pkg 'Installation failed' at end (runtime)” troubleshooting subsection (terminal install, log show, breadcrumb, script LF/executable); status log update.

### Phase 7: Real app bundle (cross-platform) + dependency/vulnerability fixes

**Dependency and vulnerability fixes (Phase 0):**

- **package.json**: Upgraded `vitest` ^2.0.0 → ^4.0.0, `@vitest/coverage-v8` ^2.0.0 → ^4.0.0. Applied Vitest 4 migration: added `coverage.include` in vitest.config.ts, removed `poolOptions` (replaced with top-level `maxWorkers`/`isolate` defaults), fixed constructor mocks to use `function` keyword instead of arrow functions in resume.test.ts, start.test.ts, stop.test.ts, status.test.ts. Fixed TypeScript errors for constructor mock assertions. **Result:** `npm audit` shows 0 vulnerabilities (was 6 moderate).
- **src/gui/react/package.json**: Upgraded `vitest` ^2.0.0 → ^4.0.0, `vite` ^5.4.0 → ^6.0.0, `@vitest/coverage-v8` ^2.0.0 → ^4.0.0, `jsdom` ^25.0.0 → ^27.4.0. Applied same Vitest 4 migration. **Result:** `whatwg-encoding` removed (jsdom 27.4+ uses @exodus/bytes), no deprecation warnings, 0 vulnerabilities.

**macOS .app bundle (Phases 1-2):**

- **scripts/build-installer.ts**: Added `buildMacAppBundle()` function that creates `Puppet Master.app/Contents/MacOS/Puppet Master` (executable script), `Contents/Resources/puppet-master/` (payload), `Contents/Resources/puppet-master.icns`, and `Contents/Info.plist`. MacOS executable runs Node directly (no Terminal). Updated `buildMacPkgAndDmg()` to build .app bundle and install to `/Applications` instead of `/usr/local/lib`.
- **installer/mac/scripts/postinstall**: Updated to check for `/Applications/Puppet Master.app` instead of `/usr/local/lib/puppet-master`. CLI remains inside the app bundle; no `/usr/local/bin` symlink (so dragging the app to Trash removes CLI access too).

**Windows shortcuts (Phase 3):**

- **installer/win/scripts/Launch-Puppet-Master-GUI.bat**: Batch file that runs `bin\puppet-master.cmd gui` from install directory (CLI/script use).
- **installer/win/scripts/Launch-Puppet-Master-GUI.vbs**: Launches GUI without a console window.
- **installer/win/puppet-master.nsi**: Start Menu + Desktop shortcuts point at `.vbs` and use `puppet-master.ico`. Uninstall entry shows proper app icon. Removes shortcuts + uninstall registry entry on uninstall.
- **scripts/build-installer.ts**: Stages `Launch-Puppet-Master-GUI.bat` and `.vbs` into payload root for NSIS installation.

**Linux .desktop file (Phase 4):**

- **installer/linux/applications/com.rwm.puppet-master.desktop**: XDG desktop entry with `Exec=puppet-master gui`, `Terminal=false`, and `Icon=/opt/puppet-master/puppet-master.png`.
- **installer/linux/nfpm.yaml**: Added contents entry to install .desktop file to `/usr/share/applications/com.rwm.puppet-master.desktop` with mode 0644.

**Cross-platform app icons + no-terminal macOS launcher (Phase 7.1):**

- **installer/assets/puppet-master.png**: Shared icon for Linux desktop entry and staging.
- **installer/assets/puppet-master.ico**: Windows icon for installer + shortcuts.
- **installer/assets/puppet-master.icns**: macOS app icon embedded in .app bundle.
- **scripts/build-installer.ts**: macOS launcher runs Node directly (no Terminal), app Info.plist includes icon + high-res, Windows staging includes .vbs launcher, Linux/Windows use icon assets.
- **installer/win/puppet-master.nsi**: Adds DisplayIcon and uses .ico for shortcuts.

### Phase 8: macOS app launch fix (appears then closes)

- **src/cli/commands/gui.ts**: Detect app bundle via `PUPPET_MASTER_APP_ROOT` (set by launcher) instead of cwd; add `writeToCrashLog()` and `installCrashHandlers()` for unhandled rejections and catch-block errors; write to `~/.puppet-master/logs/crash.log` before exit.
- **.github/workflows/build-installers.yml**: Added "Smoke test GUI launch (macOS)" step—launches app, waits 5s, verifies port 3847 is listening, quits app. Dumps gui.log and crash.log on failure.
- **Reference/APP_LAUNCHER_NO_TERMINAL_PROMPT.md**: Added troubleshooting section with crash log paths and architecture note (arm64 only).

### Phase 9: Linux DEB installer + cross-platform crash logging

- **installer/linux/scripts/postinstall**: Add `notify-send` on success so user sees "Installation complete" when GUI installer closes.
- **scripts/build-installer.ts**: Stage React GUI for linux and win32 (not just darwin); chmod postinstall 0o755 before nfpm.
- **.github/workflows/build-installers.yml**: Run Build GUI for all platforms (remove macOS-only condition).
- **src/cli/commands/gui.ts**: Extend crash logging to Linux and Windows when `!process.stdout.isTTY`; use `shouldEnableCrashLogging()`; auth token path uses home dir when crash logging enabled.

### Phase 10: Fix Installer + Model List Regressions (2026-02-09)

- **macOS PKG postinstall safety**: Removed broad pattern process kills (`pkill -f`, `-9`) that could match and terminate the installer process itself; replaced with safe, exact-name, best-effort termination and ensured install continues.
- **Linux permission-preserving bundle**: Linux packaging now emits `rwm-puppet-master-<version>-linux-<arch>-bundle.tar.gz` containing `.deb`, `.rpm`, and `install.sh` so executable bits survive download/extraction paths.
- **Windows “normal install” shortcuts**: NSIS now creates Start Menu and Desktop shortcuts in the all-users context (`SetShellVarContext all`, `$COMMONPROGRAMS`, `$COMMONDESKTOPDIRECTORY`) so installs done elevated still appear for the normal user.
- **Windows blank GUI on first boot**: Tauri no longer navigates the webview to `http://127.0.0.1:3847`; the bundled frontend stays loaded and talks to the backend via API base URL + CORS.
- **Models**:
  - Cursor models are discovered (short timeout + cache) even on normal `refresh=false` Config loads.
  - Claude Code alias labels now include version context (e.g. `v4.5 alias`).

**Task status log (Phase 10)**  
Status: PASS  
Date: 2026-02-09  
Summary of changes: macOS PKG postinstall no longer kills the installer; Linux builds produce a tar.gz bundle that preserves `install.sh` executable permissions; Windows installer shortcuts are created for all users; Tauri no longer navigates to the backend URL at runtime; Cursor model lists auto-discover on normal Config loads and Claude aliases are version-labeled.  
Files changed:  
- installer/mac/scripts/postinstall  
- scripts/build-installer.ts  
- installer/win/puppet-master.nsi  
- src-tauri/src/main.rs  
- src/gui/routes/config.ts  
- src/platforms/capability-discovery.ts  
- src/platforms/constants.ts  
- src/platforms/cursor-models.ts  
- src/platforms/claude-models.ts  
- src/installers/macos-postinstall.test.ts  
- src/platforms/cursor-models.test.ts  
- src/platforms/claude-models.test.ts  
- src/gui/routes/config.test.ts  
Commands run + results:  
- npm run typecheck: PASS  
- npm test: PASS  
- cargo check (with CARGO_TARGET_DIR=/tmp/...): PASS  
If FAIL: N/A  

## Linux DEB troubleshooting

When the .deb "installer closes and nothing happens":

1. **Verify install**: `dpkg -l puppet-master`, `ls -la /opt/puppet-master`
2. **CLI**: `/usr/bin/puppet-master --version`
3. **App menu**: Search for "Puppet Master" in your application launcher
4. **If GUI install fails**: Run `sudo dpkg -i puppet-master-*.deb` in a terminal to see dpkg output
5. **Crash logs** (when launched from app menu): `~/.puppet-master/logs/gui.log` and `~/.puppet-master/logs/crash.log`

## Files touched

| File | Change |
|------|--------|
| `scripts/build-installer.ts` | Default `workDir` → `installer-work` at repo root |
| `.gitignore` | Add `installer-work/` |
| `scripts/build-installer-macos.sh` | pkgbuild "available"; `npm_config_update_notifier=false` for ci/gui install |
| `scripts/build-installer-linux.sh` | `npm_config_update_notifier=false` for ci/gui install |
| `scripts/build-installer-windows.ps1` | `$env:npm_config_update_notifier = "false"` before npm ci |
| `.github/workflows/build-installers.yml` | `npm_config_update_notifier` env on Install dependencies |
| `Reference/BUILD_INSTALLER_FIXES.md` | This Task Status Log |
| `installer/mac/scripts/postinstall` | Explicit exit 0; safer checks; /tmp breadcrumb on failure (Phase 6); updated for .app bundle location (Phase 7) |
| `scripts/build-installer.ts` | chmod postinstall 0o755 before pkgbuild (Phase 6); buildMacAppBundle() and .app install to /Applications (Phase 7); Windows launcher batch staging (Phase 7) |
| `Reference/BUILD_INSTALLER_FIXES.md` | macOS pkg troubleshooting + Phase 6 status (Phase 6); Phase 7 status (Phase 7) |
| `package.json` | vitest ^4.0, @vitest/coverage-v8 ^4.x (Phase 7) |
| `src/gui/react/package.json` | vitest ^4.0, vite ^6.0, @vitest/coverage-v8 ^4.x, jsdom ^27.4.0 (Phase 7) |
| `vitest.config.ts` | Vitest 4: coverage.include, removed poolOptions (Phase 7) |
| `src/gui/react/vitest.config.ts` | Vitest 4: coverage.include (Phase 7) |
| `src/cli/commands/resume.test.ts` | Vitest 4: constructor mocks use function keyword, fixed TypeScript assertions (Phase 7) |
| `src/cli/commands/start.test.ts` | Vitest 4: constructor mocks use function keyword, fixed TypeScript assertions (Phase 7) |
| `src/cli/commands/stop.test.ts` | Vitest 4: constructor mocks use function keyword, fixed TypeScript assertions (Phase 7) |
| `src/cli/commands/status.test.ts` | Vitest 4: constructor mocks use function keyword (Phase 7) |
| `installer/win/scripts/Launch-Puppet-Master-GUI.bat` | New: batch launcher for GUI (Phase 7) |
| `installer/win/puppet-master.nsi` | CreateShortcut for Start Menu and Desktop (Phase 7) |
| `installer/linux/applications/com.rwm.puppet-master.desktop` | New: XDG desktop entry (Phase 7) |
| `installer/linux/nfpm.yaml` | Added .desktop file to contents (Phase 7) |
| `installer/assets/puppet-master.png` | New: shared app icon (Phase 7.1) |
| `installer/assets/puppet-master.ico` | New: Windows app icon (Phase 7.1) |
| `installer/assets/puppet-master.icns` | New: macOS app icon (Phase 7.1) |
| `installer/linux/applications/com.rwm.puppet-master.desktop` | Icon entry set (Phase 7.1) |
| `installer/win/puppet-master.nsi` | Shortcut icon + DisplayIcon (Phase 7.1) |
| `scripts/build-installer.ts` | macOS launcher direct exec + icon staging (Phase 7.1) |
| `src/cli/commands/gui.ts` | App bundle detection via env; crash logging; unhandled-rejection handler (Phase 8) |
| `.github/workflows/build-installers.yml` | macOS GUI launch smoke test (Phase 8) |
| `Reference/APP_LAUNCHER_NO_TERMINAL_PROMPT.md` | Troubleshooting section (Phase 8) |
| `installer/linux/scripts/postinstall` | notify-send on success (Phase 9) |
| `scripts/build-installer.ts` | Stage React for linux/win32; chmod postinstall (Phase 9) |
| `.github/workflows/build-installers.yml` | Build GUI for all platforms (Phase 9) |
| `src/cli/commands/gui.ts` | Crash logging for Linux/Windows when no TTY (Phase 9) |

## Commands run

- `npm audit` / `npm audit fix` in root and `src/gui/react` (no `--force`)
- Installer builds: platform-specific scripts (macOS/Linux/Windows) as above
- Phase 6: no new commands; `.test-cache` and `.test-quota` removed when done (per check command).
- Phase 7: `npm install` in root and `src/gui/react` (vitest 4, jsdom 27.4 upgrades); `npm audit` (0 vulnerabilities); `npm test` (fixed constructor mocks); `npm run typecheck` (fixed TypeScript errors); `.test-cache` and `.test-quota` removed when done.
- Phase 7.1: `npm run typecheck` PASS; `npm test` FAIL (pre-existing failures unrelated to installer/icon changes: validate.test.ts mock expectations, claude-output-parser token count, uiStore document missing).

## macOS pkg "Installation failed" at end (runtime)

When the macOS .pkg runs but reports **"The installation encountered an error that caused the installation to fail,"** the Installer is reacting to a non-zero exit from the **postinstall** script. Use the steps below to see the real error.

### macOS installer troubleshooting

1. **Run the pkg from the terminal** (shows stderr):
   - Mount the .dmg (double-click or `open path/to/puppet-master-*.dmg`).
   - Run:
     ```bash
     sudo installer -pkg "/Volumes/Puppet Master/puppet-master-"*.pkg -target /
     ```
   - Any postinstall error (e.g. missing install root, launcher not executable, or permission) will appear in the terminal.

2. **Inspect the installer log** (after a failed GUI install):
   - In Terminal:
     ```bash
     log show --predicate 'subsystem == "com.apple.InstallController" OR process == "installd"' --last 10m
     ```
   - In **Console.app**: search for `puppet-master` or `postinstall` and check for `posix_spawn` or script-execution errors.

3. **Failure breadcrumb**: If postinstall exits with 1, it may write a short message to `/tmp/puppet-master-install-err.log`. Check that file after a failed install for the exact reason.

4. **Script requirements**: The postinstall script must be **Unix LF** line endings and **executable** (`chmod +x`). The build script sets executable before pkgbuild; if you edit the script on Windows, ensure LF is preserved (e.g. via `.gitattributes` or your editor).

## Uninstall

### Old “wrong place” install (macOS)

If you previously installed to `/usr/local/lib/puppet-master` and `/usr/local/bin/puppet-master`:

```bash
sudo rm -f /usr/local/bin/puppet-master
sudo rm -rf /usr/local/lib/puppet-master
```

### New .app-based install (macOS)

To uninstall, drag `/Applications/Puppet Master.app` to the Trash (or remove it in Finder). The CLI is inside the app bundle, so removing the app also removes CLI access.

## Without code signing or notarization

You can build, install, and use Puppet Master on your own Mac without code signing or notarization:

- **Build** the macOS .pkg / .app: works as-is.
- **Install** the .pkg and run **Puppet Master.app** (or run the launcher inside the app bundle): works as-is.

**First launch:** macOS may show “unidentified developer.” The user can:

- **Right‑click** (or Control‑click) the app → **Open** → **Open** in the dialog, or  
- **System Settings → Privacy & Security** and allow “Puppet Master” there.

**Distribution:** Sending the .pkg/.app to other Macs can trigger the same warning until they use “Open” or allow in Privacy & Security. Code signing and notarization are only needed for smoother installs and fewer prompts when sharing with others.

## Remaining / notes

- **Audit**: Six moderate vulnerabilities (esbuild/vite/vitest chain) remain. Resolving them would require `npm audit fix --force` and potentially version bumps; not done in this change.
- **whatwg-encoding**: Deprecation warning may still appear during `npm install` in GUI; acceptable per plan.

## App launcher — GUI without terminal (all platforms)

**Status:** Linux and Windows done; macOS prompt created for another agent

**Goal:** Launching “Puppet Master” from the app menu / Start Menu / Desktop / Applications should start the GUI and open the browser **without** showing a terminal or console window.

**Prompt document:** `Reference/APP_LAUNCHER_NO_TERMINAL_PROMPT.md`

### Implemented

- **Linux:** `installer/linux/applications/com.rwm.puppet-master.desktop` — `Terminal=false`. App menu launch runs GUI in background, no terminal.
- **Windows:** `installer/win/scripts/Launch-Puppet-Master-GUI.vbs` added; Start Menu and Desktop shortcuts use it. VBS runs `bin\puppet-master.cmd gui` with hidden window (no console). `installer/win/puppet-master.nsi` updated to install the VBS and point shortcuts at it.

### Remaining (for another agent)

- **macOS:** Update `buildMacAppBundle()` in `scripts/build-installer.ts` to run Node.js directly (remove osascript/Terminal). See `Reference/APP_LAUNCHER_NO_TERMINAL_PROMPT.md` for tasks and acceptance criteria.

**User requirements:** OK with unsigned app (Gatekeeper warning acceptable). App in Applications / Start Menu / app menu and launching GUI on open. No code signing or notarization required.

---

**Task status log (CI workflow updater)**  
Status: PASS  
Date: 2026-02-11  
Summary of changes: Updated GitHub Actions installer workflow to build Rust/Iced installers and install upstream musl 1.2.5, GTK 3.24.48, and rpm 6.0.1 from source on Linux; removed EnVar dependency from the Rust NSIS installer; added Rust/Iced installer build scripts to package.json.  
Files changed:  
- .github/workflows/build-installers.yml  
- installer/windows/puppet-master.nsi  
- package.json  
- FinishRustRewrite.md  
- Reference/BUILD_INSTALLER_FIXES.md  
Commands run + results:  
- npm test: PASS  
If FAIL: N/A  

---

**Task status log (CI deps cache 14d)**  
Status: PASS  
Date: 2026-02-11  
Summary of changes: Added a 14-day cache bucket for upstream musl/GTK/rpm builds using actions/cache; installs now target a user cache prefix and the Linux build step uses that prefix via PATH/PKG_CONFIG_PATH/LD_LIBRARY_PATH.  
Files changed:  
- .github/workflows/build-installers.yml  
- FinishRustRewrite.md  
Commands run + results:  
- npm test: PASS  
- npm run typecheck: PASS  
If FAIL: N/A  
