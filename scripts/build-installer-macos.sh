#!/bin/bash
# Wrapper for the canonical macOS DMG build script.
set -euo pipefail

BASE_VERSION="${1:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -z "${BASE_VERSION}" ]; then
  BASE_VERSION="$(grep '^version' "$REPO_ROOT/puppet-master-rs/Cargo.toml" | head -1 | cut -d'"' -f2)"
fi

cd "$REPO_ROOT/installer/macos"
chmod +x ./build-dmg.sh
exec ./build-dmg.sh "$BASE_VERSION"
