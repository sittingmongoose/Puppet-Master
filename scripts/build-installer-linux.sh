#!/bin/bash
# Build installer script for Linux
# Usage: ./scripts/build-installer-linux.sh

set -euo pipefail

echo "=== Puppet Master Linux Installer Build ==="
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

# Check Go (required for nfpm)
echo "Checking Go..."
if ! command -v go &> /dev/null; then
    echo "  Go not found. Attempting to install nfpm via npm..." >&2
    # Try to install nfpm via npm if available
    if command -v npm &> /dev/null; then
        echo "  Installing nfpm via npm..." >&2
        npm install -g @goreleaser/nfpm || {
            echo "  ERROR: Failed to install nfpm. Please install Go:" >&2
            echo "    sudo apt-get install golang-go  # Debian/Ubuntu" >&2
            echo "    sudo yum install golang         # RHEL/CentOS" >&2
            echo "    Or download from https://go.dev/dl/" >&2
            exit 1
        }
    else
        echo "  ERROR: Go not found and npm unavailable. Please install Go:" >&2
        echo "    sudo apt-get install golang-go  # Debian/Ubuntu" >&2
        echo "    sudo yum install golang         # RHEL/CentOS" >&2
        exit 1
    fi
else
    GO_VERSION=$(go version)
    echo "  Go: $GO_VERSION"
fi

# Check nfpm
echo "Checking nfpm..."
if ! command -v nfpm &> /dev/null; then
    echo "  nfpm not found. Installing..."
    if command -v go &> /dev/null; then
        go install github.com/goreleaser/nfpm/v2/cmd/nfpm@latest
        # Add Go bin to PATH if not already there
        export PATH="$PATH:$(go env GOPATH)/bin"
        if ! command -v nfpm &> /dev/null; then
            echo "  ERROR: nfpm installation failed or not in PATH" >&2
            echo "  Please add $(go env GOPATH)/bin to your PATH" >&2
            exit 1
        fi
    else
        echo "  ERROR: nfpm not found and Go not available" >&2
        exit 1
    fi
fi

NFPM_VERSION=$(nfpm --version 2>&1 | head -n1 || echo "unknown")
echo "  nfpm: $NFPM_VERSION"

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
echo "Building Linux installer..."
npm run build:linux

# Verify output
echo ""
echo "=== Build Complete ==="
DEB_FILE=$(find dist/installers/linux-x64 -name "*.deb" 2>/dev/null | head -n1)
RPM_FILE=$(find dist/installers/linux-x64 -name "*.rpm" 2>/dev/null | head -n1)

if [ -n "$DEB_FILE" ]; then
    DEB_SIZE=$(du -h "$DEB_FILE" | cut -f1)
    echo "DEB package created: $DEB_FILE"
    echo "Size: $DEB_SIZE"
fi

if [ -n "$RPM_FILE" ]; then
    RPM_SIZE=$(du -h "$RPM_FILE" | cut -f1)
    echo "RPM package created: $RPM_FILE"
    echo "Size: $RPM_SIZE"
fi

if [ -z "$DEB_FILE" ] && [ -z "$RPM_FILE" ]; then
    echo "WARNING: Installer files not found in dist/installers/linux-x64/" >&2
fi

echo ""
echo "Done!"
