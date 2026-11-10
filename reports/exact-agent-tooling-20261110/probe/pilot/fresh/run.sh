#!/bin/bash
# Freshness correctness, no agent involved. usage: fresh/run.sh <good.html> <other.html> <workdir>
set -u; GOOD=$1; OTHER=$2; W=$3; HERE=$(cd "$(dirname "$0")" && pwd); mkdir -p "$W"
one() { # name, expected exit, page, extra args...
  local name=$1 want=$2 page=$3; shift 3
  local out; out=$(browser-check run "$HERE/f.check.mjs" --set page="$page" --set receipt="$W/$name.receipt.json" --out "$W/run-$name" "$@" 2>&1); local got=$?
  local fresh; fresh=$(python3 -c "import json;print(json.load(open('$W/$name.receipt.json'))['fresh'])" 2>/dev/null)
  local why; why=$(echo "$out" | grep -m1 -E "^FAIL" | sed -E 's/^FAIL [^›]*› [^›]*› //' | cut -c1-150)
  printf '%s\texpected_exit=%s\tgot_exit=%s\treceipt_fresh=%s\t%s\t%s\n' "$name" "$want" "$got" "$fresh" "$([ "$got" = "$want" ] && echo OK || echo WRONG)" "$why"
}
cp "$GOOD" "$W/p1.html"; cp "${GOOD%.html}.json" "$W/p1.json"
one 1-right-build 0 "$W/p1.html" --set case=plain
cp "$OTHER" "$W/p2.html"; cp "${GOOD%.html}.json" "$W/p2.json"          # the record says one build, the file is another
one 2-wrong-build-at-start 1 "$W/p2.html" --set case=plain
cp "$GOOD" "$W/p3.html"; cp "${GOOD%.html}.json" "$W/p3.json"
one 3-replaced-then-reload 1 "$W/p3.html" --set case=replaced-then-reload --set other="$OTHER"
cp "$GOOD" "$W/p4.html"; cp "${GOOD%.html}.json" "$W/p4.json"
one 4-raw-navigation-to-another-build 1 "$W/p4.html" --set case=other-copy-raw-goto --set other="$OTHER"
