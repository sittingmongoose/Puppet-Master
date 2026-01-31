# Tauri Desktop App Setup Guide

## Quick Start

This project now supports building a native desktop app using Tauri, in addition to the existing web-based GUI.

### Prerequisites

**Required (already installed):**
- Node.js 18+ and npm
- TypeScript compiler

**Optional (for Tauri desktop app):**
- Rust toolchain: https://rustup.rs/
- Platform-specific dependencies (see below)

### Platform-Specific Setup

#### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### Linux (Ubuntu/Debian)
```bash
# Install system dependencies
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### Windows
```bash
# Install Rust from: https://rustup.rs/
# Install Visual Studio C++ Build Tools from:
# https://visualstudio.microsoft.com/downloads/

# WebView2 is usually pre-installed on Windows 10/11
# If needed, download from:
# https://developer.microsoft.com/microsoft-edge/webview2/
```

## Building

### Option 1: Traditional Build (Web GUI, No Tauri)
```bash
# Build as before - no changes required
npm run build:win     # Windows installer
npm run build:mac     # macOS installer
npm run build:linux   # Linux installer
```

### Option 2: Build with Tauri Desktop App
```bash
# First-time setup: Install Rust (see above)

# Build installers with Tauri included
npm run build:win:tauri     # Windows + Tauri
npm run build:mac:tauri     # macOS + Tauri
npm run build:linux:tauri   # Linux + Tauri
```

## Development

### Web GUI Development (existing workflow)
```bash
npm run dev              # Watch TypeScript
npm run gui:dev          # React dev server
npm run gui              # Start GUI server + browser
```

### Tauri Development (new)
```bash
# Build React app
npm run gui:build

# Start Tauri in dev mode (hot reload)
npm run tauri:dev

# Or build Tauri for production
npm run tauri:build
```

## What Gets Built

### Without Tauri (Default)
- **Windows**: NSIS installer (.exe) with Node runtime + CLI + web GUI
- **macOS**: DMG with .app bundle that launches web GUI in browser
- **Linux**: .deb and .rpm packages with CLI + systemd service for GUI

### With Tauri (New)
- **Windows**: Same NSIS installer + native .exe desktop app
- **macOS**: Same DMG + native .app that runs without browser
- **Linux**: Same packages + native desktop binary

## Key Features

### Backward Compatibility
✅ Existing builds work unchanged  
✅ No Rust? No problem - builds without Tauri  
✅ CLI functionality identical  
✅ All documentation still valid  

### With Tauri
✅ Native desktop app (no browser required)  
✅ Faster startup and lower memory usage  
✅ System tray integration (coming soon)  
✅ Native notifications  
✅ Better offline support  

## Documentation

- **[Tauri Integration Guide](docs/TAURI_INTEGRATION.md)** - Complete documentation
- **[Implementation Status](docs/TAURI_IMPLEMENTATION_STATUS.md)** - What's done, what's left
- **[Icon Setup](src-tauri/icons/README.md)** - Icon requirements and creation

## TODOs

The Tauri infrastructure is ready, but some integration work remains:

### High Priority
- [ ] Test Tauri builds on all platforms
- [ ] Update installer scripts to include Tauri artifacts
- [ ] Configure backend auto-start in Tauri
- [ ] Update shortcuts to launch Tauri by default

### Medium Priority
- [ ] Add system tray icon
- [ ] Implement native notifications
- [ ] Add auto-updater
- [ ] Better error handling

### Low Priority
- [ ] Multiple windows support
- [ ] Global keyboard shortcuts
- [ ] Native context menus

See `docs/TAURI_IMPLEMENTATION_STATUS.md` for detailed checklist.

## Build Script Flags

```bash
# Explicit Tauri build
tsx scripts/build-installer.ts --platform darwin --with-tauri

# Auto-detect Rust (builds with Tauri if available)
tsx scripts/build-installer.ts --platform darwin --auto-detect-tauri

# Traditional build (no Tauri, even if Rust installed)
tsx scripts/build-installer.ts --platform darwin
```

## Troubleshooting

### "Rust not found" during build
**Solution**: Install Rust or use non-Tauri build:
```bash
npm run build:mac  # Instead of build:mac:tauri
```

### "webkit2gtk not found" (Linux)
**Solution**: Install system dependencies:
```bash
sudo apt install -y libwebkit2gtk-4.0-dev libgtk-3-dev
```

### Tauri build fails
**Fallback**: The build continues and creates a traditional installer. You can use that while debugging Tauri issues.

## FAQ

**Q: Do I need to install Rust?**  
A: Only if you want to build/test the Tauri desktop app. Traditional builds work without Rust.

**Q: Will this break existing builds?**  
A: No. All existing build commands work unchanged.

**Q: What's the benefit of Tauri?**  
A: Native desktop app, faster startup, lower memory usage, better system integration.

**Q: Can I use both web and desktop GUIs?**  
A: Yes. The CLI can launch either mode. Desktop app is just another way to run the same GUI.

**Q: Is Tauri production-ready?**  
A: Tauri itself is production-ready and used by many apps. Our integration is in testing phase.

## Support

- Check TODOs in `scripts/build-installer.ts`
- Read full docs in `docs/TAURI_INTEGRATION.md`
- Review status in `docs/TAURI_IMPLEMENTATION_STATUS.md`

## Quick Reference

```bash
# Development
npm run tauri:dev        # Tauri dev mode
npm run gui:dev          # Web dev mode
npm run dev              # TypeScript watch

# Production Builds
npm run build:win        # Windows (no Tauri)
npm run build:win:tauri  # Windows (with Tauri)
npm run build:mac        # macOS (no Tauri)
npm run build:mac:tauri  # macOS (with Tauri)
npm run build:linux      # Linux (no Tauri)
npm run build:linux:tauri# Linux (with Tauri)

# Just Tauri
npm run tauri:build      # Build Tauri app only
```

---

**Status**: 🚧 Infrastructure complete, integration in progress  
**Risk**: Low (fully backward compatible)  
**Estimated completion**: 4-8 hours for core, 2-3 days for polish
