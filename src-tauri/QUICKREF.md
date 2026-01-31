# Tauri Desktop Quick Reference

## 🚀 Quick Start

```bash
# Terminal 1: Start GUI server
npm run gui

# Terminal 2: Launch desktop app
npm run tauri:dev
```

Or all-in-one:
```bash
./src-tauri/run-desktop.sh
```

## 📦 Build

```bash
npm run gui:build    # Build React frontend
npm run tauri:build  # Build desktop app
```

Output: `src-tauri/target/release/bundle/`

## 🔧 Configuration

### Server URL

```bash
# Default
http://127.0.0.1:3847

# Custom
PUPPET_MASTER_URL=http://192.168.1.100:3847 npm run tauri:dev
```

### Log Locations

- **Linux**: `~/.local/share/puppet-master/logs/puppet-master.log`
- **macOS**: `~/Library/Application Support/puppet-master/logs/puppet-master.log`
- **Windows**: `%LOCALAPPDATA%\puppet-master\logs\puppet-master.log`

## 🛠️ Development

```bash
cd src-tauri
cargo fmt            # Format Rust code
cargo check          # Syntax check (requires system deps)
cargo build          # Full build
```

## 📖 Documentation

- [README.md](README.md) - User guide
- [DEVELOPMENT.md](DEVELOPMENT.md) - Developer guide
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Implementation summary

## ⚙️ System Dependencies

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
- WebView2 (pre-installed on Win10/11)

## 🐛 Troubleshooting

### Server not running
```bash
curl http://127.0.0.1:3847
npm run gui  # Start it
```

### Port conflict
```bash
GUI_PORT=4000 npm run gui
PUPPET_MASTER_URL=http://127.0.0.1:4000 npm run tauri:dev
```

### Blank window
- Check server is running
- Check CSP in tauri.conf.json
- Check logs: `tail -f ~/.local/share/puppet-master/logs/puppet-master.log`

## 📝 Scripts (package.json)

| Script | Description |
|--------|-------------|
| `npm run tauri` | Access Tauri CLI |
| `npm run tauri:dev` | Start in dev mode |
| `npm run tauri:build` | Build desktop app |
| `npm run gui` | Start GUI server |
| `npm run gui:build` | Build React frontend |

## 🏗️ Architecture

```
Tauri Window (Rust)
      ↓ navigate to URL
WebView loads http://127.0.0.1:3847
      ↓ serves
Node.js Express Server → React Frontend
```

## 📊 Features

- ✅ Native window management
- ✅ System tray integration ready
- ✅ Multi-target logging (LogDir/Stdout/Webview)
- ✅ Configurable server URL
- ✅ Zero changes to existing codebase
- ✅ ESM/NodeNext compatible
- ✅ Hot reload in development

## 🔐 Security (CSP)

Allows:
- localhost and 127.0.0.1
- WebSocket connections (ws://)
- Inline scripts (React dev mode)

See `tauri.conf.json` → `app.security.csp`

## 💡 Tips

1. **Always start GUI server first** (`npm run gui`)
2. **Use helper script** for automatic server start
3. **Check logs** when debugging connection issues
4. **Format Rust code** before committing (`cargo fmt`)
5. **Use DevTools** (F12) for frontend debugging

## 🌐 Remote Server

Connect to remote Puppet Master:
```bash
PUPPET_MASTER_URL=http://remote-host:3847 npm run tauri:dev
```

Make sure remote server allows external connections!

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `src/main.rs` | Rust entry point (41 lines) |
| `Cargo.toml` | Rust dependencies |
| `tauri.conf.json` | Tauri configuration |
| `build.rs` | Build script |

## 📞 Support

- Tauri Discord: https://discord.com/invite/tauri
- Documentation: https://beta.tauri.app/
- Plugin Docs: https://github.com/tauri-apps/tauri-plugin-log
