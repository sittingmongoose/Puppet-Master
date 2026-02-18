#!/bin/bash
# Wrapper for the canonical Linux installer build script.
set -euo pipefail

BASE_VERSION="${1:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

chmod +x ./build-linux-installer.sh
exec ./build-linux-installer.sh ${BASE_VERSION:+"$BASE_VERSION"}
