# DevOps Audit: Build, Install & Packaging Reality

**Date:** 2024-02-11  
**Audit Scope:** Complete build/packaging/runtime entrypoint analysis  
**Status:** Read-only audit, no code changes

---

## Executive Summary

This repository contains **THREE distinct runtime architectures** with overlapping but non-unified build/install workflows:

1. **Node.js CLI** (`dist/cli/index.js`) - Primary runtime, production-ready
2. **Rust Native GUI** (`puppet-master-rs/`) - Standalone Iced GUI, separate binary
3. **Tauri Desktop Wrapper** (`src-tauri/`) - Web GUI wrapper, experimental integration

**Critical Finding:** The packaging systems are partially unified but have different maturity levels and runtime behaviors.

---

## 1. Node.js CLI Runtime (Primary)

### Entrypoint Definition

**File:** `package.json`
```json
{
  "bin": {
    "puppet-master": "./dist/cli/index.js"
  }
}
```

**Source:** `src/cli/index.ts` (line 1-2)
```typescript
#!/usr/bin/env node

import { Command } from 'commander';
```

**Built Output:** `dist/cli/index.js`
- Preserves shebang `#!/usr/bin/env node`
- Compiled from TypeScript via `tsc`
- ES modules (NodeNext)

### Build Commands

**TypeScript Compilation:**
```bash
npm run build          # tsc (src/ → dist/)
npm run gui:build      # React GUI (src/gui/react → src/gui/react/dist)
```

**Config:** `tsconfig.json`
- Target: ES2022
- Module: NodeNext
- Output: `./dist`
- SourceMaps: Enabled

### CLI Commands Implemented

The `puppet-master` binary supports:
- `check` - Verify phase completion
- `start` - Start orchestration
- `doctor` - Platform diagnostics
- `status` - Session status
- `plan` - Create work plan
- `init` - Initialize config
- `gui` - **Launch web server** (port 3847)
- `pause/resume/stop` - Session control
- `install` - Install platform CLIs
- Plus 15+ additional commands

### GUI Command Behavior

**File:** `dist/cli/commands/gui.js` (from `src/cli/commands/gui.ts`)

**Runtime Flow:**
1. Loads `ConfigManager` and creates DI container
2. Initializes `GuiServer` (Express + WebSocket)
3. Creates `Orchestrator` instance
4. Binds to port (default 3847)
5. Opens browser (unless `--no-open`)

**Server Stack:**
- Express HTTP server
- WebSocket for real-time updates
- React SPA served from `src/gui/react/dist`
- Backend API at `http://127.0.0.1:3847`

**Launch Script:** `run-puppet-master-gui.sh`
```bash
#!/usr/bin/env bash
# Ensures build, then runs:
node dist/cli/index.js gui
```

### Node.js Installer Build System

**Script:** `scripts/build-installer.ts`

**Process:**
1. Downloads Node.js embedded runtime (v24.1.0 by default)
2. Bundles `dist/`, `node_modules/`, React GUI
3. Creates platform packages with bundled Node

**Output Artifacts:**

**Linux (via nfpm):**
- `puppet-master_0.1.1_amd64.deb`
- `puppet-master-0.1.1.x86_64.rpm`
- Installs to: `/opt/puppet-master/`
- Binary wrapper: `/usr/bin/puppet-master-gui`

**macOS (via pkgbuild/hdiutil):**
- `RWM-Puppet-Master-0.1.1.dmg`
- Contains `.pkg` installer
- Installs to: `/Applications/RWM Puppet Master.app`

**Windows (via NSIS):**
- `RWM-Puppet-Master-0.1.1-setup.exe`
- Installs to: `C:\Program Files\RWM Puppet Master\`

**Key Files:**
- `installer/linux/scripts/postinstall` - Desktop entry creation
- `installer/linux/scripts/install.sh` - GUI installer wrapper
- `installer/macos/build-dmg.sh` - DMG creation (currently for Rust binary)
- `installer/windows/puppet-master.nsi` - NSIS config (currently for Rust binary)

**NOTE:** The installer system has **partial integration** with Tauri:
- `--with-tauri` flag exists but is **optional**
- Auto-detection available via `--auto-detect-tauri`
- Designed to bundle Tauri binary alongside Node CLI

---

## 2. Rust Native GUI (Separate Binary)

### Entrypoint Definition

**Cargo.toml:** `puppet-master-rs/Cargo.toml`
```toml
[package]
name = "puppet-master"
version = "0.1.1"

[[bin]]
name = "puppet-master"
path = "src/main.rs"
```

**Source:** `puppet-master-rs/src/main.rs` (59 lines)
```rust
fn main() -> Result<()> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();

    let _ = dotenv::dotenv();
    info!("RWM Puppet Master v{} starting...", env!("CARGO_PKG_VERSION"));

    // Launch the Iced application with tray icon
    app::run(shutdown_flag)?;
    
    Ok(())
}
```

### Technology Stack

- **GUI Framework:** Iced 0.13 (pure Rust)
- **System Tray:** tray-icon + muda
- **Database:** rusqlite (bundled SQLite)
- **Async:** Tokio full features
- **Platforms:** Linux, macOS, Windows

### Build Commands

**Rust Compilation:**
```bash
cd puppet-master-rs
cargo build --release
# Output: target/release/puppet-master (or .exe)
```

**GitHub Actions:** `.github/workflows/build-installers.yml`
- Builds for all platforms (Linux musl, macOS universal, Windows MSVC)
- Creates static Linux binary
- Produces DMG, DEB, RPM, NSIS installers
- **Separate from Node.js workflow**

### Runtime Behavior

This is a **standalone native application**:
- Does NOT require Node.js runtime
- Does NOT launch the Node.js web server
- Implements its own GUI using Iced (native widgets)
- Separate state management, database, configuration

**Integration Status:** Minimal
- Shares config file format (YAML)
- Can coexist with Node CLI
- But operates independently

---

## 3. Tauri Desktop Wrapper (Experimental)

### Entrypoint Definition

**Cargo.toml:** `src-tauri/Cargo.toml`
```toml
[package]
name = "puppet-master"
version = "0.1.1"

[dependencies]
tauri = { version = "2", features = ["tray-icon", "image-png", "image-ico"] }
```

**Source:** `src-tauri/src/main.rs` (768+ lines, 42KB)

**Key Functionality:**
```rust
fn main() {
    // Enriches PATH with common tool directories
    enrich_path_env(&common_extra_paths(home_dir.as_deref()));
    
    // Starts Node.js CLI server in background
    let mut server_handle = start_backend(config_path, ...);
    
    // Builds Tauri application
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new()...)
        .setup(|app| {
            create_tray_icon(app)?;
            create_main_window(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            // Handle minimize-to-tray
        })
        .run(context)
}
```

### Technology Stack

- **Framework:** Tauri v2
- **Frontend:** React SPA from `src/gui/react/dist`
- **Backend:** Spawns `node dist/cli/index.js gui` as child process
- **WebView:** System WebView (WebKit/Edge)
- **IPC:** Connects to `http://127.0.0.1:3847`

### Build Commands

**Tauri Compilation:**
```bash
npm run tauri:build
# Or via npx:
npx tauri build
```

**Output:**
- Linux: `src-tauri/target/release/puppet-master`
- macOS: `src-tauri/target/release/bundle/macos/Puppet Master.app`
- Windows: `src-tauri/target/release/puppet-master.exe`

**tauri.conf.json:**
```json
{
  "build": {
    "beforeBuildCommand": "",
    "devUrl": "http://127.0.0.1:3847",
    "frontendDist": "../src/gui/react/dist"
  },
  "bundle": {
    "targets": "all",
    "icon": ["icons/32x32.png", "icons/icon.ico", "icons/icon.icns"]
  }
}
```

### Runtime Behavior

**Hybrid Architecture:**
1. Tauri launches native window
2. Spawns Node.js backend (`node dist/cli/index.js gui --no-open`)
3. Loads React UI in WebView
4. WebView connects to localhost:3847
5. Window-to-tray minimize behavior
6. PATH enrichment for CLI tool discovery

**Installer Integration:**
- `scripts/build-installer.ts` has `--with-tauri` flag
- Auto-detects Cargo availability
- Copies Tauri binary into Node installer payload
- Creates launcher that prefers Tauri over browser

---

## 4. CI/CD Workflows

### GitHub Actions

**File:** `.github/workflows/build-installers.yml`

**Jobs:**

1. **test** (Ubuntu)
   - Working directory: `puppet-master-rs`
   - `cargo fmt --check`
   - `cargo clippy`
   - `cargo test`

2. **build** (Matrix: Linux/macOS/Windows)
   - Builds Rust binary for multiple targets
   - Linux: `x86_64-unknown-linux-musl` (static)
   - macOS: `aarch64-apple-darwin` + `x86_64-apple-darwin`
   - Windows: `x86_64-pc-windows-msvc`
   - Outputs: `puppet-master-linux-x86_64`, `puppet-master-macos-arm64`, etc.

3. **macos-universal**
   - Creates universal binary via `lipo`
   - Combines arm64 + x86_64

4. **package** (Conditional: push to main/master or tags)
   - Linux: nfpm → DEB + RPM
   - macOS: DMG creation
   - Windows: NSIS installer

5. **release** (Tags only)
   - Creates GitHub release
   - Uploads all artifacts

**Platforms Built:**
- `ubuntu-latest` → Linux x86_64 musl (static)
- `macos-14` → macOS arm64 + x86_64 (universal)
- `windows-latest` → Windows x86_64 MSVC

**Node.js Installer CI:** Not currently in workflows
- Designed for manual execution via `npm run build:linux`, etc.
- Requires `scripts/build-installer.ts`

---

## 5. Local Build Scripts

### Top-Level Scripts

**File:** Root directory
- `build-all-installers.sh` - Menu-driven installer builder (Rust only)
- `build-installer-linux.sh` - Wrapper → `scripts/build-installer-linux.sh`
- `build-installer-macos.command` - Wrapper → `scripts/build-installer-macos.sh`
- `build-installer-windows.bat` - Wrapper → `scripts/build-installer-windows.bat`
- `run-puppet-master-gui.sh` - Launches Node.js GUI server

### scripts/ Directory

**Node.js Installers:**
- `scripts/build-installer.ts` - Main installer builder (Node embedded runtime)
- `scripts/build-installer-linux.sh` - Linux build script
- `scripts/build-installer-macos.sh` - macOS build script

**Rust Installers:**
- `installer/macos/build-dmg.sh` - DMG for Rust binary
- `installer/windows/puppet-master.nsi` - NSIS for Rust binary
- `installer/linux/scripts/postinstall` - DEB/RPM post-install

---

## 6. Runtime Entrypoint Matrix

| Launch Method | Runtime | Entrypoint | Port | Dependencies |
|---------------|---------|------------|------|--------------|
| `puppet-master gui` | Node.js | `dist/cli/index.js` → `GuiCommand` | 3847 | Node 18+ |
| `./run-puppet-master-gui.sh` | Node.js | Same as above | 3847 | Node 18+ |
| Installed package (Linux DEB/RPM) | Node.js | `/usr/bin/puppet-master-gui` wrapper | 3847 | Bundled Node |
| Rust standalone | Native | `puppet-master-rs/target/release/puppet-master` | N/A | None (static) |
| Tauri desktop app | Hybrid | `src-tauri/target/release/puppet-master` → spawns Node | 3847 | Bundled Node |
| Windows NSIS (current) | Native | `C:\Program Files\RWM Puppet Master\puppet-master.exe` | N/A | None |

---

## 7. Packaging Output Locations

### Node.js Installers

**After `npm run build:linux`:**
```
dist/installers/linux-x64/
├── puppet-master_0.1.1_amd64.deb
└── puppet-master-0.1.1.x86_64.rpm
```

**After `npm run build:mac`:**
```
dist/installers/darwin-arm64/
└── RWM-Puppet-Master-0.1.1.dmg
```

**After `npm run build:win`:**
```
dist/installers/win32-x64/
└── RWM-Puppet-Master-0.1.1-setup.exe
```

### Rust Installers (CI)

**GitHub Actions artifacts:**
```
artifacts/
├── puppet-master-linux-x86_64/puppet-master
├── puppet-master-macos-universal/puppet-master-universal
├── puppet-master-windows-x86_64/puppet-master.exe
├── installer-ubuntu-latest/
│   ├── puppet-master_0.1.1_amd64.deb
│   └── puppet-master-0.1.1.x86_64.rpm
├── installer-macos-14/
│   └── puppet-master-0.1.1-universal.dmg
└── installer-windows-latest/
    └── puppet-master-setup-0.1.1-x86_64.exe
```

### Tauri Build Output

**Not yet in CI, manual build:**
```
src-tauri/target/release/
├── puppet-master (Linux/macOS binary)
└── puppet-master.exe (Windows)

src-tauri/target/release/bundle/
├── macos/Puppet Master.app
├── deb/puppet-master_0.1.1_amd64.deb
├── appimage/puppet-master_0.1.1_amd64.AppImage
└── msi/puppet-master_0.1.1_x64.msi
```

---

## 8. Install Destinations

### Linux DEB/RPM (Node.js version)

**Files installed:**
```
/opt/puppet-master/
├── app/                    # Node.js application
│   ├── node                # Embedded Node runtime
│   ├── dist/               # Compiled TypeScript
│   ├── node_modules/       # Dependencies
│   └── src/gui/react/dist/ # React UI
├── bin/
│   └── puppet-master-gui   # Launcher script
└── puppet-master.png       # Icon

/usr/share/applications/
└── puppet-master.desktop

/etc/xdg/autostart/
└── puppet-master-autostart.desktop

/usr/bin/
└── puppet-master-gui → /opt/puppet-master/bin/puppet-master-gui
```

### Linux DEB/RPM (Rust version from CI)

**Files installed:**
```
/usr/bin/
└── puppet-master           # Static binary

/usr/share/icons/hicolor/256x256/apps/
└── puppet-master.png

/usr/share/applications/
└── puppet-master.desktop
```

### macOS DMG (Node.js version)

**Bundle structure:**
```
/Applications/RWM Puppet Master.app/
└── Contents/
    ├── MacOS/
    │   ├── node            # Embedded Node
    │   └── puppet-master   # Launcher script
    ├── Resources/
    │   ├── app/            # Node.js application
    │   └── icon.icns
    └── Info.plist
```

### Windows NSIS (Rust version from CI)

**Files installed:**
```
C:\Program Files\RWM Puppet Master\
└── puppet-master.exe       # Native binary

C:\Users\<user>\Desktop\
└── RWM Puppet Master.lnk

C:\ProgramData\Microsoft\Windows\Start Menu\Programs\RWM Puppet Master\
├── RWM Puppet Master.lnk
└── Uninstall.lnk

Registry:
HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\RWMPuppetMaster
```

---

## 9. Key Findings & Inconsistencies

### 1. Three Independent Runtimes

**Issue:** No unified build system
- Node.js CLI: Production-ready, full features
- Rust Iced GUI: Separate implementation, different architecture
- Tauri wrapper: Hybrid approach, adds complexity

**Impact:** Maintenance burden, feature parity challenges

### 2. Installer Confusion

**Windows NSIS:** Currently packages **Rust binary**, not Node.js
```nsi
File "..\..\puppet-master-rs\target\release\puppet-master.exe"
```

**macOS build-dmg.sh:** Currently packages **Rust binary**, not Node.js
```bash
cargo build --release --target aarch64-apple-darwin
```

**But:** `scripts/build-installer.ts` is the **Node.js** packaging system
- Used for actual production Node deployments
- Has Tauri integration hooks (`--with-tauri`)

### 3. Dual Package Systems

**Rust packages (CI workflow):**
- Automated via GitHub Actions
- Static binaries
- Native installers (DEB, RPM, DMG, NSIS)
- **Does not include Node.js runtime**

**Node.js packages (manual builds):**
- Via `npm run build:*` scripts
- Bundles Node.js runtime
- Includes full web server + GUI
- **Does not run in CI**

### 4. Tauri Integration Status

**Code exists but not fully wired:**
- `--with-tauri` flag in `scripts/build-installer.ts`
- Tauri binary detection and staging code
- But no CI integration
- Manual build only

### 5. Runtime Mismatch Risks

**Scenario:** User installs Windows NSIS from GitHub releases
- Gets Rust standalone binary
- Expects web GUI on port 3847
- **No web server** (Rust GUI only)

**Scenario:** User installs Linux DEB via `npm run build:linux`
- Gets Node.js web server
- Expects native performance
- **Electron-like bundle size**

---

## 10. Recommendations

### Short-Term (Clarify Current State)

1. **Document runtime differences**
   - Add clear README sections for each variant
   - Explain use cases (Node CLI, Rust native, Tauri hybrid)

2. **Rename artifacts to avoid confusion**
   - `puppet-master-node-0.1.1.deb` (Node.js version)
   - `puppet-master-rust-0.1.1.deb` (Native version)
   - `puppet-master-tauri-0.1.1.deb` (Hybrid version)

3. **Add CI for Node.js installers**
   - Run `scripts/build-installer.ts` in GitHub Actions
   - Upload alongside Rust artifacts

### Medium-Term (Unify Build System)

1. **Single source of truth for installers**
   - Deprecate duplicate NSIS/DMG scripts in `installer/`
   - Use `scripts/build-installer.ts` as primary

2. **Automated Tauri builds in CI**
   - Add `--with-tauri` to installer workflow
   - Auto-detect Cargo, build both runtimes

3. **Consistent launcher behavior**
   - All installers provide `puppet-master gui` command
   - Prefer Tauri if available, fallback to browser

### Long-Term (Architecture Decision)

**Choose primary runtime:**

**Option A: Node.js + Tauri (current direction)**
- Keep Node.js backend as core
- Tauri as optional desktop wrapper
- Deprecate standalone Rust GUI

**Option B: Pure Rust**
- Commit to Iced GUI
- Reimplement orchestration in Rust
- Remove Node.js dependency

**Option C: Hybrid Maintained**
- Support all three variants
- Clear use case separation
- Unified packaging with feature flags

---

## 11. File Path Reference

### Primary Entrypoints

| Component | Source | Build Output | Config |
|-----------|--------|--------------|--------|
| Node CLI | `src/cli/index.ts` | `dist/cli/index.js` | `package.json` bin |
| Rust Native | `puppet-master-rs/src/main.rs` | `puppet-master-rs/target/release/puppet-master` | `puppet-master-rs/Cargo.toml` |
| Tauri Wrapper | `src-tauri/src/main.rs` | `src-tauri/target/release/puppet-master` | `src-tauri/tauri.conf.json` |

### Build Scripts

| Script | Purpose | Platform |
|--------|---------|----------|
| `scripts/build-installer.ts` | Node.js bundled installers | All |
| `scripts/build-installer-linux.sh` | Node.js Linux wrapper | Linux |
| `scripts/build-installer-macos.sh` | Node.js macOS wrapper | macOS |
| `installer/macos/build-dmg.sh` | Rust native DMG | macOS |
| `installer/windows/puppet-master.nsi` | Rust native NSIS | Windows |
| `.github/workflows/build-installers.yml` | Rust native CI | All |

### Launcher Scripts

| Script | Launches | Port | Runtime |
|--------|----------|------|---------|
| `run-puppet-master-gui.sh` | Node GUI server | 3847 | Node |
| `/usr/bin/puppet-master-gui` | Node GUI server (installed) | 3847 | Bundled Node |
| `src-tauri/run-desktop.sh` | Tauri dev mode | 3847 | Rust + Node |

---

## 12. Commands Reference

### Development

```bash
# Node.js development
npm run build              # TypeScript → dist/
npm run gui:dev           # React dev server (port 5173)
npm run gui:build         # React production build
npm run tauri:dev         # Tauri + React hot reload

# Rust development
cd puppet-master-rs && cargo run    # Native GUI
cd src-tauri && cargo tauri dev     # Tauri wrapper
```

### Production Builds

```bash
# Node.js installers (manual)
npm run build:linux       # DEB + RPM
npm run build:mac         # DMG
npm run build:win         # NSIS installer

# Rust installers (CI/manual)
cd puppet-master-rs && cargo build --release
./build-all-installers.sh

# Tauri installers (manual)
npm run tauri:build       # Platform-native bundles
```

### Running

```bash
# Via Node CLI (development)
./run-puppet-master-gui.sh

# Via installed package (Linux example)
puppet-master-gui

# Via Rust binary
./puppet-master-rs/target/release/puppet-master

# Via Tauri
./src-tauri/target/release/puppet-master
```

---

## Audit Conclusion

**Current Reality:**
- **Three runtime architectures** with separate build systems
- **Rust CI** is automated and production-ready
- **Node.js packaging** is manual and more mature
- **Tauri integration** exists but requires manual orchestration

**True Entrypoint for Production Users:**
- **Node.js installers:** `node dist/cli/index.js gui` (via launcher)
- **Rust installers:** Native binary, no web server
- **GitHub releases:** Currently provide Rust artifacts only

**Recommended Next Step:**
Choose primary deployment model and unify CI/packaging accordingly.

---

**Audit Completed:** No code changed, read-only analysis complete.
