# RWM Puppet Master Installers

This directory contains installer configuration and build scripts for all platforms.

## Directory Structure

```
installer/
├── windows/
│   └── puppet-master.nsi          # NSIS installer script
├── macos/
│   ├── Info.plist                 # macOS bundle metadata
│   └── build-dmg.sh               # DMG builder script
└── linux/
    └── (output directory for .deb and .rpm packages)
```

## Building Installers

### Prerequisites

**All Platforms:**
- Rust 1.93+ with edition 2024
- cargo installed

**Windows:**
- NSIS (Nullsoft Scriptable Install System)
- Windows target: `rustup target add x86_64-pc-windows-msvc`

**macOS:**
- Xcode command line tools
- Targets: `rustup target add aarch64-apple-darwin x86_64-apple-darwin`

**Linux:**
- glibc build toolchain (`build-essential`, `pkg-config`)
- dpkg-deb for .deb packages (pre-installed on Debian/Ubuntu)
- rpmbuild for .rpm packages (optional): `apt install rpm`

### Windows Installer

```bash
# Build the binary
cd puppet-master-rs
cargo build --release

# Build installer with NSIS (base semver + display metadata)
cd ../installer/windows
makensis /DVERSION=0.1.1 /DDISPLAY_VERSION=0.1.1+b20260216010101 puppet-master.nsi
```

Output: `RWM-Puppet-Master-0.1.1-setup.exe` (Windows Add/Remove Programs shows `DisplayVersion`)

### macOS DMG

```bash
cd installer/macos
PM_BUILD_ID=20260216010101 PM_BUILD_UTC=20260216010101 ./build-dmg.sh 0.1.1
```

Output: `RWM-Puppet-Master-0.1.1+b20260216010101.dmg` (Universal binary for Intel + Apple Silicon)

### Linux Packages

```bash
cd scripts
PM_BUILD_ID=20260216010101 PM_BUILD_UTC=20260216010101 ./build-linux-installer.sh 0.1.1
```

Output:
- `installer/linux/puppet-master_0.1.1+b20260216010101_amd64.deb`
- `installer/linux/puppet-master-0.1.1-1.20260216010101.x86_64.rpm` (if rpmbuild available)

The Linux installer packages a release binary built from `puppet-master-rs` (glibc target).

## Binary Features

- **Native Linux binary package** (.deb and optional .rpm)
- **Universal macOS binary** (Intel + Apple Silicon)
- **Windows native binary** (MSVC runtime)
- **GUI with system tray** (iced + tray-icon)
- **Zero runtime dependencies** (all bundled)

## Installation

### Windows
1. Download and run the `.exe` installer
2. Follow the installation wizard
3. The app will be installed to `C:\Program Files\RWM Puppet Master`
4. Data and logs are stored in `%LOCALAPPDATA%\RWM Puppet Master` (user-writable location)
5. Launch from Start Menu or Desktop shortcut
6. Uninstall via Control Panel → Programs and Features

**Note:** The GUI app runs without a console window in release mode. For debugging, use the debug build.

### macOS

**Security Notice**

This app is **ad-hoc code signed** to prevent "damaged app" errors. On first launch, you'll see:
- "RWM Puppet Master cannot be opened because the developer cannot be verified"

**To install:**
1. Download and open the `.dmg` file
2. Drag "RWM Puppet Master.app" to Applications folder
3. **First launch**: Right-click (or Control+click) on the app → Select "Open"
4. Click "Open" in the security dialog
5. Future launches: Double-click normally (no special steps needed)

**Why this happens:**
- GitHub Actions builds are ad-hoc signed (not notarized with Apple)
- Full notarization requires a paid Apple Developer account ($99/year)
- Ad-hoc signing ensures the app isn't "damaged" while allowing user override

**For enterprise deployment:**
- Use MDM profiles to whitelist the app
- Or: Set up proper Apple Developer signing + notarization in CI/CD

### Linux (Debian/Ubuntu)
```bash
sudo dpkg -i puppet-master_0.1.1_amd64.deb
```

**If installation fails:**
```bash
# Check dependencies
sudo apt-get install -f

# Or install dependencies manually
sudo apt-get install libgtk-3-0 libglib2.0-0 libcairo2 libpango-1.0-0
```

### Linux (RHEL/Fedora/CentOS)
```bash
sudo rpm -i puppet-master-0.1.1-1.x86_64.rpm
```

**Note:** Ubuntu users should use the `.deb` package. RPM is for Red Hat-based distros only.

## Verification

Check package metadata and contents:
```bash
dpkg-deb --info installer/linux/puppet-master_0.1.1_amd64.deb
dpkg-deb --contents installer/linux/puppet-master_0.1.1_amd64.deb
```

## Project Info

- **Name:** RWM Puppet Master
- **Versioning:** base SemVer from `Cargo.toml` + per-build metadata (`PM_BUILD_ID`, `PM_BUILD_UTC`, git SHA)
- **Identifier:** com.rwm.puppet-master
- **Description:** AI-assisted development orchestrator
- **License:** MIT
- **Rust Edition:** 2024
- **Min Rust:** 1.93

## Build Artifacts

All installers are self-contained and include:
- Compiled puppet-master binary
- Application icon
- Desktop integration files
- Uninstaller (Windows) or standard package removal (Linux/macOS)
