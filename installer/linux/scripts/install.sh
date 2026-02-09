#!/bin/bash
# GUI-friendly installer for RWM Puppet Master .deb package.
# Double-click this script (or run from a terminal) to install.
# Uses pkexec (PolicyKit) for graphical privilege escalation.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# If launched by a file manager, we may not have a visible terminal and errors disappear.
# Re-run ourselves inside a terminal emulator so the user can see progress and failures.
if [ -z "${PM_INSTALL_SH_IN_TERMINAL:-}" ] && [ ! -t 1 ]; then
  export PM_INSTALL_SH_IN_TERMINAL=1
  if [ -n "${DISPLAY:-}" ] || [ -n "${WAYLAND_DISPLAY:-}" ]; then
    for term in x-terminal-emulator gnome-terminal konsole xfce4-terminal xterm mate-terminal lxterminal; do
      if command -v "$term" >/dev/null 2>&1; then
        case "$term" in
          gnome-terminal)
            exec "$term" -- bash -lc "\"$SCRIPT_DIR/install.sh\"; echo; echo 'Press Enter to close...'; read x"
            ;;
          konsole)
            exec "$term" --noclose -e bash -lc "\"$SCRIPT_DIR/install.sh\"; echo; echo 'Press Enter to close...'; read x"
            ;;
          xfce4-terminal)
            exec "$term" -e bash -lc "\"$SCRIPT_DIR/install.sh\"; echo; echo 'Press Enter to close...'; read x"
            ;;
          xterm)
            exec "$term" -hold -e bash -lc "\"$SCRIPT_DIR/install.sh\""
            ;;
          *)
            exec "$term" -e bash -lc "\"$SCRIPT_DIR/install.sh\"; echo; echo 'Press Enter to close...'; read x"
            ;;
        esac
      fi
    done
  fi
  # Fall back to continuing without a terminal.
fi

# Log install output so failures can be debugged even when launched from GUI.
LOG_DIR="${HOME:-/tmp}/.puppet-master/logs"
mkdir -p "$LOG_DIR" 2>/dev/null || true
LOG_FILE="$LOG_DIR/linux-install.log"
exec > >(tee -a "$LOG_FILE") 2>&1

# Find the .deb in the same directory as this script
DEB_FILE="$(find "$SCRIPT_DIR" -maxdepth 1 -name 'rwm-puppet-master*.deb' -print -quit 2>/dev/null)"

if [ -z "$DEB_FILE" ]; then
  # Try parent directory (CI zips may nest differently)
  DEB_FILE="$(find "$SCRIPT_DIR/.." -maxdepth 2 -name 'rwm-puppet-master*.deb' -print -quit 2>/dev/null)"
fi

if [ -z "$DEB_FILE" ]; then
  if command -v zenity >/dev/null 2>&1; then
    zenity --error --title="Puppet Master Installer" \
      --text="Could not find rwm-puppet-master .deb file.\nPlace this script in the same folder as the .deb." 2>/dev/null
  else
    echo "ERROR: Could not find rwm-puppet-master .deb file."
    echo "Place this script in the same folder as the .deb."
  fi
  exit 1
fi

echo "Installing: $DEB_FILE"

# Use pkexec (graphical sudo prompt) if available and we have a display,
# otherwise fall back to sudo.
if [ -n "$DISPLAY" ] || [ -n "$WAYLAND_DISPLAY" ]; then
  if command -v pkexec >/dev/null 2>&1; then
    pkexec dpkg -i "$DEB_FILE"
  elif command -v gksudo >/dev/null 2>&1; then
    gksudo -- dpkg -i "$DEB_FILE"
  else
    # Fall back to terminal sudo
    sudo dpkg -i "$DEB_FILE"
  fi
else
  sudo dpkg -i "$DEB_FILE"
fi

# If dpkg reports missing dependencies, best-effort fix and retry.
# This is common on minimal distros where dpkg doesn't auto-resolve deps.
if command -v apt-get >/dev/null 2>&1; then
  if ! dpkg -s puppet-master >/dev/null 2>&1; then
    echo "Attempting to fix dependencies (apt-get -f install)..."
    sudo apt-get update -y || true
    sudo apt-get -f install -y || true
    sudo dpkg -i "$DEB_FILE" || true
  fi
fi

# Show success notification
if command -v notify-send >/dev/null 2>&1; then
  notify-send "Puppet Master" "Installation complete! Find 'Puppet Master' in your application menu." \
    -i /opt/puppet-master/puppet-master.png 2>/dev/null || true
fi

echo ""
echo "Puppet Master installed successfully!"
echo "Find 'Puppet Master' in your application menu, or run: puppet-master-gui"
echo ""
echo "Install log: $LOG_FILE"

# Best-effort: launch the GUI after install when a user session is present.
# This script runs as the user (pkexec/sudo is only used for dpkg), so launching
# here is much more reliable than attempting from dpkg postinstall (root context).
if [ -n "${DISPLAY:-}" ] || [ -n "${WAYLAND_DISPLAY:-}" ]; then
  if command -v puppet-master-gui >/dev/null 2>&1; then
    ( nohup puppet-master-gui >/dev/null 2>&1 & ) || true
  elif command -v puppet-master >/dev/null 2>&1; then
    ( nohup puppet-master gui >/dev/null 2>&1 & ) || true
  fi
fi
