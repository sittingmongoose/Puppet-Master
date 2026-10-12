# Rollout spec: onboarding and the guided tour adopt the neon glyph set (pm7-glyphs, D44)

Status: DONE in two rounds (round 1 Muse: U.icon; round 2 lead: the window's own icons and marks, below). Surface 3. No other thread owns `Concepts/onboarding/opus-5.5/src` today;
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

## Round 2 (lead, 2026-10-11): what the window actually draws
Round 1 was correct but changed no pixel: no button passes an icon to `U.icon`. The window's icons come from
`C.small` / `C.glyph` (the art glyphs by name, table T-art of the before-and-after map, which D44 approved) and from
inline svgs. Round 2, in `src/js` with one CSS file `src/css/25-glyphs.css`:
- `U.nx(glyph, size, role, cls)` and `U.mark(status, size, cls, moving)` (05-util.js): PMG's glyph or status mark, cached
  in the browser's serialised form (the sound and look slots compare innerHTML), '' without PMG so every caller keeps
  its old drawing.
- `C.small` and `C.glyph` draw the T-art glyph; `C.smallArt` is the old drawing, kept for the tour's Planning Wizard
  mock (no adoption).
- Status uses are marks: done (`C.done`: hints, chips, banners, paired rows, pills), working (`C.spin`: every
  `.o55-spin`), a note's own kind when it names no glyph (warn, ok, info), the NAS "turn on SSH" note (off). Phases:
  waiting / active / done / failed -> pending / working / complete / failed; the backup's steps: done -> complete, the
  step you are on -> the ring-dot position marker, later -> pending. The solid phase discs go (GLY-3).
- Controls: the head close, the sheet close, back, the disclosure chevron, the look button (palette), NieR's sliders,
  the sound button (speaker / speaker-off, swapped whole), the details "?" (help), the tour's zone arrow.
- Unchanged: the art scenes (`A.glyph` inside scenes, card GLY-4), the logo, the tour pointer, QR and identity art.
- pm7-no-pills takes the onboarding pills' boxes in a later branch; the marks inside them are these.
