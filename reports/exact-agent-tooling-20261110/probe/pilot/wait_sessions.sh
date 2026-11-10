#!/bin/bash
# usage: wait_sessions.sh <max seconds> <session>...   exits 0 when every session's last message has a VERDICT line
HERE=$(cd "$(dirname "$0")" && pwd); MAX=$1; shift; START=$(date +%s)
while :; do
  left=0; for s in "$@"; do python3 "$HERE/measure.py" "$s" | grep -q '"stated_verdict": "' || left=$((left+1)); done
  [ $left -eq 0 ] && { echo "all done: $*"; exit 0; }
  [ $(( $(date +%s) - START )) -ge "$MAX" ] && { echo "time limit; not finished: $left of $#"; exit 3; }
  sleep 15
done
