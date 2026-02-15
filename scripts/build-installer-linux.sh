#!/bin/bash
# Build installer script for Linux (Rust/Iced)
# Usage: ./scripts/build-installer-linux.sh

set -euo pipefail

echo "=== Puppet Master Linux Installer Build (Rust/Iced) ==="
echo ""

# Check Rust/Cargo
echo "Checking Rust/Cargo..."
if ! command -v cargo &> /dev/null; then
    echo "  ERROR: cargo not found. Please install Rust from https://rustup.rs/" >&2
    exit 1
fi

CARGO_VERSION=$(cargo --version)
echo "  Cargo: $CARGO_VERSION"

# Check dpkg (for DEB packages)
echo "Checking dpkg..."
if ! command -v dpkg &> /dev/null; then
    echo "  WARNING: dpkg not found. DEB packages will not be created." >&2
    echo "  Install with: sudo apt-get install dpkg" >&2
fi

# Check rpmbuild (for RPM packages)
echo "Checking rpmbuild..."
if ! command -v rpmbuild &> /dev/null; then
    echo "  WARNING: rpmbuild not found. RPM packages will not be created." >&2
    echo "  Install with: sudo apt-get install rpm" >&2
fi

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

# Call the existing Linux installer script
echo "Invoking scripts/build-linux-installer.sh $VERSION..."
bash scripts/build-linux-installer.sh "$VERSION"

# Verify output
echo ""
echo "=== Build Complete ==="
DEB_FILE="installer/linux/puppet-master_${VERSION}_amd64.deb"
RPM_FILE="installer/linux/puppet-master-${VERSION}-1.x86_64.rpm"

if [ -f "$DEB_FILE" ]; then
    DEB_SIZE=$(du -h "$DEB_FILE" | cut -f1)
    echo "DEB package created: $DEB_FILE"
    echo "Size: $DEB_SIZE"
else
    echo "WARNING: DEB package not found at $DEB_FILE" >&2
fi

if [ -f "$RPM_FILE" ]; then
    RPM_SIZE=$(du -h "$RPM_FILE" | cut -f1)
    echo "RPM package created: $RPM_FILE"
    echo "Size: $RPM_SIZE"
else
    echo "Note: RPM package not found at $RPM_FILE (rpmbuild may not be available)"
fi

echo ""
echo "Done!"
