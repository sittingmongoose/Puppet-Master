#!/bin/bash
# Build installer script for macOS (Rust/Iced)
# Usage: ./scripts/build-installer-macos.sh

set -euo pipefail

echo "=== Puppet Master macOS Installer Build (Rust/Iced) ==="
echo ""

# Check Rust/Cargo
echo "Checking Rust/Cargo..."
if ! command -v cargo &> /dev/null; then
    echo "  ERROR: cargo not found. Please install Rust from https://rustup.rs/" >&2
    exit 1
fi

CARGO_VERSION=$(cargo --version)
echo "  Cargo: $CARGO_VERSION"

# Check Xcode Command Line Tools
echo "Checking Xcode Command Line Tools..."
if ! xcode-select -p &> /dev/null; then
    echo "  ERROR: Xcode Command Line Tools not found." >&2
    echo "  Please install by running: xcode-select --install" >&2
    exit 1
fi
echo "  Xcode Command Line Tools: installed"

# Check hdiutil
echo "Checking hdiutil..."
if ! command -v hdiutil &> /dev/null; then
    echo "  ERROR: hdiutil not found. This should come with macOS." >&2
    exit 1
fi
echo "  hdiutil: available"

# Check codesign
echo "Checking codesign..."
if ! command -v codesign &> /dev/null; then
    echo "  ERROR: codesign not found. This should come with macOS." >&2
    exit 1
fi
echo "  codesign: available"

# Get repository root
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Extract version from Cargo.toml
echo ""
echo "Extracting version from puppet-master-rs/Cargo.toml..."
VERSION=$(grep '^version = ' puppet-master-rs/Cargo.toml | head -n1 | sed 's/version = "\(.*\)"/\1/')
if [ -z "$VERSION" ]; then
    echo "  ERROR: Could not extract version from Cargo.toml" >&2
    exit 1
fi
echo "  Version: $VERSION"

echo ""
echo "=== Building Installer ==="
echo ""

# Call the existing macOS DMG builder
echo "Invoking installer/macos/build-dmg.sh $VERSION..."
bash installer/macos/build-dmg.sh "$VERSION"

# Verify output
echo ""
echo "=== Build Complete ==="
DMG_FILE="installer/macos/RWM-Puppet-Master-${VERSION}.dmg"
if [ -f "$DMG_FILE" ]; then
    DMG_SIZE=$(du -h "$DMG_FILE" | cut -f1)
    echo "DMG installer created: $DMG_FILE"
    echo "Size: $DMG_SIZE"
else
    echo "WARNING: DMG file not found at $DMG_FILE" >&2
fi

echo ""
echo "Done!"
