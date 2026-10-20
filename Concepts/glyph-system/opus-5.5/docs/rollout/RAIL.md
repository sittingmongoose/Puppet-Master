# Rollout spec: the left rail adopts the neon glyph set (pm7-glyphs, D44, GLY-3)

Status: READY (Jared's GLY-3 decides the change; leftrail-polish-lead reviews the worker's diff). The first surface.
Work in the worktree `~/pm-worktrees/pm7-glyphs-rail-20261011` (branch `concept/pm7-glyphs-rail-20261011`): it is the
glyph branch plus the rail lead's `concept/leftrail-rail-answers-20261010`, which lands before the glyph rollout, so
build on its versions of the rail files. Commit there with a clear message per step; never push; never edit main.

## What changes

The rail draws its states through two functions in `src/concepts/d/00-d.js` (`svgFor(st)` and `glyph(st, pulse)`, the
SOLID knock-out badges and the G marks) and every other icon through `PMR.icon(name, cls)` (`src/js/00-core.js:48`).
After this step both ask the PMG registry (built into PMConcept7 by `build.py` step 5) and keep their old tables only
as the fallback for a name PMG cannot draw. Jared's GLY-3: the solid badges become the shared tube marks; one drawing
per state everywhere.

## Edit

1. `src/concepts/d/00-d.js`: add `KEY = { ok: 'complete', fail: 'failed', warn: 'warning', blocked: 'blocked',
   info: 'info', conflict: 'change-conflict', live: 'working', run: 'working', idle: 'idle', pending: 'pending',
   unknown: 'pending', stale: 'skipped', orphan: 'skipped', dirty: 'change-modified', stash: 'stash',
   current: 'ring-dot' }` (Concepts/glyph-system/opus-5.5/src/registry/families/rail.js holds the reasons). `svgFor(st)`
   returns, when `window.PMG` exists and `KEY[st]` is a status key, the svg from `PMG.status(KEY[st], 12, cls)` (strip
   the `<span class="nx-st">` wrapper only if `.d-gl` must stay the host; better: let `.d-gl` hold the whole wrapper),
   with `cls = ''` for `live` and `run` (they move: the bead orbits, at the set's slow 9 s) and
   `cls = 'nx-still'` for every other state (lit, one mount act, no loop: a rail full of passed tests must not pulse).
   `stash` and `current` are concepts: `PMG.icon(KEY[st], 12, 'nx-r-concept')`. Keep `data-gl` and `data-d-st` on the
   span (the rail's tests and copy read them).
2. `glyph(st, pulse)`: the `data-pulse` halo ring (`.d-gl[data-pulse]::after`) goes; the neon bead carries "live".
3. `src/js/00-core.js` `icon(name, cls)`: map the rail's names (`chevD` -> chevron-down, `chevR` -> chevron-right,
   `chevL` -> chevron-left, `plus`, `filter`, and the rest of the before-and-after map's "Rail and Settings bridge" and
   "Left rail" groups in `Concepts/glyph-system/opus-5.5/src/data/map.json`) to `PMG.icon(glyph, SIZE, role)`; a static
   size per class, no layout reads; fall back to the old drawing when `PMG.has` is false. `15-jj.js`'s own glyphs
   (the undo arrow and the jj marks) map the same way (`oplog` -> history).
4. CSS: `d.css` is GENERATED: edit `src/concepts/d/css/*.src.css` (the status rules are in `50-status.src.css`, with
   panel-specific ones in 74-search, 75-run, 76-git, 77-artifacts, 78-testing and 90-themes), then run
   `python3 Concepts/leftrail-redesign/tools/build_d_css.py` (and `--check`). Remove the rules that only style the old badges (`.d-gl .d-spin`, the masks,
   `.d-gl[data-pulse]::after`) and the `data-d-st` colour rules that colour a glyph (the tone ink comes from the mark);
   keep every `data-d-st` rule that colours a word or a row. Keep `.d-gl` at 12 px.
5. NieR (`src/css/40-nier.css`, kit 19-nier-parts.js hooks `.pmr-cur`, `.pmr-lock`): keep; the neon set's NieR
   section draws ink tubes, no glow and square caps under `icons`.

## Must stay

- `PMR.concepts.set('current')` still restores the shell's own rail byte for byte (the rail's review contract).
- Every `data-demo-action`, aria label and `data-gl` / `data-d-st` attribute. The rail's GPU acceptance (0 fails,
  restore byte-identical in all looks).
- The ignite follows PMH on PMH targets (src/bridge/pm7-hover-bridge.css); no new hover code in the rail.
- No pills, side stripes or emoji. Reduced Motion: lit and still.

## Gates

- Regenerate, never text-edit, the published page: `python3 Concepts/leftrail-redesign/tools/build_d_css.py`, then
  `python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7` and `--check`; `build_d_css.py --check` and
  `build_rail.py --check`. Use `build_rail.py --out PATH` for a private A-D comparison build.
- The rail's own checks in `Concepts/leftrail-redesign/tools/` (`parity.py`, `rail_boot.mjs`, `rail_perf.py`: read each
  header for how to run it; browser checks run on the P1000, never more than one browser at a time on Nas1), before
  and after; report every difference.
- The rail lead's GPU acceptance on the P1000, before and after.
- A GPU film (P1000, `agent-browser --record --codec h264`) of every rail panel (files, search, source, git, docker,
  testing, run, agents, artifacts) in all ten looks plus Reduced Motion, hovering items; frame strips of a live row
  and of a panel full of finished states at idle (only the live bead may move).
- Every state mark >= 3:1 on its row field in every look, including hovered and selected rows.
