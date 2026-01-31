# Tauri Desktop App Integration

## Overview

This document describes the Tauri desktop app integration for Puppet Master, which provides a native desktop application wrapper around the existing React GUI while maintaining full CLI functionality.

## Architecture

The Tauri integration follows a minimal, additive approach:

```
puppet-master/
├── src/gui/react/          # Existing React SPA (unchanged)
├── src-tauri/              # Tauri backend (Rust wrapper)
│   ├── src/
│   │   └── main.rs        # Tauri main process
│   ├── tauri.conf.json    # Tauri configuration
│   ├── Cargo.toml         # Rust dependencies
│   └── build.rs           # Tauri build script
└── installer/             # Updated installer scripts
```

### Key Design Decisions

1. **Existing GUI Unchanged**: The React app in `src/gui/react/` remains unchanged and continues to work as a web-based GUI
2. **Dual Launch Modes**: Users can launch via:
   - Desktop app (double-click icon) → Tauri app
   - CLI command `puppet-master gui` → Web browser (existing behavior, or Tauri if built)
3. **Optional Build**: Tauri is optional; builds work without Rust/Tauri installed
4. **Native Installers**: Tauri produces native installers for each platform
5. **CLI Preserved**: The CLI remains fully accessible from terminal

## Prerequisites

### All Platforms
- Rust toolchain: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Node.js 18+ and npm (already required)

### macOS
- Xcode Command Line Tools: `xcode-select --install`

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf
```

### Linux (Fedora/RHEL)
```bash
sudo dnf install -y \
  webkit2gtk4.0-devel \
  openssl-devel \
  curl \
  wget \
  libappindicator-gtk3 \
  librsvg2-devel
```

### Windows
- Microsoft Visual Studio C++ Build Tools
- WebView2 (usually pre-installed on Windows 10/11)

## Build Process

### Building the Tauri App

#### Development Build
```bash
# Build React SPA first
npm run gui:build

# Install Tauri CLI (one-time)
npm install -D @tauri-apps/cli

# Run in dev mode
npm run tauri dev
```

#### Production Build
```bash
# Build the Tauri app itself
npm run tauri:build

# Build installers with Tauri included
npm run build:win:tauri    # Windows
npm run build:mac:tauri    # macOS
npm run build:linux:tauri  # Linux
```

### Building Without Tauri

The existing build process works unchanged:

```bash
npm run build:win    # Windows (no Tauri)
npm run build:mac    # macOS (no Tauri)
npm run build:linux  # Linux (no Tauri)
```

## Integration with Existing Installers

### Windows (NSIS)

When Tauri is built, the installer:
1. Bundles the Tauri `.exe` into `$INSTDIR\app\`
2. Creates Start Menu shortcut to launch Tauri app by default
3. Desktop shortcut launches Tauri app
4. CLI remains available via `puppet-master` command
5. Falls back to web browser launch if Tauri app not found

### macOS (.app/.pkg/.dmg)

When Tauri is built:
1. The `.app` bundle structure contains both:
   - Tauri native app (Contents/MacOS/puppet-master)
   - Embedded Node runtime + CLI (Contents/Resources/puppet-master/)
2. Double-clicking `.app` launches Tauri
3. CLI accessible via symlink: `/usr/local/bin/puppet-master`
4. `puppet-master gui` command prefers Tauri if present

### Linux (.deb/.rpm)

When Tauri is built:
1. Tauri binary installed to `/opt/puppet-master/bin/puppet-master-gui`
2. Desktop entry (`.desktop` file) launches Tauri app
3. CLI installed to `/usr/bin/puppet-master`
4. Systemd service can use either web or Tauri backend

## Environment Variables

The Tauri app respects the following:

- `PUPPET_MASTER_URL`: Override the GUI server URL the Tauri window loads
- `PUPPET_MASTER_INSTALL_ROOT`: Override app installation directory (set by installers)
- All existing Puppet Master env vars (PLAYWRIGHT_BROWSERS_PATH, etc.)

## Tauri vs Web GUI Feature Comparison

| Feature | Web GUI | Tauri App |
|---------|---------|-----------|
| Launch speed | Depends on browser | Fast native launch |
| System tray integration | No | Yes (optional) |
| Native notifications | Limited | Full native support |
| Auto-updates | Manual | Tauri updater support |
| File system access | Limited | Full access |
| Multi-window | Browser tabs | Native windows |
| Offline support | Limited | Full offline |
| Memory usage | Higher (full browser) | Lower (WebView2) |
| CLI integration | Same | Same |

## Development Workflow

### Frontend Changes (React)
```bash
# Work in src/gui/react/ as usual
cd src/gui/react
npm run dev  # Vite dev server

# When ready to test in Tauri:
npm run build
cd ../..
npm run tauri dev
```

### Backend Changes (Node/TypeScript)
```bash
# CLI and server changes work normally
npm run dev    # tsc --watch
npm run gui    # Test web GUI

# Tauri loads the same backend
npm run tauri dev
```

### Tauri-Specific Changes
```bash
# Edit src-tauri/src/main.rs
# Edit src-tauri/tauri.conf.json

npm run tauri dev  # Hot reload Rust changes
```

## Installer Build Scripts

### Updated Build Flow

The `scripts/build-installer.ts` now supports:

```bash
# Build with Tauri (if Rust installed)
node scripts/build-installer.ts --platform darwin --with-tauri

# Build without Tauri (traditional)
node scripts/build-installer.ts --platform darwin

# Auto-detect Tauri availability
node scripts/build-installer.ts --platform darwin --auto-detect-tauri
```

### CI/CD Integration

GitHub Actions workflow example:

```yaml
- name: Install Rust (for Tauri)
  uses: actions-rs/toolchain@v1
  with:
    toolchain: stable
    
- name: Install Tauri dependencies (Linux)
  if: runner.os == 'Linux'
  run: |
    sudo apt update
    sudo apt install -y libwebkit2gtk-4.0-dev libgtk-3-dev \
      libayatana-appindicator3-dev librsvg2-dev

- name: Build installer with Tauri
  run: npm run build:${{ matrix.platform }}:tauri
```

## Migration Path

### Phase 1: Tauri Setup (Current)
- [x] Create Tauri configuration
- [x] Update build scripts to support optional Tauri builds
- [x] Document build process
- [ ] Test basic Tauri app launches

### Phase 2: Enhanced Integration
- [ ] Add system tray icon with quick actions
- [ ] Native notifications for task completion
- [ ] Native file picker dialogs
- [ ] Auto-updater integration

### Phase 3: Advanced Features
- [ ] Multiple workspace windows
- [ ] Native context menus
- [ ] Keyboard shortcuts (global hotkeys)
- [ ] Native dark mode detection

## Troubleshooting

### "Rust not found" during build
**Solution**: Install Rust or use non-Tauri build: `npm run build:mac` (without `:tauri`)

### "WebView2 not found" (Windows)
**Solution**: Download from https://developer.microsoft.com/microsoft-edge/webview2/

### "webkit2gtk not found" (Linux)
**Solution**: Install system dependencies (see Prerequisites above)

### Tauri app doesn't connect to backend
**Issue**: Backend server not starting
**Solution**: Check that Node runtime is bundled correctly; verify launcher scripts

### CLI not working after Tauri install
**Issue**: PATH not updated
**Solution**: Reinstall or manually add to PATH (see platform-specific docs)

## Technical Details

### Backend Communication

Tauri app communicates with the Node.js backend via:
1. **HTTP API**: Same REST API as web GUI (`http://localhost:3456`)
2. **WebSocket**: Real-time updates (`ws://localhost:3456`)
3. **Tauri Commands**: Optional Rust-side commands for file system access

The backend server (`src/gui/server.ts`) is unchanged and works identically for both web and Tauri clients.

### Launch Flow

**Tauri App Launch:**
```
User double-clicks icon
  → Tauri main.rs starts
  → Spawns Node.js backend (embedded runtime)
  → Backend starts Express server on localhost
  → Tauri WebView loads http://localhost:3456
  → React app renders in native window
```

**Web GUI Launch:**
```
User runs `puppet-master gui`
  → CLI (dist/cli/index.js) starts
  → Spawns backend server
  → Opens default web browser
  → Browser loads http://localhost:3456
  → React app renders in browser
```

### Security Considerations

- **CSP**: Content Security Policy allows localhost connections
- **CORS**: Backend allows Tauri origin (`tauri://localhost`)
- **File Access**: Tauri has full file system access (by design)
- **No External Requests**: All communication is local (localhost)

## Testing

### Manual Testing Checklist

- [ ] Tauri app launches without console window
- [ ] React app loads correctly in WebView
- [ ] All routes/pages work (dashboard, agents, settings)
- [ ] WebSocket connection establishes
- [ ] File operations work (config files, logs)
- [ ] CLI commands work from terminal
- [ ] App closes cleanly (no zombie processes)
- [ ] Desktop shortcuts work
- [ ] Uninstall removes all files

### Automated Testing

```bash
# Unit tests (unchanged)
npm test

# Integration tests with Tauri
npm run test:tauri

# E2E tests (Playwright works with both)
npm run test:e2e
```

## FAQ

**Q: Do I need to rebuild for Tauri every time I change React code?**  
A: No. Use `npm run tauri dev` for hot reload during development.

**Q: Can I use both web and Tauri versions simultaneously?**  
A: Yes. They use the same backend server port, so only one can run at a time, but you can switch between them.

**Q: Does Tauri increase the installer size?**  
A: Slightly. The Tauri binary adds ~10-15 MB, but the total remains reasonable (<200 MB with all dependencies).

**Q: What happens if someone doesn't have Rust to build?**  
A: The existing installers work perfectly without Tauri. It's purely optional.

**Q: Will the CLI work the same way?**  
A: Yes. The CLI is completely unchanged. Tauri only affects GUI launching.

**Q: Can I customize the Tauri window (frameless, transparent, etc.)?**  
A: Yes. Edit `src-tauri/tauri.conf.json` to customize window properties.

## References

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Tauri + Vite + React Guide](https://tauri.app/v1/guides/getting-started/setup/vite)
- [Tauri API Reference](https://tauri.app/v1/api/js/)
- [Rust Installation](https://www.rust-lang.org/tools/install)
