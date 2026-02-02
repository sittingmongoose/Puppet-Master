# Tauri Integration - Implementation Checklist

This checklist guides you through completing the Tauri desktop app integration.
All infrastructure is in place - you just need to connect the pieces.

---

## Prerequisites ✓

Before starting, ensure you have:

- [ ] **Rust installed**
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  source $HOME/.cargo/env
  cargo --version  # Should output version number
  ```

- [ ] **Platform dependencies installed**
  - macOS: `xcode-select --install`
  - Linux: `sudo apt install -y libwebkit2gtk-4.0-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev`
  - Windows: Visual Studio C++ Build Tools + WebView2

- [ ] **Repository checked out**
  ```bash
  cd puppet-master
  npm install  # Install dependencies
  npm run build  # Verify TypeScript compiles
  ```

- [ ] **Documentation reviewed**
  - [ ] Read: `docs/TAURI_INTEGRATION.md`
  - [ ] Read: `TAURI_SETUP.md`
  - [ ] Scan: `TAURI_EXECUTIVE_SUMMARY.md`

---

## Phase 1: Verify Infrastructure (15 min)

- [ ] **Check Tauri files exist**
  ```bash
  ls -la src-tauri/
  ls -la src-tauri/src/main.rs
  ls -la src-tauri/icons/
  ```

- [ ] **Verify icons are present**
  ```bash
  ls -la src-tauri/icons/*.png
  ls -la src-tauri/icons/*.icns
  ls -la src-tauri/icons/*.ico
  ```

- [ ] **Check build scripts**
  ```bash
  grep -n "with-tauri" scripts/build-installer.ts
  grep -n "TODO: TAURI" scripts/build-installer.ts
  ```

- [ ] **Test React build**
  ```bash
  npm run gui:build
  # Should create src/gui/react/dist/
  ls -la src/gui/react/dist/
  ```

---

## Phase 2: Test Tauri Dev Mode (30 min)

- [ ] **Build React app**
  ```bash
  npm run gui:build
  ```

- [ ] **Start Tauri dev mode**
  ```bash
  npm run tauri:dev
  ```
  
  **Expected result**: 
  - Rust compiles (first time: 2-5 min)
  - Tauri window opens
  - Shows error about backend not running (expected)

- [ ] **Fix: Start backend manually in another terminal**
  ```bash
  # Terminal 1:
  npm run gui  # Starts backend server
  
  # Terminal 2:
  npm run tauri:dev  # Should now connect
  ```

- [ ] **Verify basic functionality**
  - [ ] Window opens without errors
  - [ ] Can navigate between pages
  - [ ] Console shows no critical errors
  - [ ] Window can be resized/closed

- [ ] **Take notes** on any errors/issues for next phase

---

## Phase 3: Backend Auto-Launch (2-3 hours)

### 3.1 Update Rust Main File

- [ ] **Open** `src-tauri/src/main.rs`

- [ ] **Locate TODO** (around line 36-61)

- [ ] **Implement backend detection**
  ```rust
  // Add to top of file:
  use std::env;
  use std::fs;
  use std::path::PathBuf;
  
  fn get_backend_paths() -> (PathBuf, PathBuf) {
      // Detect if running in development or production
      let is_dev = env::var("TAURI_DEV").is_ok();
      
      if is_dev {
          // Development: use local node and app
          let node = PathBuf::from("node");  // From PATH
          let app = PathBuf::from("dist/cli/index.js");
          (node, app)
      } else {
          // Production: use embedded runtime
          // TODO: Adjust these paths based on your installer structure
          let app_dir = env::current_exe()
              .unwrap()
              .parent()
              .unwrap()
              .to_path_buf();
          
          #[cfg(target_os = "macos")]
          {
              // macOS: node in Contents/Resources/puppet-master/node/bin/
              let resources = app_dir.parent().unwrap().join("Resources");
              let pm = resources.join("puppet-master");
              let node = pm.join("node/bin/node");
              let app = pm.join("app/dist/cli/index.js");
              (node, app)
          }
          
          #[cfg(target_os = "windows")]
          {
              // Windows: node in installation dir
              let node = app_dir.join("node/node.exe");
              let app = app_dir.join("app/dist/cli/index.js");
              (node, app)
          }
          
          #[cfg(target_os = "linux")]
          {
              // Linux: installed to /opt/puppet-master
              let pm = PathBuf::from("/opt/puppet-master");
              let node = pm.join("node/bin/node");
              let app = pm.join("app/dist/cli/index.js");
              (node, app)
          }
      }
  }
  ```

- [ ] **Implement start_backend_server**
  ```rust
  fn start_backend_server() -> Option<Child> {
      let (node_path, app_path) = get_backend_paths();
      
      eprintln!("[Tauri] Starting backend: {:?} {:?}", node_path, app_path);
      
      // Check if node exists
      if !node_path.exists() {
          eprintln!("[Tauri] ERROR: Node not found at {:?}", node_path);
          return None;
      }
      
      if !app_path.exists() {
          eprintln!("[Tauri] ERROR: App entry not found at {:?}", app_path);
          return None;
      }
      
      // Start the backend with "gui" command
      match Command::new(&node_path)
          .arg(&app_path)
          .arg("gui")
          .arg("--no-browser")  // Don't open browser
          .env("PUPPET_MASTER_APP_ROOT", app_path.parent().unwrap())
          .spawn()
      {
          Ok(child) => {
              eprintln!("[Tauri] Backend started with PID: {}", child.id());
              Some(child)
          }
          Err(e) => {
              eprintln!("[Tauri] Failed to start backend: {}", e);
              None
          }
      }
  }
  ```

- [ ] **Update main() to use new function**
  ```rust
  fn main() {
      let backend_process = start_backend_server();
      
      // Give backend time to start
      thread::sleep(Duration::from_secs(3));
      
      // Rest of code...
  }
  ```

- [ ] **Test**
  ```bash
  npm run gui:build
  npm run tauri:dev
  # Should now start backend automatically
  ```

### 3.2 Verify Backend Launch

- [ ] Window opens
- [ ] Backend server starts (check logs)
- [ ] React app connects to backend
- [ ] No manual backend start needed
- [ ] Pages load correctly
- [ ] WebSocket connects

---

## Phase 4: Update Build Scripts (1-2 hours)

### 4.1 Implement Tauri Build Functions

- [ ] **Open** `scripts/build-installer.ts`

- [ ] **Locate** `buildTauriApp()` function (line ~74)

- [ ] **Verify** it runs `npx tauri build`

- [ ] **Test Tauri build**
  ```bash
  npm run gui:build
  npm run tauri:build
  # Check: src-tauri/target/release/ for artifacts
  ```

### 4.2 Implement Staging Function

- [ ] **Locate** `stageTauriApp()` function (line ~97)

- [ ] **Verify paths** for each platform:
  - Windows: `src-tauri/target/release/puppet-master.exe`
  - macOS: `src-tauri/target/release/bundle/macos/Puppet Master.app`
  - Linux: `src-tauri/target/release/puppet-master`

- [ ] **Test staging**
  ```bash
  tsx scripts/build-installer.ts --platform YOUR_PLATFORM --with-tauri
  # Check: installer-work/YOUR_PLATFORM/payload/
  ```

---

## Phase 5: Update Installers (2-3 hours)

### 5.1 Windows (NSIS)

- [ ] **Open** `installer/win/puppet-master.nsi`

- [ ] **Add** Tauri exe to installation section (after line 63):
  ```nsis
  ; Copy Tauri desktop app if present
  SetOutPath "$INSTDIR\app"
  File /nonfatal "${STAGE_DIR}\\puppet-master\\app\\puppet-master-gui.exe"
  ```

- [ ] **Update** shortcuts to launch Tauri by default:
  ```nsis
  ; Update Start Menu shortcut (around line 81)
  CreateShortcut "$SMPROGRAMS\Puppet Master\Puppet Master.lnk" \
    "$INSTDIR\app\puppet-master-gui.exe" \
    "" "$INSTDIR\puppet-master.ico" 0
  ```

- [ ] **Add fallback** if Tauri not present (check file exists first)

- [ ] **Test**
  ```bash
  npm run build:win:tauri
  # Install resulting .exe and verify
  ```

### 5.2 macOS (PKG/DMG)

- [ ] **Open** `scripts/build-installer.ts`

- [ ] **Locate** `buildMacAppBundle()` function (line ~336)

- [ ] **Modify** to merge Tauri bundle if present:
  - Copy Tauri .app as base
  - Add embedded Node runtime to Resources/
  - Ensure launcher script works

- [ ] **OR** keep separate and update postinstall script

- [ ] **Test**
  ```bash
  npm run build:mac:tauri
  # Install resulting .dmg and verify
  ```

### 5.3 Linux (DEB/RPM)

- [ ] **Open** `installer/linux/nfpm.yaml`

- [ ] **Add** Tauri binary to contents (if present):
  ```yaml
  - src: ${PM_NFPM_ROOT}/opt/puppet-master/bin/puppet-master-gui
    dst: /opt/puppet-master/bin/puppet-master-gui
    expand: true
    file_info:
      mode: 0755
  ```

- [ ] **Update** .desktop file to launch Tauri:
  ```bash
  Exec=/opt/puppet-master/bin/puppet-master-gui
  ```

- [ ] **Test**
  ```bash
  npm run build:linux:tauri
  # Install resulting .deb and verify
  ```

---

## Phase 6: Testing (2-3 hours)

### 6.1 Development Testing

- [ ] **Dev mode works**
  ```bash
  npm run tauri:dev
  ```
  - [ ] Window opens
  - [ ] Backend starts automatically
  - [ ] Hot reload works (edit React code)
  - [ ] Can navigate all pages
  - [ ] WebSocket connects
  - [ ] No console errors

### 6.2 Build Testing

- [ ] **Build succeeds on all platforms**
  ```bash
  npm run build:win:tauri    # Windows
  npm run build:mac:tauri    # macOS
  npm run build:linux:tauri  # Linux
  ```

- [ ] **Artifacts exist**
  - Windows: `dist/installers/win32-x64/*.exe`
  - macOS: `dist/installers/darwin-arm64/*.dmg`
  - Linux: `dist/installers/linux-x64/*.deb` and `*.rpm`

### 6.3 Installation Testing

For each platform:

- [ ] **Install package**
- [ ] **Verify files**
  - Tauri binary present
  - Node runtime present
  - App files present
  - Icons present

- [ ] **Launch desktop app**
  - [ ] Opens without errors
  - [ ] Backend starts automatically
  - [ ] Can navigate pages
  - [ ] Settings save correctly
  - [ ] Can start/stop tasks

- [ ] **Test CLI**
  ```bash
  puppet-master --version
  puppet-master doctor
  puppet-master init
  ```

- [ ] **Uninstall**
  - [ ] Uninstaller removes all files
  - [ ] No leftover processes

### 6.4 Cross-Platform Testing

- [ ] Test on Windows 10/11
- [ ] Test on macOS 12+
- [ ] Test on Ubuntu 20.04/22.04
- [ ] Test on different architectures (x64, arm64)

---

## Phase 7: Documentation Updates (30 min)

- [ ] **Update** `TAURI_IMPLEMENTATION_STATUS.md`:
  - Mark completed items
  - Update status to "Complete"
  - Add any learnings/gotchas

- [ ] **Update** `TAURI_SETUP.md`:
  - Add any platform-specific notes
  - Document known issues

- [ ] **Update** main `README.md`:
  - Mention Tauri desktop app
  - Link to Tauri docs

- [ ] **Create** release notes:
  - List new Tauri feature
  - Mention backward compatibility
  - Provide migration guide

---

## Phase 8: CI/CD Integration (1 hour, optional)

- [ ] **Create** `.github/workflows/build-tauri.yml`:
  ```yaml
  name: Build with Tauri
  
  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]
  
  jobs:
    build:
      strategy:
        matrix:
          os: [ubuntu-latest, macos-latest, windows-latest]
      
      runs-on: ${{ matrix.os }}
      
      steps:
        - uses: actions/checkout@v3
        
        - uses: actions/setup-node@v3
          with:
            node-version: 20
        
        - uses: actions-rs/toolchain@v1
          with:
            toolchain: stable
        
        - name: Install Linux dependencies
          if: runner.os == 'Linux'
          run: |
            sudo apt update
            sudo apt install -y libwebkit2gtk-4.0-dev libgtk-3-dev
        
        - name: Install dependencies
          run: npm ci
        
        - name: Build
          run: npm run build
        
        - name: Build Tauri
          run: npm run tauri:build
        
        - name: Upload artifacts
          uses: actions/upload-artifact@v3
          with:
            name: tauri-${{ matrix.os }}
            path: src-tauri/target/release/bundle/
  ```

- [ ] **Test** CI pipeline runs successfully

---

## Success Criteria ✓

You're done when:

- [x] Tauri dev mode works
- [x] Backend starts automatically
- [x] All pages load correctly
- [x] Installers include Tauri app
- [x] Desktop shortcuts launch Tauri
- [x] CLI still works independently
- [x] Tests pass on all platforms
- [x] Documentation updated
- [x] No breaking changes to existing builds

---

## Troubleshooting

### Rust doesn't compile
- Check Rust version: `rustc --version`
- Update Rust: `rustup update`
- Check platform dependencies installed

### Backend doesn't start
- Check paths in `main.rs` match your installer structure
- Verify Node runtime is bundled correctly
- Check environment variables

### Window opens but shows error
- Backend not running? Check logs
- Wrong port? Check `tauri.conf.json` url
- CORS issue? Check backend CORS config

### Installer doesn't include Tauri
- Check `stageTauriApp()` ran successfully
- Verify artifact paths are correct
- Check build logs for errors

---

## Time Estimates

| Phase | Estimated Time |
|-------|---------------|
| 1. Verify Infrastructure | 15 min |
| 2. Test Tauri Dev Mode | 30 min |
| 3. Backend Auto-Launch | 2-3 hours |
| 4. Update Build Scripts | 1-2 hours |
| 5. Update Installers | 2-3 hours |
| 6. Testing | 2-3 hours |
| 7. Documentation | 30 min |
| 8. CI/CD (optional) | 1 hour |
| **TOTAL** | **8-12 hours** |

---

## Need Help?

- **Documentation**: `docs/TAURI_INTEGRATION.md`
- **Status**: `docs/TAURI_IMPLEMENTATION_STATUS.md`
- **Quick Start**: `TAURI_SETUP.md`
- **Overview**: `CHANGES_OVERVIEW.md`
- **Tauri Docs**: https://tauri.app/v1/guides/
- **Rust Docs**: https://doc.rust-lang.org/book/

---

## When You're Done

- [ ] Mark this file as complete
- [ ] Update `TAURI_IMPLEMENTATION_STATUS.md`
- [ ] Create pull request with screenshots
- [ ] Update project README
- [ ] Celebrate! 🎉

---

**Good luck!** The infrastructure is solid, you just need to connect the pieces.
