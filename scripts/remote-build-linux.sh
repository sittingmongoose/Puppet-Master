#!/usr/bin/env bash
# Run on Linux host to replicate CI: prereqs (optional), npm ci, build, gui:build, build:linux:tauri, cleanup.
# Usage: from repo root, ./scripts/remote-build-linux.sh
# Or: bash -s < scripts/remote-build-linux.sh (when piped, REPO_ROOT may need to be set)

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO_ROOT"
RESULT_FILE="${RESULT_FILE:-$REPO_ROOT/BUILD_RESULT.txt}"

echo "=== Remote Linux build (Tauri) ==="
echo "REPO_ROOT=$REPO_ROOT"

# Optional: ensure Rust in PATH
if ! command -v cargo &>/dev/null; then
  export PATH="${HOME:-/tmp}/.cargo/bin:$PATH"
fi
if ! command -v cargo &>/dev/null; then
  echo "ERROR: cargo not found. Install Rust: https://rustup.rs" >&2
  echo "FAIL" > "$RESULT_FILE"
  exit 1
fi

# Optional: install Tauri deps if missing (requires sudo; use SUDO_PASS if set)
if ! pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
  echo "Installing Tauri system dependencies (sudo)..."
  run_apt() {
    if [ -n "${SUDO_PASS:-}" ]; then
      echo "$SUDO_PASS" | sudo -S apt-get update -qq && echo "$SUDO_PASS" | sudo -S apt-get install -y \
        libwebkit2gtk-4.1-dev build-essential pkg-config libssl-dev libgtk-3-dev \
        libxdo-dev libayatana-appindicator3-dev librsvg2-dev patchelf
    else
      sudo -n apt-get update -qq 2>/dev/null && sudo -n apt-get install -y \
        libwebkit2gtk-4.1-dev build-essential pkg-config libssl-dev libgtk-3-dev \
        libxdo-dev libayatana-appindicator3-dev librsvg2-dev patchelf 2>/dev/null
    fi
  }
  run_apt || echo "WARN: Could not install apt deps (set SUDO_PASS or run manually)"
fi
if ! command -v nfpm &>/dev/null && command -v go &>/dev/null; then
  echo "Installing nfpm..."
  go install github.com/goreleaser/nfpm/v2/cmd/nfpm@latest
  export PATH="$(go env GOPATH)/bin:$PATH"
fi

export npm_config_update_notifier=false

echo "npm ci..."
npm ci
echo "GUI deps..."
npm --prefix src/gui/react ci
echo "TypeScript build..."
npm run build
echo "GUI build..."
npm run gui:build
echo "Linux Tauri installer..."
npm run build:linux:tauri

# Cleanup per check command
rm -rf .test-cache .test-quota .test-quota-* 2>/dev/null || true

# Verify artifacts
DEB=$(find dist/installers/linux-x64 -name "*.deb" 2>/dev/null | head -n1)
RPM=$(find dist/installers/linux-x64 -name "*.rpm" 2>/dev/null | head -n1)
if [ -n "$DEB" ] || [ -n "$RPM" ]; then
  echo "PASS" > "$RESULT_FILE"
  echo "Artifacts: $DEB $RPM"
else
  echo "FAIL" > "$RESULT_FILE"
  echo "No .deb/.rpm in dist/installers/linux-x64" >&2
  exit 1
fi
echo "Done."
