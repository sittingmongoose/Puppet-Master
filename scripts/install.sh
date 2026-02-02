#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required (>= 18). Install from https://nodejs.org/ and re-run."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required. Install Node.js (which includes npm) and re-run."
  exit 1
fi

echo "Installing dependencies..."
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "Building..."
npm run build

echo "Installing puppet-master globally..."
if npm install -g .; then
  echo "OK: Installed. Try: puppet-master --version"
else
  cat <<'EOF'

Global install failed.

Common fixes:
- Configure an npm global prefix you own, then re-run this script:
    npm config set prefix "$HOME/.npm-global"
    export PATH="$HOME/.npm-global/bin:$PATH"
- Or run without installing globally:
    node ./dist/cli/index.js --help

EOF
  exit 1
fi

