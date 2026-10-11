# Rollout spec: onboarding and the guided tour adopt the neon glyph set (pm7-glyphs, D44)

Status: READY (planner's go, 2026-10-11). Surface 3. No other thread owns `Concepts/onboarding/opus-5.5/src` today;
the planner is told before a worker runs it.

## Two kinds of glyph here

1. **Interface icons** through `U.icon(name, cls)` (`src/js/05-util.js:18`), which reads the shell's `window.PM_ICONS`
   (the "Shell icons" group of the catalog's before-and-after map). Buttons, setup rows, the look menu, the tour's
   wizard mock. These adopt the set.
2. **Art glyphs** through `A.glyph(name, ...)` (`src/js/50-art-core.js`, `A.glyphs`): the pictures inside the onboarding
   art scenes, which each family renders in its own material (line, paper, light, pixel). They keep their materials.
   Whether they also take the neon set's shapes is an art-direction question for Jared (card GLY-4, to be asked); until
   he answers they stay exactly as they are.

## Edit (interface icons only)

1. `src/js/05-util.js` `U.icon`: add a `NEON` map (PM_ICONS name -> glyph; the "Shell icons (PM_ICONS)" rows of
   `Concepts/glyph-system/opus-5.5/src/data/map.json`, `table` `T-core`, field `glyph`) and draw
   `PMG.icon(NEON[name], SIZE[cls] || 16, 'nx-r-' + role)` inside the same `<span class="o55-ico ...">` when the name is
   in NEON and `PMG.has` it; every other name keeps `PM_ICONS[name]` exactly (only NEON names go to PMG, as Usage's review
   required). Static size per class from the CSS (`src/css/*`), never measured; cache the string per (glyph, size, role).
   Do NOT change `window.PM_ICONS` itself: the Planning Wizard and the Orchestrator read it and get no adoption.
2. The tour's Planning Wizard mock (`src/js/82-tour-wizard.js`) imitates the wizard: leave its icons as they are (the
   wizard gets no adoption, so the mock must keep matching it).
3. No CSS box changes. If a rule sets `stroke-width` on `.o55-ico svg`, scope it to `:not(.nx)`.

## Gates
- `python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7` and `--check` (it lints these sources).
- The onboarding and tour checks in `Concepts/onboarding/opus-5.5/tools/` (read each header: `boot_check.mjs`,
  `onboarding_explorer.mjs`, `tour_census.mjs`, `state_shots.mjs`), before and after, on the P1000.
- A GPU film (P1000, H.264) of the onboarding walk and the tour in all ten looks plus Reduced Motion, and frame strips of
  the setup rows and the look menu.
