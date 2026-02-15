#!/usr/bin/env bash
set -euo pipefail

# DRY:FN:legacy_surface_gate - Guard executable/config surfaces from legacy TS/Tauri references.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

LEGACY_PATTERN='src-tauri|src/gui/react|src/gui/start-gui\.ts|tauri:dev|tauri:build|build:[^"[:space:]]*:tauri'
SCAN_PATHS=(
  ".github/workflows"
  "scripts"
  "build-all-installers.sh"
  "build-installer-linux.sh"
  "build-installer-macos.command"
  "build-installer-windows.bat"
  "run-puppet-master-gui.sh"
  "verify-tauri-setup.sh"
  "package.json"
)

EXISTING_PATHS=()
for path in "${SCAN_PATHS[@]}"; do
  if [ -e "$path" ]; then
    EXISTING_PATHS+=("$path")
  fi
done

if [ "${#EXISTING_PATHS[@]}" -eq 0 ]; then
  echo "No executable/config surfaces found to scan."
  exit 0
fi

if command -v rg >/dev/null 2>&1; then
  if rg -n --glob '!scripts/check-no-legacy-paths.sh' "$LEGACY_PATTERN" "${EXISTING_PATHS[@]}"; then
    echo ""
    echo "Legacy path references detected in executable/config surfaces."
    exit 1
  fi
else
  if grep -R -n -E "$LEGACY_PATTERN" "${EXISTING_PATHS[@]}" --exclude='check-no-legacy-paths.sh'; then
    echo ""
    echo "Legacy path references detected in executable/config surfaces."
    exit 1
  fi
fi

echo "No legacy TS/Tauri path references detected in executable/config surfaces."
