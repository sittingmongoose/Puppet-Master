# Rollout record: onboarding and the guided tour (pm7-glyphs, D44)

Status: GATES PASSED; merged into
concept/pm7-glyphs-20261010 (6384da4929) with the lead's fixes (cfdd7f3919, a3ce78ba49, 071cd7ad5b). Surface 3. The art scenes wait for card
GLY-4 (share folder `2026-10-11-glyph-gly4-onboarding-art/`).

## Change
- Round 1 (Muse, 49e93cacd0): `U.icon` asks PMG for the PM_ICONS names (T-core). Correct, but no button passes an
  icon today, so it changed no pixel.
- Round 2 (lead, 7502a35df8): the window's own icons and marks, as ONBOARDING.md "Round 2" lists: `U.nx` / `U.mark`
  (cached, browser-serialised), `C.small` / `C.glyph` on the T-art glyphs, status uses as shared marks (done, warning,
  working for every spinner, failed, pending, off, info), phases and steps without their solid discs (GLY-3), the
  controls (close, back, disclosure, look, sliders, sound, help, tour zone arrow). Every path keeps its old drawing
  without PMG; the tour's wizard mock keeps the art check (`C.smallArt`).
- Fixes from the gate (cfdd7f3919, `src/css/25-glyphs.css`): under NieR a glyph in the window or the tour follows its
  host's text colour (NieR's reverse-video hovers made the ignite's text ink the fill itself: 1.0:1); Friendly Light and
  Glass Light draw glyphs in a deeper accent of the same hue (#d05836, #005aa2), the window's text keeps its own.

## Gates (P1000 Quadro P1000; /mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glyphs-20261010/onboarding-gate/)
- `build.py --publish-pm7` + `--check`, `build_rail.py` + `--check`: ok.
- Onboarding acceptance (`tools/scenarios.mjs`, 69 scenarios), before (6a699e25ef) and after (842b568972): 56 pass in
  both, the same 13 fail in both (s01, s09, s09b, v1, b5, a1, a4, a6, x2, b1, b2, lc4, lc6: mostly "timeout waiting for
  commit settled"), and the same 13 fail on main's own page (618fd35e0e): pre-existing, not the glyphs'.
  `results/scenarios-{before,after,main-13}.json`.
- Tour acceptance (`tools/tour_scenarios.mjs` t1-t7): 7/7 before and after.
- Census (scratch runner `scripts/census-runner-tail.mjs` on the scenarios): every state each scenario reaches lists
  the window's and the tour's icons that are not neon, and measures every neon glyph's ink against the pixels rendered
  behind it (glyphs hidden; glyphs under the window's foot are not on screen and are skipped).
  - Basic Dark, all 69 scenarios, 716 states: no icon left that is not neon (the NieR pod and the art scenes are art).
    Full-strength glyphs: status lowest 4.78:1, controls 5.78, concepts 3.79. One under 3: a server glyph on a
    disabled card at .55 (disabled, exempt; the old icon was dimmed the same).
  - Nine more looks (7 scenarios each, 775 states): found the NieR hover and the two light accents above; after the
    fixes see "Re-census" below.
- Hovered controls (`scripts/hover-probe.mjs`, the head's look, sound and close, and back, in all ten looks): 7.56-12.97:1
  (`results/hover-controls.json`).
- Re-census after the fixes (Friendly Light, Glass Light, NieR Dark and Light; 7 scenarios each, 270 states;
  `results/census-recheck-four-looks.json`): full-strength concepts 3.21 (Friendly Light, from 2.55) / 3.56 (Glass
  Light) / 5.03 (NieR), controls 4.32+ (NieR, from 1.0), status 4.86+ except Friendly Light's done on the window's mint
  tag (2.96) and working on its tinted wait label (3.0). Those two fields joined `src/data/ink-fields.json`, so the
  tuner moved Friendly Light's done and working inks (#2a8f75, #348bb3; a3ce78ba49): 3.2:1 there. Under .95 opacity
  only entrance animations (the promise list fading in) and NieR's sound-off button hovered: it kept its muted text on
  the hover's reverse-video fill (1.48:1; older than the set, the old icon followed the same colour). Fixed in
  25-glyphs.css: hovered, it takes the fill's paper like its neighbours.
- Hovered sound-off (`SOUND_OFF=1 scripts/hover-probe.mjs`, all ten looks): 7.94-12.55:1, NieR 8.61 / 11.47
  (`results/hover-controls-sound-off.json`).
- Film (`films/onboarding-film.mp4`, 7 min 8 s, H.264 1920x1080, sha256 e9e339bfbbd3fddc..., on 071cd7ad5b;
  `scripts/film-onb.mjs`, chapters in `films/onboarding-film-chapters.json`): the walk from Welcome to Creating in all
  ten looks (the head's look, sound and close hovered, cards hovered, the check chips working then done, the help
  disclosure, the look menu, sound off and on, the phases), the tour's bar and first steps in Basic Dark, Glass Light,
  Retro Dark and NieR Dark, then Reduced Motion in Basic Dark and Retro Light. Frame strips `films/*.png`: NieR's
  reversed head buttons keep their glyph, the chips run working -> done, the phase list draws complete / working /
  pending without discs; Reduced Motion lit and still. No page errors.

## Not changed here
- The art scenes (GLY-4), the logo, the tour pointer, QR and identity art, the NieR pod.
- The pills' boxes (`.o55-pill`, `.o55-tag`, `.o55-chip`): pm7-no-pills' follow-up branch; the marks inside are these.
