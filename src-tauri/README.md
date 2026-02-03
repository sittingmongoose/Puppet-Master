# Tauri v2 Desktop Wrapper

This directory contains the Tauri v2 desktop wrapper for the Puppet Master application.

## Overview

The Tauri wrapper provides a native desktop application shell that loads the existing GUI server (http://127.0.0.1:3847). It includes:

- **tauri-plugin-log**: Logging to LogDir, Stdout, and Webview
- **Configurable URL**: Set `PUPPET_MASTER_URL` environment variable to customize server location
- **Zero-copy architecture**: Minimal wrapper, leverages existing Node.js server

## Prerequisites

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf \
  libssl-dev \
  pkg-config
```

### macOS

```bash
# Xcode Command Line Tools required
xcode-select --install
```

### Windows

- Microsoft Visual C++ 2015-2022 Redistributable
- WebView2 (usually pre-installed on Windows 10/11)

## Development

### Running in Development Mode

1. **Start the GUI server first**:
   ```bash
   npm run gui
   ```
   The server will start on http://127.0.0.1:3847

2. **In another terminal, start Tauri**:
   ```bash
   npm run tauri:dev
   ```

The Tauri window will open and connect to your running GUI server. When using an external server URL, the app waits for the server to be ready (up to ~20s) before loading the page, so the first window may appear after a short delay if the server is still starting.

### Custom Server URL

To connect to a different server:

```bash
PUPPET_MASTER_URL=http://localhost:8080 npm run tauri:dev
```

## Building

### Development Build

```bash
npm run tauri:build
```

This will:
1. Build the React frontend (`npm run gui:build`)
2. Compile the Rust Tauri application
3. Create a distributable package in `src-tauri/target/release/bundle/`

### Production Build

For production, ensure the GUI server is built and ready:

```bash
npm run gui:build
npm run tauri:build
```

## Architecture

```
┌─────────────────────────────────────┐
│     Tauri Native Window (Rust)     │
│  - Window management                │
│  - System tray integration          │
│  - Native APIs                      │
│  - tauri-plugin-log                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    WebView (loads external URL)     │
│    http://127.0.0.1:3847            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Node.js Express Server            │
│   - REST API                        │
│   - WebSocket events                │
│   - React frontend serving          │
└─────────────────────────────────────┘
```

## Configuration

### tauri.conf.json

Key configuration options:

- **devUrl**: URL to connect to in development mode (default: http://127.0.0.1:3847)
- **beforeBuildCommand**: Builds the React frontend before creating desktop app
- **CSP**: Content Security Policy allows connection to local server and WebSocket

### main.rs

The Rust entry point:

- Reads `PUPPET_MASTER_URL` environment variable (defaults to http://127.0.0.1:3847)
- Initializes tauri-plugin-log with three targets:
  - **LogDir**: Writes to app's log directory (`~/.local/share/puppet-master/logs/puppet-master.log` on Linux)
  - **Stdout**: Console output for debugging
  - **Webview**: Logs visible in WebView console
- Navigates main window to the GUI server URL

## Logging

Logs are written to multiple destinations:

### LogDir Location

- **Linux**: `~/.local/share/puppet-master/logs/puppet-master.log`
- **macOS**: `~/Library/Application Support/puppet-master/logs/puppet-master.log`
- **Windows**: `C:\Users\<User>\AppData\Local\puppet-master\logs\puppet-master.log`

### Viewing Logs

In development:
```bash
# Console output (Stdout)
npm run tauri:dev

# WebView console (open DevTools with F12)
# Or in main.rs, add: window.open_devtools();
```

In production:
```bash
# View log file
tail -f ~/.local/share/puppet-master/logs/puppet-master.log  # Linux/macOS
```

## ESM/NodeNext Compatibility

The Tauri wrapper is fully compatible with the existing ESM setup:

- ✅ No changes required to existing TypeScript/JavaScript code
- ✅ No bundling conflicts
- ✅ Existing `"type": "module"` in package.json remains unchanged
- ✅ All npm scripts continue to work as before

## Scripts

Added to root `package.json`:

- **npm run tauri**: Access Tauri CLI directly
- **npm run tauri:dev**: Start Tauri in development mode
- **npm run tauri:build**: Build Tauri desktop application

## Troubleshooting

### Server Not Running

If you see a blank screen or connection error:
1. Ensure GUI server is running: `npm run gui`
2. Check server is on port 3847: `curl http://127.0.0.1:3847`
3. Check Tauri logs for connection errors

### Build Errors

If `cargo build` fails:
- Ensure all system dependencies are installed (see Prerequisites)
- Run `cargo clean` and retry
- Check logs in `src-tauri/target/debug/build/`

### WebView Not Loading

- Check CSP settings in `tauri.conf.json`
- Verify server URL is accessible from your machine
- Check firewall/security settings

## Directory Structure

```
src-tauri/
├── Cargo.toml          # Rust dependencies (Tauri v2)
├── build.rs            # Build script
├── tauri.conf.json     # Tauri v2 configuration
├── icons/              # Application icons
└── src/
    └── main.rs         # Rust entry point
```

## References

- [Tauri v2 Documentation](https://beta.tauri.app/)
- [tauri-plugin-log](https://github.com/tauri-apps/tauri-plugin-log)
- [Tauri Architecture](https://tauri.app/v1/guides/architecture/)
