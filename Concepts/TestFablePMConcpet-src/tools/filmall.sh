#!/bin/bash
cd /tmp/claude-1000/-mnt-Cursor-PuppetMaster/d7669431-db5f-4e67-971e-eaa48560a4bd/scratchpad
for t in friendly-light friendly-dark glass-light glass-dark retro-light retro-dark basic-light basic-dark; do
  for sc in ob-open ob-where-begin ob-commit ob-done-tour; do
    SLOW=4 CROP=1120:720:160:90 timeout 400 node film.mjs $sc $t 2>&1 | grep -E "frames|rror" | sed "s/^/$t $sc: /"
    mv film/${sc}_sheet.png film/all_${sc}_${t}.png 2>/dev/null
  done
done
echo FILMALL-DONE
