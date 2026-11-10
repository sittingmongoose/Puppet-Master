#!/bin/bash
# usage: make_session.sh <task 1..4> <arm A|B> <given variant>   -> sessions/T<task><arm>/
set -eu; HERE=$(cd "$(dirname "$0")" && pwd); T=$1; ARM=$2; V=$3; D=$HERE/sessions/T$T$ARM
mkdir -p "$D/kit" "$D/checks" "$D/scratch"
cp "$HERE/fixtures/v$V.html" "$D/page.html"; cp "$HERE/fixtures/v$V.json" "$D/page.json"
cp "$HERE/kit/pilotkit.mjs" "$D/kit/"
if [ "$ARM" = B ]; then cp "$HERE/kit/idkit.mjs" "$D/kit/"; mkdir -p "$D/tools"; cp "$HERE/kit/tools/list.check.mjs" "$D/tools/"; fi
sed "s#'./pilotkit.mjs'#'./kit/pilotkit.mjs'#; s#'./idkit.mjs'#'./kit/idkit.mjs'#" "$HERE/kit/config-$ARM.mjs" > "$D/browser-check.config.mjs"
cp "$HERE/kit/KIT-$ARM.md" "$D/KIT.md"
cat "$HERE/tasks/common-head.md" "$HERE/tasks/T$T.md" "$HERE/tasks/common-tail.md" > "$D/TASK.md"
echo "$D"
