#!/usr/bin/env bash
set -euo pipefail

# Uninstall Puppet Master from macOS and remove common leftovers.
# Intended for installer smoke tests (fresh install each run).
#
# Usage:
#   scripts/os-clean/macos-uninstall-puppet-master.sh
#   scripts/os-clean/macos-uninstall-puppet-master.sh --dry-run

DRY_RUN=false
PROTECTED_CLIS=(agent codex claude gemini copilot gh node)

usage() {
  cat <<'EOF'
Usage: scripts/os-clean/macos-uninstall-puppet-master.sh [--dry-run|-n]
Removes Puppet Master install/runtime artifacts.
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
      echo "[macos-uninstall] unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

log() {
  echo "[macos-uninstall] $*"
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

log "starting"

for app in "/Applications/Puppet Master.app"; do
  if [[ -d "$app" ]]; then
    log "removing $app"
    safe_remove_root_dir "$app"
  fi
done

# Legacy locations from earlier installers
safe_remove_root_file /usr/local/bin/puppet-master
safe_remove_root_file /usr/local/bin/puppet-master-gui
safe_remove_root_dir /usr/local/lib/puppet-master

# Runtime folders vary between older and current releases.
log "removing per-user runtime state"
if [[ -n "${HOME:-}" ]]; then
  safe_remove_user_dir "${HOME}/.puppet-master"

  # Remove autostart/LaunchAgent entries
  run_best_effort rm -f "${HOME}/Library/LaunchAgents/com.puppetmaster.puppet-master.plist"
fi

# Best-effort: app support/log/cache locations changed over time.
if [[ -n "${HOME:-}" ]]; then
  safe_remove_user_dir "${HOME}/Library/Application Support/com.puppetmaster.Puppet-Master"
  safe_remove_user_dir "${HOME}/Library/Logs/com.puppetmaster.Puppet-Master"
  safe_remove_user_dir "${HOME}/Library/Caches/com.puppetmaster.Puppet-Master"
fi

log "done"
