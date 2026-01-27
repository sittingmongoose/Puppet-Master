#!/bin/bash
# Build installer script for macOS
# Usage: ./scripts/build-installer-macos.sh

set -euo pipefail

echo "=== Puppet Master macOS Installer Build ==="
echo ""

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "  ERROR: Node.js not found. Please install Node.js 20+ from https://nodejs.org/" >&2
    exit 1
fi

NODE_VERSION=$(node --version)
echo "  Node.js: $NODE_VERSION"

# Check if version is 20+
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/^v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 20 ]; then
    echo "  ERROR: Node.js 20+ required (found $NODE_VERSION)" >&2
    exit 1
fi

# Check npm
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "  ERROR: npm not found. npm should come with Node.js." >&2
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "  npm: $NPM_VERSION"

# Check Xcode Command Line Tools
echo "Checking Xcode Command Line Tools..."
if ! xcode-select -p &> /dev/null; then
    echo "  ERROR: Xcode Command Line Tools not found." >&2
    echo "  Please install by running: xcode-select --install" >&2
    exit 1
fi
echo "  Xcode Command Line Tools: installed"

# Check pkgbuild
echo "Checking pkgbuild..."
if ! command -v pkgbuild &> /dev/null; then
    echo "  ERROR: pkgbuild not found. This should come with Xcode Command Line Tools." >&2
    exit 1
fi
echo "  pkgbuild: $(pkgbuild --version 2>&1 | head -n1)"

# Check hdiutil
echo "Checking hdiutil..."
if ! command -v hdiutil &> /dev/null; then
    echo "  ERROR: hdiutil not found. This should come with macOS." >&2
    exit 1
fi
echo "  hdiutil: available"

# Get repository root
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo ""
echo "=== Building Installer ==="
echo ""

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Build GUI
echo "Building GUI..."
npm run gui:build

# Build installer
echo "Building macOS installer..."
npm run build:mac

# Verify output
echo ""
echo "=== Build Complete ==="
INSTALLER=$(find dist/installers/darwin-arm64 -name "*.dmg" 2>/dev/null | head -n1)
if [ -n "$INSTALLER" ]; then
    INSTALLER_SIZE=$(du -h "$INSTALLER" | cut -f1)
    echo "Installer created: $INSTALLER"
    echo "Size: $INSTALLER_SIZE"
else
    echo "WARNING: Installer file not found in dist/installers/darwin-arm64/" >&2
fi

echo ""
echo "Done!"
