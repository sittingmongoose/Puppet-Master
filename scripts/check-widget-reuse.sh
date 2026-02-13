#!/usr/bin/env bash
set -u -o pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

warn_count=0

warn() {
  local message="$1"
  warn_count=$((warn_count + 1))
  echo "UI-DRY-WARN: $message"
}

is_suppressed() {
  local file="$1"
  local line="${2:-1}"

  mapfile -t marker_lines < <(rg -n "UI-DRY-EXCEPTION" "$file" | cut -d: -f1 || true)
  if [[ "${#marker_lines[@]}" -eq 0 ]]; then
    return 1
  fi

  for marker_line in "${marker_lines[@]}"; do
    # File-level suppression if marker is near top of file.
    if (( marker_line <= 5 )); then
      return 0
    fi

    # Line-level suppression if marker is adjacent to the warning line.
    if (( marker_line >= line - 1 && marker_line <= line + 1 )); then
      return 0
    fi
  done

  return 1
}

# Rule 1: Inline context-menu actions outside shared widgets.
while IFS=: read -r file line _; do
  [[ -z "${file:-}" ]] && continue
  if is_suppressed "$file" "$line"; then
    continue
  fi
  warn "Inline context-menu action usage outside shared widget at $file:$line"
done < <(
  rg -n "ContextMenuCopy|ContextMenuPaste|ContextMenuSelectAll|CloseContextMenu" puppet-master-rs/src \
    --glob '!**/widgets/context_menu.rs' \
    --glob '!**/widgets/selectable_text.rs' \
    --glob '!**/app.rs' || true
)

# Rule 2: Inline authenticated/not-authenticated badge text outside auth_status widget.
while IFS=: read -r file line _; do
  [[ -z "${file:-}" ]] && continue
  if is_suppressed "$file" "$line"; then
    continue
  fi
  warn "Inline auth badge text found outside auth_status widget at $file:$line"
done < <(
  rg -n 'text\("Authenticated"\)|text\("Not Authenticated"\)' puppet-master-rs/src \
    --glob '!**/widgets/auth_status.rs' || true
)

# Rule 3: Raw selectable field context menu wiring in views bypassing selectable_text_field.
while IFS=: read -r file line _; do
  [[ -z "${file:-}" ]] && continue
  if is_suppressed "$file" "$line"; then
    continue
  fi
  warn "Raw selectable field context menu wiring found in view at $file:$line"
done < <(
  rg -n 'OpenContextMenu\(ContextMenuTarget::SelectableField' puppet-master-rs/src/views || true
)

# Rule 4 (soft): Header helper adoption check for known header-heavy views.
header_views=(
  puppet-master-rs/src/views/login.rs
  puppet-master-rs/src/views/projects.rs
  puppet-master-rs/src/views/history.rs
  puppet-master-rs/src/views/metrics.rs
  puppet-master-rs/src/views/memory.rs
  puppet-master-rs/src/views/setup.rs
  puppet-master-rs/src/views/ledger.rs
  puppet-master-rs/src/views/evidence.rs
  puppet-master-rs/src/views/coverage.rs
)

for file in "${header_views[@]}"; do
  [[ ! -f "$file" ]] && continue
  if is_suppressed "$file" 1; then
    continue
  fi
  if ! rg -q "page_header\(" "$file"; then
    warn "Header helper not used in $file"
  fi
done

if [[ "$warn_count" -eq 0 ]]; then
  echo "UI-DRY-CHECK: no warnings"
else
  echo "UI-DRY-CHECK: $warn_count warning(s)"
  echo "UI-DRY-CHECK: add // UI-DRY-EXCEPTION: <reason> for justified bespoke implementations"
fi

exit 0
