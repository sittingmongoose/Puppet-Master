#!/usr/bin/env bash
# Builds the refined page: PMConcept7's own sources at the commit named in ../BASE, with the files under ../overlay/
# laid over Concepts/ (overlay/onboarding/opus-5.5/src/settings/... is the Settings layer, overlay/home-redesign/... the
# Home layer that owns the Customize screens), through PMConcept7's own build (build.py --out). Nothing of PMConcept7 in
# the repository is touched: the build runs in a scratch copy.
#   tools/build.sh [out.html]          default out: ~/.cache/smx-refine/serve/refined.html
# Environment: SMX_TREE (scratch copy, default ~/.cache/smx-refine/tree).
set -euo pipefail
HERE=$(cd "$(dirname "$0")/.." && pwd)
REPO=$(git -C "$HERE" rev-parse --show-toplevel)
BASE=$(tr -d ' \n' < "$HERE/BASE")
TREE=${SMX_TREE:-$HOME/.cache/smx-refine/tree}
OUT=${1:-$HOME/.cache/smx-refine/serve/refined.html}
PKG=Concepts/onboarding/opus-5.5
# Folders PMConcept7's build reads (found by building until nothing was missing).
NEEDS=(Concepts/onboarding Concepts/usage-redesign Concepts/leftrail-redesign Concepts/glyph-system Concepts/home-redesign
	"Concepts/chat-assistant-concepts/5.6 Pro" Concepts/liquid-glass Concepts/pm7-tools Concepts/wallpapers
	Concepts/notifications Concepts/background-activity Concepts/motion-wave Concepts/projects-redesign
	Plans/settings_inventory.json)
mkdir -p "$TREE" "$(dirname "$OUT")"
# Start from PMConcept7's own files every time, so a file no longer in the overlay is the original again.
if [ "$(cat "$TREE/.base" 2>/dev/null || true)" != "$BASE" ]; then
	find "${TREE:?}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
	git -C "$REPO" archive --format=tar "$BASE" "${NEEDS[@]}" | tar -x -C "$TREE"
	echo "$BASE" > "$TREE/.base"
else
	( cd "$HERE/overlay" && find . -type f -printf '%P\n' ) > "$TREE/.overlaid.new"
	cat "$TREE/.overlaid" "$TREE/.overlaid.new" 2>/dev/null | sort -u | while IFS= read -r f; do
		[ -n "$f" ] || continue
		if git -C "$REPO" cat-file -e "$BASE:Concepts/$f" 2>/dev/null; then git -C "$REPO" show "$BASE:Concepts/$f" > "$TREE/Concepts/$f"; else rm -f "$TREE/Concepts/$f"; fi
	done
fi
( cd "$HERE/overlay" && find . -type f -printf '%P\n' ) > "$TREE/.overlaid"
cp -a "$HERE/overlay/." "$TREE/Concepts/"
( cd "$TREE" && python3 "$PKG/tools/build.py" --out "$OUT" ) 2>&1 | tail -${SMX_TAIL:-6}
