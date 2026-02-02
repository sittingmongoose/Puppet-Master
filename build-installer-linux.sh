#!/bin/bash
# Puppet Master Linux Installer Build Launcher
# Run from terminal: ./build-installer-linux.sh
# Or: bash build-installer-linux.sh

set -euo pipefail

echo "========================================"
echo "Puppet Master Linux Installer Builder"
echo "========================================"
echo ""
echo "This will build the Linux installer (.deb and .rpm)"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Make the build script executable if needed
chmod +x scripts/build-installer-linux.sh

# Run the build script
./scripts/build-installer-linux.sh

echo ""
echo "========================================"
echo "Build process completed"
echo "========================================"
