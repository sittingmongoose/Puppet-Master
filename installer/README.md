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
- musl target: `rustup target add x86_64-unknown-linux-musl`
- musl-tools: `apt install musl-tools` (Debian/Ubuntu)
- dpkg-deb for .deb packages (pre-installed on Debian/Ubuntu)
- rpmbuild for .rpm packages (optional): `apt install rpm`

### Windows Installer

```bash
# Build the binary
cd puppet-master-rs
cargo build --release

# Build installer with NSIS
cd ../installer/windows
makensis /DVERSION=0.1.1 puppet-master.nsi
```

Output: `RWM-Puppet-Master-0.1.1-setup.exe`

### macOS DMG

```bash
cd installer/macos
./build-dmg.sh 0.1.1
```

Output: `RWM-Puppet-Master-0.1.1.dmg` (Universal binary for Intel + Apple Silicon)

### Linux Packages

```bash
cd scripts
./build-linux-installer.sh 0.1.1
```

Output:
- `installer/linux/puppet-master_0.1.1_amd64.deb`
- `installer/linux/puppet-master-0.1.1-1.x86_64.rpm` (if rpmbuild available)

The Linux binary is statically linked using musl, requiring no external dependencies.

## Binary Features

- **Fully static Linux binary** (no libc dependency)
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

Check static linking on Linux:
```bash
file /tmp/puppet-master-build/x86_64-unknown-linux-musl/release/puppet-master
ldd /tmp/puppet-master-build/x86_64-unknown-linux-musl/release/puppet-master
```

Should show: "statically linked" and "not a dynamic executable"

## Project Info

- **Name:** RWM Puppet Master
- **Version:** 0.1.1
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
