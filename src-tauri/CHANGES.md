# Tauri v2 Desktop Wrapper Implementation

## Summary

Implemented minimal Tauri v2 desktop wrapper for Puppet Master GUI with tauri-plugin-log support.

## Changes

### New Files

**Core Implementation:**
- `src-tauri/src/main.rs` - Rust entry point with tauri-plugin-log (LogDir/Stdout/Webview)
- `src-tauri/Cargo.toml` - Tauri v2 + tauri-plugin-log v2 dependencies
- `src-tauri/tauri.conf.json` - Tauri v2 configuration (updated from v1)
- `src-tauri/build.rs` - Standard Tauri build script

**Documentation:**
- `src-tauri/README.md` - Complete user guide with setup instructions
- `src-tauri/DEVELOPMENT.md` - Developer guide with architecture decisions
- `src-tauri/IMPLEMENTATION.md` - Implementation summary and checklist
- `src-tauri/QUICKREF.md` - Quick reference card

**Configuration:**
- `src-tauri/.env.example` - Environment variable template
- `src-tauri/run-desktop.sh` - Helper script to auto-start server + Tauri

### Modified Files

**package.json:**
- Added `@tauri-apps/cli` v2.1.0 to devDependencies (installed as v2.9.6)
- Added scripts:
  - `tauri` - Access Tauri CLI
  - `tauri:dev` - Start Tauri in development mode
  - `tauri:build` - Build desktop application

**README.md:**
- Added "Desktop Application (Tauri v2)" section with usage instructions
- Replaced old desktop shell note with actual implementation details

### Preserved Files (No Changes)

- All TypeScript/JavaScript application code
- React frontend (`src/gui/react/`)
- Node.js backend (`src/gui/server.ts`, etc.)
- Build system (tsc, vite, etc.)
- tsconfig.json
- All existing npm scripts

## Key Features

1. **tauri-plugin-log v2** with three targets:
   - LogDir: Platform-specific log directory
   - Stdout: Console output
   - Webview: Browser console

2. **Configurable Server URL:**
   - Default: `http://127.0.0.1:3847`
   - Override with `PUPPET_MASTER_URL` environment variable

3. **Zero-Cost Implementation:**
   - 41 lines of Rust code
   - No changes to existing TypeScript/JavaScript
   - No bundling conflicts
   - Full ESM/NodeNext compatibility

4. **Development-Friendly:**
   - Hot reload preserved
   - Helper script for auto-start
   - Comprehensive documentation

## Architecture

Tauri window loads external URL (http://127.0.0.1:3847) instead of bundling assets:
- Simple deployment (server + thin desktop shell)
- Zero refactoring required
- Works with remote servers
- Backend logic stays in Node.js

## Usage

### Development
```bash
npm run gui          # Terminal 1: Start GUI server
npm run tauri:dev    # Terminal 2: Launch Tauri
```

### Production Build
```bash
npm run gui:build
npm run tauri:build
```

## System Requirements

### Linux (Debian/Ubuntu)
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev patchelf \
  libssl-dev pkg-config
```

### macOS
```bash
xcode-select --install
```

### Windows
- Microsoft Visual C++ 2015-2022 Redistributable
- WebView2 (pre-installed on Windows 10/11)

## Testing Checklist

- [x] Cargo.toml uses Tauri v2 and tauri-plugin-log v2
- [x] main.rs implements LogDir, Stdout, Webview targets
- [x] main.rs reads PUPPET_MASTER_URL environment variable
- [x] tauri.conf.json uses Tauri v2 schema
- [x] CSP allows localhost and WebSocket connections
- [x] package.json scripts maintain backward compatibility
- [x] Documentation is comprehensive
- [x] Helper script included
- [x] ESM/NodeNext compatibility maintained
- [x] Rust code formatted with cargo fmt
- [ ] Actual build test (requires system dependencies)
- [ ] Runtime test with GUI server

## Documentation

See `src-tauri/README.md` for complete user guide and setup instructions.

## Notes

- Upgraded existing Tauri v1 setup to v2
- Package already had @tauri-apps/cli installed, updated to v2.9.6
- Preserved existing icons and .gitignore
- Zero breaking changes to existing functionality
