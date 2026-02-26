#!/bin/bash
# Test script for debugging Linux DEB installation issues
set -e

VERSION="${1:-0.1.1}"
DEB_FILE="installer/linux/puppet-master_${VERSION}_amd64.deb"

echo "=== Puppet Master DEB Installation Test ==="
echo ""

if [ ! -f "$DEB_FILE" ]; then
    echo "❌ Error: DEB file not found at $DEB_FILE"
    echo "Run: cd scripts && ./build-linux-installer.sh $VERSION"
    exit 1
fi

echo "✓ Found DEB file: $DEB_FILE"
echo "  Size: $(du -h "$DEB_FILE" | cut -f1)"
echo ""

echo "=== Package Info ==="
dpkg-deb --info "$DEB_FILE"
echo ""

echo "=== Package Contents ==="
dpkg-deb --contents "$DEB_FILE"
echo ""

echo "=== Dependency Check ==="
echo "Checking for required libraries..."

check_lib() {
    if ldconfig -p | grep -q "$1"; then
        echo "  ✓ $1 found"
    else
        echo "  ❌ $1 NOT FOUND"
        return 1
    fi
}

all_deps_ok=true
check_lib "libgtk-3.so.0" || all_deps_ok=false
check_lib "libglib-2.0.so.0" || all_deps_ok=false
check_lib "libcairo.so.2" || all_deps_ok=false
check_lib "libpango-1.0.so.0" || all_deps_ok=false
check_lib "libgdk-pixbuf-2.0.so.0" || all_deps_ok=false

echo ""

if [ "$all_deps_ok" = false ]; then
    echo "⚠️  Missing dependencies detected!"
    echo "Install with: sudo apt-get install libgtk-3-0 libglib2.0-0 libcairo2 libpango-1.0-0 libgdk-pixbuf-2.0-0"
    echo ""
fi

echo "=== Installation Test ==="
read -p "Install the package now? (requires sudo) [y/N] " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing..."
    sudo dpkg -i "$DEB_FILE" || {
        echo ""
        echo "Installation failed! Trying to fix dependencies..."
        sudo apt-get install -f
    }

    echo ""
    echo "=== Verifying Installation ==="

    if command -v puppet-master >/dev/null 2>&1; then
        echo "✓ Binary is in PATH"
        echo "  Location: $(which puppet-master)"
        echo ""
        echo "Testing binary..."
        puppet-master --version || echo "❌ Failed to run --version"
    else
        echo "❌ Binary not found in PATH"
        echo "Checking /usr/bin..."
        if [ -f /usr/bin/puppet-master ]; then
            echo "  Found at /usr/bin/puppet-master but not in PATH?"
            /usr/bin/puppet-master --version || echo "  Failed to run"
        else
            echo "  Not found at /usr/bin/puppet-master"
        fi
    fi

    echo ""
    echo "=== Desktop Entry Check ==="
    if [ -f /usr/share/applications/puppet-master.desktop ]; then
        echo "✓ Desktop entry installed"
        cat /usr/share/applications/puppet-master.desktop
    else
        echo "❌ Desktop entry not found"
    fi

echo ""
echo "=== Installation Log ==="
echo "Check dpkg logs:"
echo "  sudo grep -E 'puppet-master' /var/log/dpkg.log | tail -20"
echo ""
echo "Check apt logs:"
echo "  sudo grep -E 'puppet-master' /var/log/apt/term.log | tail -20"
else
    echo "Skipping installation"
fi

echo ""
echo "=== Done ==="
