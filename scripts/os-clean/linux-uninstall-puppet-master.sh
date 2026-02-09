#!/usr/bin/env bash
set -euo pipefail

# Uninstall Puppet Master from a Linux machine and remove common leftovers.
# Intended for installer smoke tests (fresh install each run).
#
# Usage:
#   scripts/os-clean/linux-uninstall-puppet-master.sh

echo "[linux-uninstall] starting"

if command -v dpkg >/dev/null 2>&1; then
  if dpkg -s puppet-master >/dev/null 2>&1; then
    echo "[linux-uninstall] removing dpkg package puppet-master"
    sudo dpkg -r puppet-master || true
    sudo dpkg -P puppet-master || true
  fi
fi

if command -v rpm >/dev/null 2>&1; then
  if rpm -q puppet-master >/dev/null 2>&1; then
    echo "[linux-uninstall] removing rpm package puppet-master"
    sudo rpm -e puppet-master || true
  fi
fi

echo "[linux-uninstall] removing common file leftovers"
sudo rm -rf /opt/puppet-master || true
sudo rm -f /usr/bin/puppet-master /usr/bin/puppet-master-gui || true
sudo rm -f /usr/local/bin/puppet-master /usr/local/bin/puppet-master-gui || true
sudo rm -f /usr/share/applications/com.rwm.puppet-master.desktop || true
sudo rm -f /etc/xdg/autostart/puppet-master-gui.desktop || true

echo "[linux-uninstall] removing per-user runtime state (~/.puppet-master)"
if [[ -n "${HOME:-}" ]]; then
  rm -rf -- "${HOME}/.puppet-master" || true
fi

echo "[linux-uninstall] done"

