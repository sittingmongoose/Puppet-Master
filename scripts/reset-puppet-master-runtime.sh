#!/usr/bin/env bash
set -euo pipefail

# Reset per-user runtime state for Puppet Master (so installers/first-boot behave like a fresh install).
# This does NOT touch the repo checkout.
#
# Linux/macOS:
# - Removes ~/.puppet-master (logs, tokens, runtime state)
#
# Usage:
#   scripts/reset-puppet-master-runtime.sh

HOME_DIR="${HOME:-}"
if [[ -z "$HOME_DIR" ]]; then
  echo "HOME not set; refusing to run." >&2
  exit 2
fi

TARGET="${HOME_DIR}/.puppet-master"
if [[ -d "$TARGET" ]]; then
  echo "[reset] rm -rf $TARGET"
  rm -rf -- "$TARGET"
else
  echo "[reset] $TARGET does not exist"
fi

echo "[reset] done"

