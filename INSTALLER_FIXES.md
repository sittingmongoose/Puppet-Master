# Installer Fixes - Testing Guide

## Changes Made

### Windows
1. **Hidden console window**: Added `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]` to `main.rs`
2. **Working directory**: Updated to use `%LOCALAPPDATA%\RWM Puppet Master` instead of Program Files
3. **Config discovery**: Updated `ConfigManager::discover()` to search in workspace directory first
4. **Config saving**: Updated `ConfigManager::save()` to auto-create config in workspace if none exists

### Linux
1. **Postinstall script**: Updates desktop database and icon cache, shows success message
2. **Preinstall script**: Checks for required libraries before installation
3. **Working directory**: Detects `/usr/bin` install and uses `~/.local/share/RWM Puppet Master`
4. **Build validation**: Script now verifies package structure before creating DEB
5. **Enhanced dependencies**: Added libgdk-pixbuf-2.0-0 to required packages
6. **Error handling**: Build script exits with clear errors if any step fails
7. **Package verification**: Displays package info and contents after build

### macOS
1. **Ad-hoc code signing**: DMG and app bundle are now signed with `-` (ad-hoc signature)
   - Eliminates "damaged app" error
   - Changes to "unidentified developer" dialog (user can approve with right-click → Open)
   - Requires no manual terminal commands
2. **Build verification**: GitHub Actions now verifies code signing after build

## Testing Requirements

**IMPORTANT**: You must rebuild the installers with these code changes for the fixes to take effect!

### Step 1: Rebuild Installers

```bash
# Trigger a new GitHub Actions build
git add -A
git commit -m "Fix installer permission and path issues"
git push

# Wait for GitHub Actions to complete
# Download new installers from Actions artifacts
```

### Step 2: Test Windows

1. Uninstall old version via Control Panel
2. Install new version from rebuilt `.exe`
3. Launch app - verify NO console window appears
4. Check dashboard - should not show "access denied" error
5. Go to Config tab - click Refresh
   - Should show config without "file not found" error
   - If no config exists, it will create `%LOCALAPPDATA%\RWM Puppet Master\pm-config.yaml`
6. Check that data is stored in: `C:\Users\<YourName>\AppData\Local\RWM Puppet Master`

### Step 3: Test Linux

1. Remove old version: `sudo dpkg -r puppet-master`
2. Install new DEB: `sudo dpkg -i puppet-master_0.1.1_amd64.deb`
   - Should complete without silent failures
   - Should show success message
3. Launch from application menu
4. Verify data is stored in: `~/.local/share/RWM Puppet Master`

### Step 4: Test macOS

1. Download new DMG from GitHub Actions
2. Open the DMG (no terminal commands needed!)
3. Drag app to Applications folder
4. **First launch only**: Right-click app → Select "Open" → Click "Open" in dialog
5. Future launches: Double-click normally
6. Should NOT see "damaged" error (ad-hoc signed)
7. Will see "unidentified developer" dialog (expected for non-notarized apps)

## Expected Behavior After Fixes

| Platform | Data Location | Config File |
|----------|---------------|-------------|
| Windows  | `%LOCALAPPDATA%\RWM Puppet Master` | `pm-config.yaml` |
| Linux    | `~/.local/share/RWM Puppet Master` | `pm-config.yaml` |
| macOS    | Current working directory | `pm-config.yaml` |

## Common Issues

### "Still seeing the same errors"
- **Cause**: Testing with old builds that don't include the fixes
- **Solution**: Download fresh builds from GitHub Actions after pushing these changes

### Windows: "Config tab still shows error"
- **Cause**: Permission denied on workspace directory
- **Check**: Verify workspace is in `%LOCALAPPDATA%` not Program Files
- **Debug**: Check logs at `%LOCALAPPDATA%\RWM Puppet Master\.puppet-master\logs\`

### Linux: "DEB install closes immediately"
- **Cause**: Missing dependencies or old build
- **Solution**:
  ```bash
  sudo apt-get install libgtk-3-0 libglib2.0-0 libcairo2 libpango-1.0-0
  sudo dpkg -i puppet-master_0.1.1_amd64.deb
  ```

### macOS: "Still shows damaged error"
- **Cause**: Didn't remove quarantine attribute
- **Solution**: Run `xattr -cr "/Applications/RWM Puppet Master.app"` after installing

## Verification Commands

```bash
# Windows (PowerShell)
Test-Path "$env:LOCALAPPDATA\RWM Puppet Master"
Get-ChildItem "$env:LOCALAPPDATA\RWM Puppet Master" -Recurse

# Linux
ls -la ~/.local/share/RWM\ Puppet\ Master
cat ~/.local/share/RWM\ Puppet\ Master/pm-config.yaml

# macOS
xattr -l "/Applications/RWM Puppet Master.app"  # Should show no quarantine
```

## Files Changed

- `puppet-master-rs/src/main.rs` - Hide console window on Windows
- `puppet-master-rs/src/config/default_config.rs` - Platform-specific workspace dirs
- `puppet-master-rs/src/config/config_manager.rs` - Config discovery and save logic
- `puppet-master-rs/src/doctor/checks/runtime_check.rs` - Runtime check workspace
- `scripts/build-linux-installer.sh` - Added postinstall script
- `installer/README.md` - Installation instructions
- `installer/macos/build-dmg.sh` - Code signing notes
