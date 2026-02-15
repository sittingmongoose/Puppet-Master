#!/bin/bash
# Puppet Master macOS Installer Build Launcher
# Double-click this file in Finder to build the macOS installer
# Or run from terminal: ./build-installer-macos.command

set -euo pipefail

echo "========================================"
echo "Puppet Master macOS Installer Builder"
echo "========================================"
echo ""
echo "This will build the macOS installer (.dmg)"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Make the build script executable if needed
chmod +x scripts/build-installer-macos.sh

# Run the build script
./scripts/build-installer-macos.sh

echo ""
echo "========================================"
echo "Build process completed"
echo "========================================"
