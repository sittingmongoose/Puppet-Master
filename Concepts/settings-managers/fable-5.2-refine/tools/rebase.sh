#!/usr/bin/env bash
# Moves the overlay onto a newer commit of PMConcept7's sources.
#   tools/rebase.sh <new base commit>        (fetch first; the commit must be in this repository)
#   DRY=1 tools/rebase.sh <commit>           only says what would merge or conflict; writes nothing
# For every file under overlay/ that PMConcept7 also has at the old BASE, the change PMConcept7 made between the old
# and the new base is merged into the overlay's copy (git merge-file, three-way). A file that merges cleanly is
# replaced; one with a conflict is left as it was and the merged text with conflict marks is written beside it as
# <file>.CONFLICT for a person to settle. Files only the overlay has (the added ones) are not touched. BASE is
# rewritten only when nothing conflicted.
set -euo pipefail
HERE=$(cd "$(dirname "$0")/.." && pwd)
REPO=$(git -C "$HERE" rev-parse --show-toplevel)
OLD=$(tr -d ' \n' < "$HERE/BASE"); NEW=$(git -C "$REPO" rev-parse --short=10 "$1")
TMP=$(mktemp -d "${TMPDIR:-$HOME/.cache}/smx-rebase.XXXXXX"); trap 'rm -rf "$TMP"' EXIT
conflicts=0; merged=0; same=0; added=0; gone=0
while IFS= read -r f; do
	if ! git -C "$REPO" cat-file -e "$OLD:Concepts/$f" 2>/dev/null; then added=$((added + 1)); continue; fi
	git -C "$REPO" show "$OLD:Concepts/$f" > "$TMP/old"
	if ! git -C "$REPO" cat-file -e "$NEW:Concepts/$f" 2>/dev/null; then echo "GONE at $NEW: $f (PMConcept7 no longer has it; the overlay's copy stays and is now an added file)"; gone=$((gone + 1)); continue; fi
	git -C "$REPO" show "$NEW:Concepts/$f" > "$TMP/new"
	if cmp -s "$TMP/old" "$TMP/new"; then same=$((same + 1)); continue; fi
	cp "$HERE/overlay/$f" "$TMP/mine"
	if git merge-file -p -L overlay -L "base $OLD" -L "base $NEW" "$TMP/mine" "$TMP/old" "$TMP/new" > "$TMP/out"; then
		[ -n "${DRY:-}" ] || cp "$TMP/out" "$HERE/overlay/$f"; merged=$((merged + 1)); echo "merged: $f"
	else
		[ -n "${DRY:-}" ] || cp "$TMP/out" "$HERE/overlay/$f.CONFLICT"; conflicts=$((conflicts + 1)); echo "CONFLICT: $f ($(grep -c '^<<<<<<< ' "$TMP/out") places)"
	fi
done < <(cd "$HERE/overlay" && find . -type f ! -name '*.CONFLICT' -printf '%P\n' | sort)
echo "unchanged upstream $same, merged $merged, conflicts $conflicts, added by the overlay $added, gone upstream $gone"
if [ -n "${DRY:-}" ]; then echo "dry run: nothing written"; exit 0; fi
if [ "$conflicts" -eq 0 ]; then echo "$NEW" > "$HERE/BASE"; echo "BASE is now $NEW"; else echo "BASE stays $OLD until the conflicts are settled"; exit 1; fi
