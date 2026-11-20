#!/usr/bin/env bash
# Copies one of PMConcept7's source files (as it is at ../BASE) into ../overlay/, ready to be changed.
#   tools/take.sh src/settings/managers/50-servers.js      (path under Concepts/onboarding/opus-5.5/)
set -euo pipefail
HERE=$(cd "$(dirname "$0")/.." && pwd)
REPO=$(git -C "$HERE" rev-parse --show-toplevel)
BASE=$(tr -d ' \n' < "$HERE/BASE")
for f in "$@"; do
	if [ -e "$HERE/overlay/$f" ]; then echo "already taken: $f"; continue; fi
	mkdir -p "$(dirname "$HERE/overlay/$f")"
	git -C "$REPO" show "$BASE:Concepts/onboarding/opus-5.5/$f" > "$HERE/overlay/$f"
	echo "taken: $f"
done
