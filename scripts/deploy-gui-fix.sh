#!/usr/bin/env bash
# Deploy gui command fix (stream write wrapper) to an installed Puppet Master.
# Usage:
#   sudo ./scripts/deploy-gui-fix.sh                    # deploy to /opt/puppet-master
#   DEST=/path/to/install sudo ./scripts/deploy-gui-fix.sh  # deploy to custom path
# If there is no install at /opt, the script exits and tells you to run from the project instead.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INSTALL_ROOT="${DEST:-/opt/puppet-master}"
DEST_DIR="$INSTALL_ROOT/app/dist/cli/commands"

cd "$PROJECT_ROOT"
if [ ! -f "dist/cli/commands/gui.js" ]; then
  echo "Building first..."
  npm run build
fi

if [ ! -d "$INSTALL_ROOT" ]; then
  echo "No Puppet Master install at $INSTALL_ROOT."
  echo "Run the GUI from this project instead (fix is already in dist/):"
  echo "  node dist/cli/index.js gui"
  echo "  or: npm run gui"
  exit 1
fi

echo "Creating $DEST_DIR if needed..."
mkdir -p "$DEST_DIR"
echo "Copying gui.js and gui.js.map..."
cp -f dist/cli/commands/gui.js dist/cli/commands/gui.js.map "$DEST_DIR/"
echo "Done. Restart puppet-master-gui to use the fix."
