#!/bin/bash
# mac.sh shots|film <name> <page.html> [tool args...]
#   Runs railshots.mjs or railfilm.mjs on jared-mac's GPU (Apple M3, Metal; Jared's rule: rendering and browser review
#   runs and every film happen there, the VM takes no review media) and brings the results back to
#   ${RAILMAC_DEST:-$HOME/PM-Experiments/leftrail-redesign-20261002/review}/<name>/.
#   One run at a time: a machine-wide lock serialises every user of the Mac GPU. Scenes passed with --scene are
#   copied over. Media is review evidence only: delete it when finished.
#   Examples:
#     mac.sh shots all-themes build.html --concepts a,b,c --nier --expanded
#     mac.sh film a-tab build.html --scene scenes/tab.mjs --concept a --panel source --theme basic-dark
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
MODE=$1; NAME=$2; HTML=$3; shift 3
case "$NAME" in *[!A-Za-z0-9._-]*) echo "bad name: $NAME" >&2; exit 2;; esac
[ -f "$HTML" ] || { echo "no html: $HTML" >&2; exit 2; }
DEST=${RAILMAC_DEST:-$HOME/PM-Experiments/leftrail-redesign-20261002/review}/$NAME
mkdir -p "$DEST"
R="pm-motion-lab/rail/$NAME"
LOCK=/mnt/Cursor/PuppetMaster-Evidence/scratch/.macgpu.lock
exec 9>"$LOCK" 2>/dev/null || exec 9>"$HOME/.macgpu.lock"
flock -w 3600 9 || { echo "timed out waiting for the Mac GPU lock" >&2; exit 3; }
ssh -o BatchMode=yes -o ConnectTimeout=10 jared-mac "rm -rf ~/$R && mkdir -p ~/$R" || exit 4
scp -q "$HERE/railkit.mjs" "$HERE/railshots.mjs" "$HERE/railfilm.mjs" jared-mac:pm-motion-lab/ || exit 4
scp -q "$HTML" "jared-mac:$R/index.html" || exit 4
ARGS=""
while [ $# -gt 0 ]; do
  if [ "$1" = "--scene" ]; then scp -q "$2" "jared-mac:$R/scene.mjs" || exit 4; ARGS="$ARGS --scene rail/$NAME/scene.mjs"; shift 2; continue; fi
  ARGS="$ARGS $(printf '%q' "$1")"; shift
done
TOOL=railshots.mjs; [ "$MODE" = film ] && TOOL=railfilm.mjs
ssh -o BatchMode=yes jared-mac "export PATH=/opt/homebrew/bin:\$HOME/.cargo/bin:\$PATH; cd ~/pm-motion-lab && node $TOOL --html rail/$NAME/index.html --out rail/$NAME/out$ARGS 2>&1 | tail -20"
rc=$?
if [ "$MODE" = film ]; then
  for f in film.json sheet.png film.mp4; do scp -q "jared-mac:$R/out/$f" "$DEST/" 2>/dev/null; done
  scp -q "jared-mac:$R/out/film-slow*.mp4" "$DEST/" 2>/dev/null
  [ "${RAILMAC_FRAMES:-0}" = 1 ] && { mkdir -p "$DEST/frames"; scp -q "jared-mac:$R/out/f*.png" "$DEST/frames/" 2>/dev/null; }
else
  scp -q "jared-mac:$R/out/*.png" "$DEST/" 2>/dev/null
fi
ssh -o BatchMode=yes jared-mac "rm -rf ~/$R"
ls "$DEST" | head -50
exit $rc
