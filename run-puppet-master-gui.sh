#!/usr/bin/env bash
# Run Puppet Master GUI from this project (no system install required).
# Starts the server and opens the app in your browser, or in the Tauri window if built.
# Usage: ./run-puppet-master-gui.sh
#        ./run-puppet-master-gui.sh --no-open   # start server only; open http://localhost:3847 yourself
# To add to app menu: ./run-puppet-master-gui.sh --install-desktop
# If the system freezes: run with PUPPET_MASTER_NO_OPEN=1 or --no-open to skip opening the browser.

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [ ! -f "dist/cli/index.js" ]; then
  echo "Building project..."
  npm run build
fi
if [ ! -d "src/gui/react/dist" ]; then
  echo "Building React GUI..."
  npm run gui:build
fi

if [ "${1:-}" = "--install-desktop" ]; then
  DESKTOP="$HOME/.local/share/applications/com.rwm.puppet-master-dev.desktop"
  mkdir -p "$(dirname "$DESKTOP")"
  cat > "$DESKTOP" << EOF
[Desktop Entry]
Type=Application
Name=Puppet Master
Comment=AI development orchestrator (run from project)
Exec=$ROOT/run-puppet-master-gui.sh --no-open
Terminal=true
Icon=$ROOT/installer/assets/puppet-master.png
Categories=Utility;Development;
Keywords=ai;development;orchestrator;
EOF
  echo "Installed desktop entry: $DESKTOP"
  echo "Find 'Puppet Master' in your application menu."
  echo "Launcher uses --no-open to avoid system load; open http://localhost:3847 in your browser after starting."
  exit 0
fi

if [ "${1:-}" = "--no-open" ]; then
  echo "Starting server only. Open http://localhost:3847 in your browser."
  echo "For LAN access: use --host 0.0.0.0 and --relaxed-cors (or GUI_CORS_RELAXED=true)"
  exec node dist/cli/index.js gui --no-open
fi

exec node dist/cli/index.js gui
