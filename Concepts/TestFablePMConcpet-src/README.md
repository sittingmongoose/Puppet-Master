# TestFablePMConcpet — PMF Onboarding + Guided Tour sources

`Concepts/TestFablePMConcpet.html` is a fork of `Concepts/TestPMConcept.html`
(2026-09-04) whose Product Onboarding and Guided Tour were removed and replaced
by the two PMF modules in this folder. Everything else in the concept is the
unchanged T48 pipeline output.

## Layout

| Path | What |
|---|---|
| `onboarding.html` | root markup for the setup window (`#pmf-onboarding`) |
| `onboarding.css` | window, screens, components, eight theme materials, reduced motion |
| `onboarding/00-core.js` | namespace, utils, easing, storage, receipts, inline SVG icon set |
| `onboarding/10-fixtures.js` | scenarios, catalog data, deterministic owner simulators |
| `onboarding/20-art.js` | stage art: four family drawings, poses, string/tilt/shadow engine |
| `onboarding/30-screens.js` | every screen, sheet and action; copy lives here |
| `onboarding/40-shell.js` | window lifecycle, navigation, sheets, persistence, boot, shims |
| `tour.html` / `tour.css` | overlay, spotlight, coach card, pointer, practice sheet styles |
| `tour/00-core.js` | overlay engine: spotlight settle, card placement, Show Me pointer |
| `tour/10-steps.js` | fixtures, shell helpers, practice planning sheet, the 12 steps |
| `tour/20-shell.js` | state machine, predicates, Show Me orchestration, snapshot/restore |
| `tools/assemble.py` | splices these sources into the concept between `PMF:*` markers |
| `tools/*.mjs` | Playwright drivers: flow, themes, tour, scenario matrix, 60fps filmer |
| `RESEARCH.md` | condensed onboarding/tour/motion research with sources |
| `REPORT.md` | completion and production-impact report |
| `evidence/` | contact sheets from the vision and frame-by-frame reviews (`th_*`, `v3_*` theme sweeps; `film_*` 60fps-equivalent motion sheets; `tour_*`, `tt_*`, `mx_*` tour and scenario sweeps) |

## Rebuild

```bash
python3 Concepts/TestFablePMConcpet-src/tools/assemble.py
```

The assembler refuses to build if any emoji codepoint appears in the sources.
Never hand-edit the blocks between the `PMF:*:START/END` comments in the
concept; edit here and rebuild.

## Drive

Playwright-core from the npx cache and the system Chrome are used over `file://`.

```bash
cd Concepts/TestFablePMConcpet-src/tools
node drive.mjs                 # fresh user, new Project path, screenshots
SCREEN=power node themes.mjs   # one screen across all eight themes
node tourdrive.mjs             # whole tour through Show Me, zero provider calls
node matrix.mjs                # every branch with assertions
SLOW=4 node film.mjs tour-drag friendly-dark   # 60fps-equivalent contact sheet
./filmall.sh                   # four motions in every theme
```

`film.mjs` records the CDP screencast (about 15 fps in headless Chrome) while
CSS animations run at quarter speed through `Animation.setPlaybackRate` and the
modules' own tweens honour `window.__pmfTimeScale`, then labels each frame with
real-time milliseconds.

## Concept-only affordances

- The stage's `Concept scenario` pill switches the fixture scenario
  (first-time user, returning user, flaky network).
- `#no-onboarding` in the URL suppresses the first-run auto-open.
- `window.PMF_ONBOARDING` and `window.PMF_TOUR` expose state, commands,
  receipts and events; `PM7_ONBOARDING_CINEMATIC` and `PM7_GUIDED_TOUR` are
  compatibility shims for the existing Settings entries.
