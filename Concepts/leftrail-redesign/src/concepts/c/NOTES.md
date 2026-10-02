# Concept C (Lens) — builder notes

Build: `python3 Concepts/leftrail-redesign/tools/build_rail.py --out ~/PM-Experiments/leftrail-redesign-20261002/builds/c/LeftRailPMConcept7.html --only c`
Own drivers (not in repo): `~/PM-Experiments/leftrail-redesign-20261002/builds/c/tools/drive.mjs <script.mjs>` (boots the build, concept c, screenshots to builds/c/shots).

## Files
- 00-c.js: helpers (kinds, CST state, middle truncation cFitName, cActRow Lens action rows, cTools priority+ icon tools), register('c').
- 05-lens.js: Lens engine (LENS singleton in PMR.host.overlay(); cLensShow/cLensHide/cLensPlace; open/follow/close motion per family; cLensDoc builder; Technical details disclosure with data-pmr-nav).
- 08-panel.js: cMountPanel framework (head: title menu + tools; identity; morphing tabs with More; index list with sliding highlight; sections; keyboard; footer) + cItemRow / cDocFor / cSectionDoc.
- 10-files.js, 20-source.js (Git + Jujutsu; composer footer; Publish and review footer line), 30-docker.js (failing first; ports/metrics/events; chain steps), 40-bar.js (sliding tile, attention badges, expanded status board).
- c.css: everything.

## Decisions
- Crawler conventions: rows data-pmr-nav="select" + unique nav-id; open-by-default section headers carry no nav; folders expand on first click, collapse only when clicked while already selected (or via twisty/ArrowLeft).
- Dwell preview: not built (hover-opened sheets over the editor would fire while scanning; click/arrow selection is enough).
- 'facts' sections become one row whose Lens holds the facts (Publish and review, Remote projection, Compose project).

## Status
- [x] core, Files, Source, Docker, bar written and screenshot-checked once (basic-dark)
- [x] quick boot green; crawler fixed by lead (d39db1dc98)
- [x] Glass Lens plate made opaque (raised surface over --bg)
- [x] full boot (all themes): reach 0 missing in all three panels; only Friendly pills failed -> fixed (radius 9 px cap)
- [x] jj views checked (branch menu hidden in Jujutsu), Retro footer fixed, NieR bar tile re-syncs on theme change
- [x] final full boot (8 themes + NieR light/dark, crawl): rail boot ok, 0 missing, 0 errors; shots reviewed and deleted
- Possible next: dwell preview (deliberately not built), Lens for Kubernetes 'Show' state, more motion tuning after GPU films
