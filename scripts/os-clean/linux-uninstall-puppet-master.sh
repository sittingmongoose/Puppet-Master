#!/usr/bin/env bash
set -euo pipefail

# Uninstall RWM Puppet Master from a Linux machine and remove common leftovers.
# Intended for installer smoke tests (fresh install each run).
#
# Usage:
#   scripts/os-clean/linux-uninstall-puppet-master.sh
#   scripts/os-clean/linux-uninstall-puppet-master.sh --dry-run

DRY_RUN=false
PROTECTED_CLIS=(agent codex claude gemini copilot gh node)

usage() {
  cat <<'EOF'
Usage: scripts/os-clean/linux-uninstall-puppet-master.sh [--dry-run|-n]
Removes RWM Puppet Master install/runtime artifacts.
EOF
}

while (($#)); do
  case "$1" in
    --dry-run|-n)
      DRY_RUN=true
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "[linux-uninstall] unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

log() {
  echo "[linux-uninstall] $*"
}

is_protected_cli_target() {
  local target="${1:-}"
  local base=""
  base="$(basename -- "$target" 2>/dev/null || true)"
  for cli in "${PROTECTED_CLIS[@]}"; do
    if [[ "$base" == "$cli" || "$base" == "$cli.exe" || "$base" == "$cli.cmd" || "$base" == "$cli.bat" ]]; then
      return 0
    fi
  done
  return 1
}

run_best_effort() {
  if $DRY_RUN; then
    log "[dry-run] $*"
  else
    "$@" || true
  fi
}

run_best_effort_root() {
  if $DRY_RUN; then
    log "[dry-run] sudo $*"
  else
    sudo "$@" || true
  fi
}

safe_remove_root_file() {
  local target="${1:-}"
  [[ -z "$target" || "$target" == "/" ]] && return 0
  if is_protected_cli_target "$target"; then
    log "skipping protected CLI target: $target"
    return 0
  fi
  run_best_effort_root rm -f -- "$target"
}

safe_remove_root_dir() {
  local target="${1:-}"
  [[ -z "$target" || "$target" == "/" ]] && return 0
  if is_protected_cli_target "$target"; then
    log "skipping protected CLI target: $target"
    return 0
  fi
  run_best_effort_root rm -rf -- "$target"
}

safe_remove_user_dir() {
  local target="${1:-}"
  [[ -z "$target" || "$target" == "/" ]] && return 0
  if is_protected_cli_target "$target"; then
    log "skipping protected CLI target: $target"
    return 0
  fi
  run_best_effort rm -rf -- "$target"
}

is_legacy_rwm_dpkg_package() {
  local pkg="${1:-}"
  # Guard against removing Puppetlabs' puppet-master package by mistake.
  dpkg -L "$pkg" 2>/dev/null | grep -Eq '/opt/puppet-master|/usr/bin/puppet-master-gui|com\.rwm\.puppet-master\.desktop'
}

is_legacy_rwm_rpm_package() {
  local pkg="${1:-}"
  # Guard against removing Puppetlabs' puppet-master package by mistake.
  rpm -ql "$pkg" 2>/dev/null | grep -Eq '/opt/puppet-master|/usr/bin/puppet-master-gui|com\.rwm\.puppet-master\.desktop'
}

log "starting"

if command -v dpkg >/dev/null 2>&1; then
  # Current package name is rwm-puppet-master; puppet-master is legacy.
  for pkg in rwm-puppet-master puppet-master; do
    if dpkg -s "$pkg" >/dev/null 2>&1; then
      if [[ "$pkg" == "puppet-master" ]] && ! is_legacy_rwm_dpkg_package "$pkg"; then
        log "skipping dpkg package puppet-master (not a legacy RWM build)"
        continue
      fi
      log "removing dpkg package $pkg"
      run_best_effort_root dpkg -r "$pkg"
      run_best_effort_root dpkg -P "$pkg"
    fi
  done
fi

if command -v rpm >/dev/null 2>&1; then
  # Keep legacy name for older test images.
  for pkg in rwm-puppet-master puppet-master; do
    if rpm -q "$pkg" >/dev/null 2>&1; then
      if [[ "$pkg" == "puppet-master" ]] && ! is_legacy_rwm_rpm_package "$pkg"; then
        log "skipping rpm package puppet-master (not a legacy RWM build)"
        continue
      fi
      log "removing rpm package $pkg"
      run_best_effort_root rpm -e "$pkg"
    fi
  done
fi

log "removing common file leftovers"
safe_remove_root_dir /opt/puppet-master
safe_remove_root_file /usr/bin/puppet-master
safe_remove_root_file /usr/bin/puppet-master-gui
safe_remove_root_file /usr/local/bin/puppet-master
safe_remove_root_file /usr/local/bin/puppet-master-gui
safe_remove_root_file /usr/share/applications/com.rwm.puppet-master.desktop
safe_remove_root_file /etc/xdg/autostart/puppet-master-gui.desktop
safe_remove_root_file /usr/lib/systemd/system/puppet-master-gui.service

# Runtime paths evolved across releases; clear both current and legacy folders.
log "removing per-user runtime state"
if [[ -n "${HOME:-}" ]]; then
  safe_remove_user_dir "${HOME}/.puppet-master"
  safe_remove_user_dir "${HOME}/.rwm-puppet-master"
  safe_remove_user_dir "${HOME}/.local/share/rwm-puppet-master"
  safe_remove_user_dir "${HOME}/.local/share/RWM Puppet Master"
fi

log "done"
