# Rollout record: the left rail (pm7-glyphs, D44/GLY-3)

Status: GATES PASSED on concept/pm7-glyphs-rail-20261011 @28d3bb3f5f; waiting on leftrail-polish-lead's diff review,
then merged into the glyph branch. Built on the rail lead's concept/leftrail-rail-answers-20261010.

## Change
Muse (two reviewed rounds, commits 10837be094..28d3bb3f5f): the rail's states go through `PMG.status` (KEY in
`Concepts/leftrail-redesign/src/concepts/d/00-d.js`; live and run move, every other state is lit and still), every
`PMR.icon` name through `PMG.icon` (`src/js/00-core.js` NEON), the Jujutsu icons too; the pulse ring and the old badge
CSS go (edited in the `.src.css` sources, `d.css` regenerated); the old tables stay as the no-PMG fallback. The registry
gained `PMG.status` for every vocabulary key (`PMG.statusDef`, `PMG.hasStatus`).

## Gates (P1000 GPU, Quadro P1000; evidence in /mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glyphs-20261010/)
- Non-browser: `build_d_css.py --check`, `build_rail.py --check`, `build.py --check`, `parity.py` (files 87/0,
  source 114/0, docker 149/0), `node --check`: all pass.
- rail_boot.mjs `--concepts d --restore`, review copy and published PMConcept7: BEFORE (a53fefd5b8) 0 fails / 0 fails;
  AFTER (28d3bb3f5f) 0 fails / 0 fails; restore byte-identical in every look in both
  (`~/pm-scratch` W5 outputs; `rail-after/after-*.json`, `SHA256SUMS`).
- Film: `rail-after/rail-after-film.mp4` (H.264, 8 min 38 s): every rail panel in all ten looks, then Basic dark and Retro
  dark in Reduced Motion, with hovers. Frame strips (`rail-after/strips/`): Basic dark, Retro dark, NieR dark, git and
  testing panels: passed checks, flaky warning triangles, the errored run's ringed cross, NieR ink forms.
- Note for the rail lead (not a glyph issue): the testing panel's word "Errored" keeps the rail's amber word colour while
  its mark is the failed red ringed cross; the rail's own `data-d-st` word rules decide that colour.
