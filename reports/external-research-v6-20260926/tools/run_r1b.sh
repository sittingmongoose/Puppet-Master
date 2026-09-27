#!/bin/bash
# Continuation after the v1 host fault: serial, same frozen inputs, no retries of any model call.
cd /home/sittingmongoose/PM-Experiments/external-research-v6-20260926
while kill -0 120981 2>/dev/null; do sleep 5; done
echo "{\"z_candidate_v1_process_exited_utc\": \"$(date -u +%FT%TZ)\"}"
for s in M-candidate:muse Z-candidate:zcode; do
  slot=${s%%:*}; app=${s##*:}
  if [ -f runs/$slot/frozen/stage1/observations.md ] || [ -d runs/$slot/frozen/stage1 ]; then
    if [ ! -f runs/$slot/arm-receipt.json ]; then
      echo "{\"slot\": \"$slot\", \"resume_stage2_dispatch_utc\": \"$(date -u +%FT%TZ)\"}"
      python3 tools/run_arm.py --slot $slot --app $app --variant candidate --resume-stage2
    fi
  fi
done
python3 tools/run_r1.py Z-control
