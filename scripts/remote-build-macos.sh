#!/usr/bin/env bash
# Run on macOS host to replicate CI: npm ci, build, gui:build, build:mac:tauri, cleanup.
# Usage: from repo root, ./scripts/remote-build-macos.sh

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO_ROOT"
RESULT_FILE="${RESULT_FILE:-$REPO_ROOT/BUILD_RESULT.txt}"

echo "=== Remote macOS build (Tauri) ==="
echo "REPO_ROOT=$REPO_ROOT"

# Ensure Node/npm in PATH (SSH non-interactive often has minimal PATH)
for d in "$HOME/.nvm/versions/node/*/bin" /usr/local/bin /opt/homebrew/bin "$HOME/.cargo/bin" "/Users/$(whoami)/.cargo/bin"; do
  for _d in $d; do
    [ -d "$_d" ] && export PATH="$_d:$PATH"
  done
done
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" 2>/dev/null || true
if ! command -v npm &>/dev/null; then
  echo "ERROR: npm not found. Install Node 20 (nvm or nodejs.org)." >&2
  echo "FAIL" > "$RESULT_FILE"
  exit 1
fi
# Ensure Rust in PATH; install via rustup if missing
if ! command -v cargo &>/dev/null; then
  echo "Installing Rust (rustup)..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
  export PATH="${HOME}/.cargo/bin:$PATH"
fi
if ! command -v cargo &>/dev/null; then
  echo "ERROR: cargo not found after install. Install Rust: https://rustup.rs" >&2
  echo "FAIL" > "$RESULT_FILE"
  exit 1
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
echo "macOS Tauri installer..."
npm run build:mac:tauri

# Cleanup per check command
rm -rf .test-cache .test-quota .test-quota-* 2>/dev/null || true

# Verify artifacts
DMG=$(find dist/installers/darwin-arm64 -name "*.dmg" 2>/dev/null | head -n1)
if [ -n "$DMG" ]; then
  echo "PASS" > "$RESULT_FILE"
  echo "Artifact: $DMG"
else
  echo "FAIL" > "$RESULT_FILE"
  echo "No .dmg in dist/installers/darwin-arm64" >&2
  exit 1
fi
echo "Done."
