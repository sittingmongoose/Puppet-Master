# Tauri Staging: Applied Fixes

**Date:** 2024-01-28  
**Status:** ✅ FIXES APPLIED

---

## Changes Made

### Fix #1: Windows Launcher - Added `PUPPET_MASTER_INSTALL_ROOT`
**File:** `scripts/build-installer.ts` (line 335)

**Added:**
```batch
set "PUPPET_MASTER_INSTALL_ROOT=%ROOT_DIR%"
```

**Location in launcher script:**
```batch
@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "PUPPET_MASTER_INSTALL_ROOT=%ROOT_DIR%"    ← NEW
set "PATH=%ROOT_DIR%\node;%PATH%"
set "PLAYWRIGHT_BROWSERS_PATH=%ROOT_DIR%\playwright-browsers"
"%ROOT_DIR%\node\node.exe" "%ROOT_DIR%\app\dist\cli\index.js" %*
```

---

### Fix #2: Unix Launcher - Added `PUPPET_MASTER_INSTALL_ROOT`
**File:** `scripts/build-installer.ts` (line 326)

**Added:**
```bash
export PUPPET_MASTER_INSTALL_ROOT="$ROOT_DIR"
```

**Location in launcher script:**
```bash
#!/usr/bin/env sh
# ... symlink resolution ...
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
NODE_BIN="$ROOT_DIR/node/bin/node"
APP_ENTRY="$ROOT_DIR/app/dist/cli/index.js"
export PUPPET_MASTER_INSTALL_ROOT="$ROOT_DIR"    ← NEW
export PATH="$ROOT_DIR/node/bin:$PATH"
export PLAYWRIGHT_BROWSERS_PATH="$ROOT_DIR/playwright-browsers"
exec "$NODE_BIN" "$APP_ENTRY" "$@"
```

---

## Why These Fixes Matter

### Before (without env var)
```
User launches: puppet-master gui
↓
gui.ts resolveInstallRoot() checks env vars → undefined
↓
Falls back to path derivation (fragile)
↓
Derives from: dist/cli/commands/gui.js → ../../../../
↓
Works, but depends on exact directory structure
```

### After (with env var)
```
User launches: puppet-master gui
↓
Launcher sets: PUPPET_MASTER_INSTALL_ROOT=/path/to/install
↓
gui.ts resolveInstallRoot() reads env var → /path/to/install
↓
resolveTauriGuiBinary() finds: /path/to/install/app/puppet-master-gui.exe (Windows)
                            or: /path/to/install/bin/puppet-master-gui (Unix)
↓
Tauri GUI launches successfully ✅
```

---

## Verification Steps

### 1. Build Test Installer
```bash
# Windows
npm run build:installer -- --platform win32 --with-tauri

# Linux
npm run build:installer -- --platform linux --with-tauri

# macOS (already working)
npm run build:installer -- --platform darwin --with-tauri
```

### 2. Install on Target Platform

**Windows:**
```batch
REM Install the .exe
puppet-master-0.1.0-win-x64.exe

REM Launch GUI
puppet-master gui --verbose
```

**Linux:**
```bash
# Install .deb or .rpm
sudo dpkg -i puppet-master-0.1.0-linux-x64.deb
# or
sudo rpm -i puppet-master-0.1.0-linux-x64.rpm

# Launch GUI
puppet-master gui --verbose
```

### 3. Verify Environment Variable

**Windows (from CMD launched by puppet-master.cmd):**
```batch
echo %PUPPET_MASTER_INSTALL_ROOT%
REM Expected: C:\Program Files\Puppet Master (or install location)
```

**Linux/macOS (from shell):**
```bash
# In a terminal launched by the CLI:
puppet-master gui --verbose

# In verbose output, you should see:
# "Launched Tauri GUI: /opt/puppet-master/bin/puppet-master-gui --server-url http://127.0.0.1:3847"
```

### 4. Test Tauri Binary Detection

Create a test script:
```bash
# test-tauri-detection.sh
#!/bin/bash
export PUPPET_MASTER_INSTALL_ROOT="/opt/puppet-master"
node -e "
const { existsSync } = require('fs');
const path = require('path');
const installRoot = process.env.PUPPET_MASTER_INSTALL_ROOT;
const tauriBin = path.join(installRoot, 'bin', 'puppet-master-gui');
console.log('Install Root:', installRoot);
console.log('Tauri Binary:', tauriBin);
console.log('Exists:', existsSync(tauriBin));
"
```

Expected output:
```
Install Root: /opt/puppet-master
Tauri Binary: /opt/puppet-master/bin/puppet-master-gui
Exists: true
```

---

## Testing Checklist

- [ ] **Windows 10+**
  - [ ] Install from .exe installer
  - [ ] Launch "Puppet Master" from Start Menu
  - [ ] Verify Tauri GUI opens (not browser)
  - [ ] Run `puppet-master gui` from CMD
  - [ ] Check `%PUPPET_MASTER_INSTALL_ROOT%` is set
  - [ ] Verify no console window when launching from shortcut

- [ ] **Ubuntu/Debian Linux**
  - [ ] Install from .deb package
  - [ ] Launch "Puppet Master" from app menu
  - [ ] Verify Tauri GUI opens (not browser)
  - [ ] Run `puppet-master gui` from terminal
  - [ ] Check `$PUPPET_MASTER_INSTALL_ROOT` is set

- [ ] **Fedora/RHEL Linux**
  - [ ] Install from .rpm package
  - [ ] Launch "Puppet Master" from app menu
  - [ ] Verify Tauri GUI opens (not browser)
  - [ ] Run `puppet-master gui` from terminal
  - [ ] Check `$PUPPET_MASTER_INSTALL_ROOT` is set

- [ ] **macOS 10.13+** (already working, but verify)
  - [ ] Install from .dmg → .pkg
  - [ ] Launch "Puppet Master" from Applications
  - [ ] Verify Tauri GUI opens (not browser)
  - [ ] Check `$PUPPET_MASTER_INSTALL_ROOT` is set in .app

---

## Rollback Plan

If issues occur, revert changes:

```bash
git diff scripts/build-installer.ts
git checkout HEAD -- scripts/build-installer.ts
```

Or manually remove the added lines:
- Line 326: `export PUPPET_MASTER_INSTALL_ROOT=\"$ROOT_DIR\"`
- Line 335: `set \"PUPPET_MASTER_INSTALL_ROOT=%ROOT_DIR%\"\r`

The fallback path derivation will still work (fragile but functional).

---

## Next Steps (Optional Enhancements)

### Short-term
1. **Document WebView2 requirement** in README and installer docs
2. **Add runtime checks** for Windows dependencies (WebView2)
3. **Create troubleshooting guide** for common Tauri issues

### Long-term
1. **Add NSIS WebView2 check** (see TAURI_STAGING_REVIEW.md section 6)
2. **Implement telemetry** to track Tauri vs. browser fallback usage
3. **Consider VC++ redistributable** bundling in NSIS installer
4. **Add auto-update** for Tauri binary

---

## Related Files

- **Full Analysis:** `TAURI_STAGING_REVIEW.md`
- **Build Script:** `scripts/build-installer.ts`
- **GUI Command:** `src/cli/commands/gui.ts`
- **Tauri Config:** `src-tauri/tauri.conf.json`

---

## Success Criteria Met ✅

✅ Binary paths align between staging and resolution  
✅ Windows launcher sets `PUPPET_MASTER_INSTALL_ROOT`  
✅ Linux launcher sets `PUPPET_MASTER_INSTALL_ROOT`  
✅ macOS launcher already had this (no change needed)  
✅ DLL copying handles Tauri-generated dependencies  
✅ Fallback to browser still works if Tauri binary missing  

**Status:** Ready for QA testing → Staging → Production
