# Rollout record: the 5.6 Pro chat (pm7-glyphs, D44/GLY-1)

Status: DONE on concept/pm7-glyphs-20261010 (fb58ba2e7c); lands with the rollout in chain order after pm7-no-pills.
The planner assigned this step to pm7-glyphs (c56 is finished and idle); c56-chat-orchestrator was told.

## Change

`Concepts/chat-assistant-concepts/5.6 Pro/neon-icons.js` `st-failed`: the warning triangle becomes a ring with a cross
(Jared's GLY-1: the triangle is warning's alone). The standalone and `index.html` were rebuilt with the chat's own
`build.py` (never hand-edited). PMG no longer redraws it; `src/registry/10-status.js` records what it replaces.

## Gates

- The chat's own `neon-verify.mjs`, on the P1000 GPU (Quadro P1000), all ten looks: **145 PASS, 0 FAIL, 0 SKIP**,
  zero page errors. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glyphs-20261010/chat-step/verify.json` and `verify.log` (SHA-256 in `SHA256SUMS` there).
- The same suite with `--reduced`: **132 PASS, 0 FAIL, 3 SKIP**; the three skips are the motion checks the suite skips by
  design when motion is off (3 satellite moves, 7 hover card keeps animations, 13 salience). `verify-reduced.json`/`.log`.
- GPU film (P1000, H.264, 2 min 20 s): the failed thread ("Recovery · artifact rendering") in all ten looks, then
  Basic dark and Retro dark in Reduced Motion, with hovers over the chat's controls: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glyphs-20261010/chat-step/chat-d44-h264.mp4` (+ `.log`).
  Frame check: `strip-chat-failed.png` (the header's failed mark in Basic dark, Friendly light, Retro dark, NieR light).
- `Concepts/onboarding/opus-5.5/tools/build.py --check`: ok (PMConcept7 embeds the same neon-icons.js).
