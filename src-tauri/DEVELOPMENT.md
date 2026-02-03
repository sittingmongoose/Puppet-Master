# Tauri v2 Desktop Wrapper - Development Guide

## Quick Start (No System Dependencies)

If you don't have the GTK/WebView dependencies installed, you can still work on the Rust code:

```bash
# Check for syntax errors only
cd src-tauri
cargo check --no-default-features
```

To actually build and run, you'll need the system dependencies listed in the main README.

## Architecture Decision Record

### Why External URL Loading?

The Tauri wrapper uses `.navigate()` to load an external URL (http://127.0.0.1:3847) instead of bundling assets. This design:

**Pros:**
- ✅ Zero changes to existing Node.js/React codebase
- ✅ Hot reload works seamlessly in development
- ✅ Can connect to remote servers if needed
- ✅ Simple deployment model (server + thin desktop shell)
- ✅ Backend logic stays in Node.js (file I/O, database, etc.)

**Cons:**
- ❌ Requires server to be running separately
- ❌ Two-process architecture (Tauri + Node.js)
- ❌ Can't use Tauri's bundled asset serving

When loading from an external server URL, the app waits for the server to be ready (TCP connect to host:port, up to ~20s) before navigating, so the first window may appear after a short delay if the server is still starting.

**Alternative Considered:** Full Tauri-native with embedded Node.js runtime
- Would require significant refactoring
- Complex build process
- Loses hot reload benefits
- Not worth it for a development tool

### Plugin Choice: tauri-plugin-log

Using the official logging plugin provides:
- Consistent log format across Stdout, LogDir, and Webview
- Automatic log rotation
- Platform-specific log directories
- Integration with Rust's `log` crate

Configuration in `main.rs`:
```rust
tauri_plugin_log::Builder::new()
    .targets([
        Target::LogDir { file_name: Some("puppet-master.log".to_string()) },
        Target::Stdout,
        Target::Webview,
    ])
    .level(log::LevelFilter::Info)
    .build()
```

## Development Workflow

### 1. Regular Development (Web Only)

Most development doesn't require Tauri:

```bash
npm run build        # Compile TypeScript
npm run gui          # Start web server
# Open http://127.0.0.1:3847 in browser
```

### 2. Testing Desktop Integration

When you need to test desktop-specific features:

```bash
# Terminal 1
npm run gui

# Terminal 2  
npm run tauri:dev
```

### 3. Rust Code Changes

After modifying `src-tauri/src/main.rs`:

```bash
cd src-tauri
cargo fmt              # Format code
cargo clippy           # Lint (requires system deps)
cargo check            # Fast syntax check
```

No need to restart - Tauri CLI watches Rust files and rebuilds automatically.

## Environment Variables

### PUPPET_MASTER_URL

Override the default server URL:

```bash
PUPPET_MASTER_URL=http://192.168.1.100:3847 npm run tauri:dev
```

In the code (`main.rs`):
```rust
let server_url = env::var("PUPPET_MASTER_URL")
    .unwrap_or_else(|_| "http://127.0.0.1:3847".to_string());
```

### Production Builds

For production, you might want to bundle the server URL:

1. Edit `tauri.conf.json` → `build.devUrl`
2. Or use environment variable in systemd/launchd service files

## CSP (Content Security Policy)

The `tauri.conf.json` includes a relaxed CSP for local development:

```json
"security": {
  "csp": "default-src 'self' http://127.0.0.1:3847 ws://127.0.0.1:3847 http://localhost:3847 ws://localhost:3847; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ..."
}
```

**Security Note:** This allows:
- `unsafe-inline` and `unsafe-eval` for React dev mode
- WebSocket connections for live updates
- Both 127.0.0.1 and localhost for maximum compatibility

For production, consider tightening:
- Remove `unsafe-eval` if not needed
- Lock down to specific domains
- Use nonces for inline scripts

## Testing

### Manual Testing Checklist

- [ ] Window opens and loads GUI
- [ ] Can navigate between tabs
- [ ] WebSocket events update in real-time
- [ ] Login/authentication works
- [ ] Can start/stop orchestration
- [ ] Window can be resized, minimized, maximized
- [ ] Logs appear in console (Stdout)
- [ ] Logs written to LogDir file

### Log Verification

Check logs are being written:

```bash
# Find log location
npm run tauri:dev 2>&1 | grep "Loading GUI server"

# On Linux
tail -f ~/.local/share/puppet-master/logs/puppet-master.log

# On macOS  
tail -f ~/Library/Application\ Support/puppet-master/logs/puppet-master.log

# On Windows
type %LOCALAPPDATA%\puppet-master\logs\puppet-master.log
```

## Debugging

### Rust Panics

If Tauri crashes with a panic:

```bash
RUST_BACKTRACE=1 npm run tauri:dev
```

### WebView Console

To enable DevTools in the webview, add to `main.rs`:

```rust
.setup(move |app| {
    let window = app.get_webview_window("main").unwrap();
    
    #[cfg(debug_assertions)]
    window.open_devtools();
    
    // ... rest of setup
})
```

### Network Debugging

Check if server is reachable:

```bash
curl -v http://127.0.0.1:3847
```

If WebSocket fails, check:
- Server is running (`npm run gui`)
- No firewall blocking port 3847
- CSP allows WebSocket connection

## Building for Production

### Full Build Process

```bash
# 1. Build TypeScript
npm run build

# 2. Build React frontend
npm run gui:build

# 3. Build Tauri desktop app
npm run tauri:build
```

Output location:
- **Linux**: `src-tauri/target/release/bundle/deb/puppet-master_*.deb`
- **macOS**: `src-tauri/target/release/bundle/dmg/Puppet Master_*.dmg`
- **Windows**: `src-tauri/target/release/bundle/msi/Puppet Master_*.msi`

### Optimization Tips

1. **Reduce binary size:**
   - Already enabled: `lto = true`, `opt-level = "z"`, `strip = true`
   - For even smaller: Consider `upx` compression

2. **Faster builds:**
   - Use `cargo build --release` without Tauri CLI overhead
   - Enable `incremental = true` in Cargo.toml for dev builds

3. **CI/CD:**
   - Cache `~/.cargo` and `src-tauri/target`
   - Split build into stages: deps → rust → bundle

## Troubleshooting

### "Cannot find module" errors

Make sure you're in the root directory:
```bash
cd "/home/sittingmongoose/Cursor/RWM Puppet Master"
npm run tauri:dev
```

### Cargo build fails with GTK errors

Install system dependencies:
```bash
# Debian/Ubuntu
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev patchelf libssl-dev pkg-config

# Fedora
sudo dnf install webkit2gtk4.1-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel patchelf openssl-devel

# Arch
sudo pacman -S webkit2gtk-4.1 gtk3 libappindicator-gtk3 librsvg patchelf openssl pkg-config
```

### "Address already in use" on port 3847

Kill existing process:
```bash
lsof -ti:3847 | xargs kill -9
```

Or change port:
```bash
GUI_PORT=4000 npm run gui
PUPPET_MASTER_URL=http://127.0.0.1:4000 npm run tauri:dev
```

## Contributing

When contributing Tauri-related changes:

1. **Keep it minimal** - Don't add features unless necessary
2. **Test on all platforms** - Windows, macOS, Linux
3. **Document environment variables** - Update README
4. **Preserve ESM compatibility** - No CommonJS leakage
5. **Follow Rust conventions** - `cargo fmt`, `cargo clippy`

### Code Style

Rust:
```bash
cargo fmt              # Format with rustfmt
cargo clippy -- -D warnings  # Lint with clippy
```

The project uses:
- Rust 2021 edition
- Standard rustfmt configuration
- Clippy pedantic warnings (eventually)

## Resources

- [Tauri v2 Docs](https://beta.tauri.app/)
- [tauri-plugin-log](https://github.com/tauri-apps/tauri-plugin-log)
- [Tauri Discord](https://discord.com/invite/tauri)
- [Rust Book](https://doc.rust-lang.org/book/)
