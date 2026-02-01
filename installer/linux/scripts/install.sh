#!/bin/bash
# GUI-friendly installer for RWM Puppet Master .deb package.
# Double-click this script (or run from a terminal) to install.
# Uses pkexec (PolicyKit) for graphical privilege escalation.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

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

# Show success notification
if command -v notify-send >/dev/null 2>&1; then
  notify-send "Puppet Master" "Installation complete! Find 'Puppet Master' in your application menu." \
    -i /opt/puppet-master/puppet-master.png 2>/dev/null || true
fi

echo ""
echo "Puppet Master installed successfully!"
echo "Find 'Puppet Master' in your application menu, or run: puppet-master gui"
echo ""
