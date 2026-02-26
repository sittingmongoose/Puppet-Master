#!/bin/bash
# Quick Build Script for All Platform Installers
# Puppet Master - Rust-only Build System

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
VERSION=$(grep -m1 "^version" "${PROJECT_ROOT}/puppet-master-rs/Cargo.toml" | cut -d'"' -f2)

echo "🚀 Puppet Master Installer Build System"
echo "Version: ${VERSION}"
echo ""

# Function to build Windows installer
build_windows() {
    echo "=== Building Windows Installer ==="
    cd "${PROJECT_ROOT}/puppet-master-rs"
    
    if ! command -v makensis &> /dev/null; then
        echo "⚠️  NSIS not found. Install from https://nsis.sourceforge.io/"
        return 1
    fi
    
    echo "Building Windows binary..."
    cargo build --release --target x86_64-pc-windows-msvc
    
    echo "Creating installer..."
    cd "${PROJECT_ROOT}/installer/windows"
    makensis /DVERSION="${VERSION}" puppet-master.nsi
    
    echo "✅ Windows installer created!"
}

# Function to build macOS DMG
build_macos() {
    echo "=== Building macOS DMG ==="
    cd "${PROJECT_ROOT}/installer/macos"
    
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo "⚠️  macOS build must run on macOS"
        return 1
    fi
    
    ./build-dmg.sh "${VERSION}"
    echo "✅ macOS DMG created!"
}

# Function to build Linux packages
build_linux() {
    echo "=== Building Linux Packages ==="
    cd "${PROJECT_ROOT}/scripts"
    
    if ! rustup target list | grep -q "x86_64-unknown-linux-musl (installed)"; then
        echo "Installing musl target..."
        rustup target add x86_64-unknown-linux-musl
    fi
    
    ./build-linux-installer.sh "${VERSION}"
    echo "✅ Linux packages created!"
}

# Main menu
echo "Select platform to build:"
echo "  1) Windows (NSIS installer)"
echo "  2) macOS (DMG)"
echo "  3) Linux (DEB + RPM)"
echo "  4) All platforms"
echo "  q) Quit"
echo ""
read -p "Choice: " choice

case $choice in
    1)
        build_windows
        ;;
    2)
        build_macos
        ;;
    3)
        build_linux
        ;;
    4)
        echo "Building all platforms..."
        build_windows || echo "Windows build failed"
        build_macos || echo "macOS build failed"
        build_linux || echo "Linux build failed"
        ;;
    q|Q)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Build complete!"
echo ""
echo "Output locations:"
echo "  Windows: installer/windows/Puppet-Master-${VERSION}-setup.exe"
echo "  macOS:   installer/macos/Puppet-Master-${VERSION}.dmg"
echo "  Linux:   installer/linux/puppet-master_${VERSION}_amd64.deb"
echo "           installer/linux/puppet-master-${VERSION}-1.x86_64.rpm"
