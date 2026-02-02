# Tauri Desktop - Testing Guide

## Pre-Flight Checklist

Before testing, ensure:
- [ ] Rust toolchain installed (`cargo --version`)
- [ ] System dependencies installed (see README.md)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] NPM dependencies installed (`npm install`)

## Testing Scenarios

### 1. Basic Functionality Test

**Objective:** Verify desktop app launches and connects to server

```bash
# Terminal 1: Start GUI server
cd /path/to/puppet-master
npm run gui

# Wait for: "GUI Server running at http://127.0.0.1:3847"

# Terminal 2: Launch desktop app
npm run tauri:dev
```

**Expected Results:**
- ✅ Desktop window opens (1280x800)
- ✅ Window title: "Puppet Master"
- ✅ GUI loads successfully
- ✅ Can navigate between tabs
- ✅ WebSocket events work

**Failure Scenarios:**
- ❌ Blank window → Check server is running
- ❌ Connection refused → Check port 3847 not blocked
- ❌ CSP violation → Check tauri.conf.json CSP settings

### 2. Logging Test

**Objective:** Verify all three log targets work

```bash
# Start desktop app
npm run tauri:dev

# Check Stdout (Terminal 2)
# Should see: [INFO] Loading GUI server from: http://127.0.0.1:3847

# Check LogDir
tail -f ~/.local/share/puppet-master/logs/puppet-master.log

# Check Webview (in desktop app)
# Press F12 to open DevTools
# Should see logs in Console tab
```

**Expected Results:**
- ✅ Stdout: Log messages visible in terminal
- ✅ LogDir: File created and contains logs
- ✅ Webview: Console shows logs (if DevTools enabled)

### 3. Environment Variable Test

**Objective:** Verify PUPPET_MASTER_URL works

```bash
# Start server on default port
npm run gui

# Terminal 2: Test custom URL (same as default)
PUPPET_MASTER_URL=http://localhost:3847 npm run tauri:dev

# Should work (localhost vs 127.0.0.1)
```

**Expected Results:**
- ✅ Desktop app connects to localhost:3847
- ✅ No CSP violations
- ✅ GUI loads normally

**Advanced Test:**
```bash
# Start server on custom port
GUI_PORT=4000 npm run gui

# Connect desktop app to custom port
PUPPET_MASTER_URL=http://127.0.0.1:4000 npm run tauri:dev
```

### 4. Build Test

**Objective:** Verify production build works

```bash
# Build React frontend
npm run gui:build

# Build Tauri desktop app
npm run tauri:build
```

**Expected Results:**
- ✅ Build completes without errors
- ✅ Bundle created in `src-tauri/target/release/bundle/`
- ✅ Binary size reasonable (<50 MB)

**Platform-Specific Outputs:**
- Linux: `.deb` and/or `.AppImage`
- macOS: `.dmg` and/or `.app`
- Windows: `.msi` and/or `.exe`

### 5. Helper Script Test

**Objective:** Verify run-desktop.sh works

```bash
# Stop any running GUI server
pkill -f "src/gui/start-gui"

# Run helper script
./src-tauri/run-desktop.sh
```

**Expected Results:**
- ✅ Script detects no server running
- ✅ Script starts GUI server automatically
- ✅ Script waits for server to be ready
- ✅ Desktop app launches
- ✅ Everything works normally

### 6. Remote Server Test

**Objective:** Verify can connect to remote server

**Setup:**
```bash
# On remote machine (or same machine for testing)
# Edit src/gui/start-gui.ts to allow external connections:
# const host = process.env.GUI_HOST || '0.0.0.0';

npm run gui
```

**Test:**
```bash
# On local machine
PUPPET_MASTER_URL=http://192.168.1.100:3847 npm run tauri:dev
```

**Expected Results:**
- ✅ Desktop app connects to remote server
- ✅ GUI loads (may be slower due to network)
- ✅ WebSocket events work
- ⚠️  Check firewall allows port 3847

### 7. CSP Test

**Objective:** Verify Content Security Policy allows necessary resources

```bash
npm run tauri:dev

# In desktop app:
# Press F12 → Console tab
# Look for CSP violation errors
```

**Expected Results:**
- ✅ No CSP violation errors
- ✅ Scripts load successfully
- ✅ Styles load successfully
- ✅ WebSocket connects successfully

**If CSP violations occur:**
1. Check `tauri.conf.json` → `app.security.csp`
2. Add missing domains/protocols
3. Rebuild: `npm run tauri:dev`

### 8. Window Management Test

**Objective:** Verify window behavior

```bash
npm run tauri:dev
```

**Tests:**
- [ ] Window can be resized
- [ ] Window can be minimized
- [ ] Window can be maximized
- [ ] Window can be closed (app exits)
- [ ] Window remembers size (after restart)
- [ ] Window centers on screen initially

**Expected Results:**
- ✅ All window operations work
- ✅ No crashes or freezes
- ✅ UI remains responsive

### 9. Hot Reload Test (Development)

**Objective:** Verify hot reload still works

```bash
# Terminal 1: Start GUI server
npm run gui

# Terminal 2: Start desktop app
npm run tauri:dev

# Terminal 3: Make a change to React code
cd src/gui/react/src
# Edit any component file

# Watch Terminal 1 for Vite rebuild
# Check desktop app updates automatically
```

**Expected Results:**
- ✅ Vite detects changes
- ✅ Vite rebuilds
- ✅ Desktop app hot reloads
- ✅ No manual refresh needed

### 10. Performance Test

**Objective:** Verify app performs well

```bash
npm run tauri:dev

# In desktop app:
# Navigate between tabs multiple times
# Check CPU usage (htop, Activity Monitor, Task Manager)
# Check memory usage
```

**Expected Baselines:**
- ✅ CPU: <10% when idle
- ✅ Memory: <200 MB
- ✅ Tab switches: <100ms
- ✅ No memory leaks over time

## Regression Tests

### After Code Changes

Run these tests after modifying:
- [ ] src-tauri/src/main.rs → Full functionality test
- [ ] src-tauri/Cargo.toml → Build test
- [ ] src-tauri/tauri.conf.json → CSP + build test
- [ ] package.json → Script test

### Before Release

Full test suite:
1. Basic functionality test
2. Logging test (all three targets)
3. Build test (all platforms)
4. Remote server test
5. Performance test

## Debugging Failed Tests

### Desktop App Won't Launch

1. Check Rust build:
   ```bash
   cd src-tauri
   cargo build
   # Look for compilation errors
   ```

2. Check system dependencies:
   ```bash
   # Linux
   pkg-config --modversion gtk+-3.0
   pkg-config --modversion webkit2gtk-4.1
   ```

3. Check Tauri CLI:
   ```bash
   npx tauri --version
   # Should be 2.x
   ```

### Server Connection Fails

1. Verify server is running:
   ```bash
   curl -v http://127.0.0.1:3847
   ```

2. Check firewall:
   ```bash
   # Linux
   sudo ufw status
   sudo ufw allow 3847/tcp
   ```

3. Check server logs:
   ```bash
   cat .puppet-master/logs/runtime.log
   ```

### Logs Not Appearing

1. Check log directory exists:
   ```bash
   ls -la ~/.local/share/puppet-master/logs/
   ```

2. Check file permissions:
   ```bash
   ls -la ~/.local/share/puppet-master/logs/puppet-master.log
   ```

3. Check log level in main.rs:
   ```rust
   .level(log::LevelFilter::Info)  // Should be Info or Debug
   ```

### Build Fails

1. Clean and rebuild:
   ```bash
   cd src-tauri
   cargo clean
   cargo build
   ```

2. Update dependencies:
   ```bash
   cargo update
   ```

3. Check Rust version:
   ```bash
   rustc --version
   # Should be 1.70+ for Tauri v2
   ```

## Test Results Template

```markdown
# Tauri Desktop Test Results

Date: YYYY-MM-DD
Platform: Linux/macOS/Windows
Rust: 1.XX.X
Node: 20.XX.X
Tauri CLI: 2.X.X

## Test Results

1. Basic Functionality: ✅/❌
2. Logging (Stdout): ✅/❌
3. Logging (LogDir): ✅/❌
4. Logging (Webview): ✅/❌
5. Environment Variables: ✅/❌
6. Production Build: ✅/❌
7. Helper Script: ✅/❌
8. Remote Server: ✅/❌
9. CSP: ✅/❌
10. Window Management: ✅/❌
11. Hot Reload: ✅/❌
12. Performance: ✅/❌

## Notes

[Any issues or observations]

## System Info

```bash
uname -a
cargo --version
node --version
npm --version
npx tauri --version
```
```

## Continuous Testing

### Pre-Commit

```bash
# Format Rust code
cd src-tauri
cargo fmt --check

# Check for errors (requires system deps)
cargo check
```

### Pre-Push

```bash
# Run full test suite
npm test
npm run build
cd src-tauri && cargo build
```

### CI/CD Integration

Consider adding to `.github/workflows/test.yml`:

```yaml
- name: Install Tauri dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev \
      libayatana-appindicator3-dev librsvg2-dev patchelf \
      libssl-dev pkg-config

- name: Build Tauri
  run: |
    cd src-tauri
    cargo build --release
```

## Test Automation

Future improvements:
- [ ] Add integration tests with Playwright
- [ ] Add Rust unit tests in main.rs
- [ ] Add CI/CD pipeline for builds
- [ ] Add automated screenshot tests
- [ ] Add performance benchmarks
