#!/usr/bin/env bash
set -euo pipefail

# Uninstall Puppet Master from macOS and remove common leftovers.
# Intended for installer smoke tests (fresh install each run).
#
# Usage:
#   scripts/os-clean/macos-uninstall-puppet-master.sh

echo "[macos-uninstall] starting"

APP="/Applications/Puppet Master.app"
if [[ -d "$APP" ]]; then
  echo "[macos-uninstall] removing $APP"
  sudo rm -rf -- "$APP" || true
fi

# Legacy locations from earlier installers
sudo rm -f /usr/local/bin/puppet-master /usr/local/bin/puppet-master-gui || true
sudo rm -rf /usr/local/lib/puppet-master || true

echo "[macos-uninstall] removing per-user runtime state (~/.puppet-master)"
if [[ -n "${HOME:-}" ]]; then
  rm -rf -- "${HOME}/.puppet-master" || true
fi

# Best-effort: Tauri/WebView storage locations (may vary; ignore errors)
if [[ -n "${HOME:-}" ]]; then
  rm -rf -- "${HOME}/Library/Application Support/com.rwm.puppet-master" 2>/dev/null || true
  rm -rf -- "${HOME}/Library/Logs/com.rwm.puppet-master" 2>/dev/null || true
  rm -rf -- "${HOME}/Library/Caches/com.rwm.puppet-master" 2>/dev/null || true
fi

echo "[macos-uninstall] done"

