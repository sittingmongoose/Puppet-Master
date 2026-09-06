# TestOpusPMConcpet — source

`Concepts/TestOpusPMConcpet.html` is **assembled, not hand-edited**. Everything lives here.

```
src/
  art.js           scene system — 7 scenes × 4 illustration languages
  arttokens.css    per-theme art palettes (8 themes)
  flow.js          onboarding draft model, fixtures, preflight, commit + receipts
  markup.html      the setup-window markup
  onboarding.css   window, stage plate, content column, motion tokens
  onboarding.js    screens, flow routing, choreography
  tour.css         spotlight, guide card, Show Me pointer, practice fixture
  tour.js          the guided tour — 15 steps through the real shell
tools/
  build.py         rebuilds TestOpusPMConcpet.html from TestPMConcept.html + src/
  drive.mjs        isolated headless Chrome (file:// only, own profile)
  film.mjs         CDP virtual-time frame capture (SLOW × FPS = sampling rate)
  sheet.py         labelled frame-by-frame contact sheet via ffmpeg tile
  walk.mjs         onboarding happy path
  branches.mjs     device pairing · SSH · online sign-in · restore · back · resume
  failretry.mjs    truthful commit failure + idempotent retry
  tourwalk.mjs     full tour, faithful step-change waits
  themes.mjs       one screen across all eight themes
  reduced.mjs      Reduced Motion
  verify_steps.mjs        every step has instruction + Show Me + Skip, on screen
  verify_no_provider.mjs  zero provider requests, no usage attributed
  verify_consequence.mjs  only the affected plan element animates
  verify_recovery.mjs     missing target → recovery route
```

## Rebuild

```bash
python3 tools/build.py
```

Idempotent: always rebuilds from the pristine `TestPMConcept.html`, so `src/` is the only
source of truth and the fork can be re-derived if the base changes.

## Verify

```bash
node tools/walk.mjs && node tools/branches.mjs && node tools/tourwalk.mjs
node tools/verify_steps.mjs && node tools/verify_no_provider.mjs
node tools/verify_consequence.mjs && node tools/verify_recovery.mjs
node tools/reduced.mjs && node tools/failretry.mjs
SCREEN=project node tools/themes.mjs
```

## Review motion

```bash
SHOT=scene SLOW=4 MS=520 FPS=40 node tools/film.mjs   # a beat change
SHOT=showme SLOW=3 MS=1600 FPS=30 node tools/film.mjs # Show Me choreography
python3 tools/sheet.py scene 6.25 2 6                 # name, ms/frame, stride, cols
```

`film.mjs` scales the motion tokens by `SLOW` and steps CDP virtual time, so frames land exactly
`1000/FPS` apart regardless of render speed. Screencast is not used — it caps at ~6 fps here.

See `REPORT.md` for what changed and what was verified.
