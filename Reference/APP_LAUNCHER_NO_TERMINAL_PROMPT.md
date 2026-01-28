# App Launcher — Launch GUI Without Terminal (All Platforms)

## Overview

**Goal:** On all three platforms, launching “Puppet Master” (from Applications, Start Menu/Desktop, or app menu) should start the GUI and open the browser **without showing a terminal/console window**.

**Status:**

| Platform | Status | Notes |
|----------|--------|--------|
| **Linux** | ✅ Done | `.desktop` uses `Terminal=false` and app icon |
| **Windows** | ✅ Done | VBS launcher runs `puppet-master gui` with hidden window; shortcuts use .vbs and app icon |
| **macOS** | ✅ Done | App runs Node directly (no Terminal) and includes app icon |

---

# Linux (Implemented)

## What Was Done

**File:** `installer/linux/applications/com.rwm.puppet-master.desktop`

**Change:** `Terminal=true` → `Terminal=false`

**Effect:** When the user launches “Puppet Master” from the application menu (or via the .desktop file), `puppet-master gui` runs in the background. No terminal window is shown. The GUI command opens the browser automatically. The app icon shows in menus.

**Verification:** Install the .deb/.rpm, launch “Puppet Master” from the app menu → browser opens, no terminal.

---

# Windows (Implemented)

## What Was Done

1. **New file:** `installer/win/scripts/Launch-Puppet-Master-GUI.vbs`
   - Uses `WScript.Shell.Run cmd, 0, False` so the window is hidden (0) and the script doesn’t wait (False).
   - Sets working directory to the install folder and runs `bin\puppet-master.cmd gui`.

2. **Updated:** `installer/win/puppet-master.nsi`
   - Installs both `Launch-Puppet-Master-GUI.bat` and `Launch-Puppet-Master-GUI.vbs`.
   - Start Menu and Desktop shortcuts point to `Launch-Puppet-Master-GUI.vbs` instead of the .bat.
   - The .bat remains for users who want to run from a command prompt.

**Effect:** Double‑clicking the Start Menu or Desktop shortcut runs the VBS, which starts `puppet-master gui` with a hidden console. No console window appears; the browser opens as usual. Shortcuts show a proper app icon.

**Verification:** Install the Windows .exe, use “Puppet Master” from Start Menu or Desktop → browser opens, no console window.

---

# macOS (Implemented)

## Context

The macOS installer builds a `.app` bundle (`Puppet Master.app`) that installs to `/Applications`. The app now launches the GUI directly with the embedded Node runtime (no Terminal window).

**Behavior:**
- Double‑clicking “Puppet Master.app” runs the GUI process directly (no Terminal).
- Browser opens automatically (already implemented in the GUI command).
- App appears in Dock and stays running until the user quits (Cmd+Q or Dock → Quit).

## Current Implementation

**File:** `scripts/build-installer.ts`  
**Function:** `buildMacAppBundle()` (lines 312–381)

**Launcher script** now runs:
```bash
cd "$ROOT_DIR"
exec "$NODE_BIN" "$APP_ENTRY" gui
```

## Requirements for macOS

1. **Direct execution:** The app launcher runs `node app/dist/cli/index.js gui` directly, without Terminal.
2. **Process lifecycle:** The Node process must stay running (GUI server runs until quit).
3. **Dock:** App should appear in Dock (default is fine).
4. **Browser:** GUI command already opens the browser; no change needed.
5. **No code signing required:** User accepts an unsigned app and Gatekeeper warning.

## macOS Implementation Summary

- `scripts/build-installer.ts` now runs Node directly and includes `CFBundleIconFile` + `NSHighResolutionCapable`.
- App bundle includes `puppet-master.icns` in Contents/Resources.

## Files Updated (macOS)

- **`scripts/build-installer.ts`**  
  `buildMacAppBundle()` runs Node directly and wires the app icon.

## Acceptance Criteria (macOS)

- [ ] Double‑clicking “Puppet Master.app” launches the GUI without opening Terminal.
- [ ] Browser opens automatically to the GUI URL.
- [ ] App appears in Dock and stays running until quit.
- [ ] No Terminal window appears.
- [ ] Installer build and .pkg install succeed.

## Out of Scope (All Platforms)

- Code signing / notarization.
- Custom app icons.
- App Store or other store distribution.
- Auto‑update, menu bar, or notification features.

---

## Reference

- **GUI command:** `src/cli/commands/gui.ts` — already opens browser and handles SIGINT/SIGTERM.
- **Linux .desktop:** `installer/linux/applications/com.rwm.puppet-master.desktop` — `Terminal=false`.
- **Windows launcher:** `installer/win/scripts/Launch-Puppet-Master-GUI.vbs` — hidden window launcher; shortcuts in `installer/win/puppet-master.nsi` use this .vbs.
- **macOS app build:** `scripts/build-installer.ts` → `buildMacAppBundle()`.

---

**Document purpose:** One place for “launch GUI without terminal” on Linux, Windows, and macOS. Linux and Windows are implemented; macOS is left as clear, copy‑paste‑able tasks for another agent.
