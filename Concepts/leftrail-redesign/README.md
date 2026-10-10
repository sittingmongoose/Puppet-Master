# Left rail redesign

Four concepts for the left rail of the Puppet Master concept (the activity bar and its side panels). Jared chose D,
Polish (2026-10-09), and it is the rail of the published concept: `Concepts/PMConcept7.html` carries D, built in by the
opus-5.5 build (`build.py --publish-pm7`, whose last step is `rail_layer.apply_published()`). The review copy
`Concepts/LeftRailPMConcept7.html` is that page plus concepts A, B and C and a switcher in the status bar ("Rail",
Alt+Shift+1..5 for A, B, C, D and Original, or `?rail=a|b|c|d|current`; D is the default), so the D compared there is
the published D byte for byte. "Original" (id `current`) is the rail before Polish: the shell's own rail with D
unmounted. Both pages are generated: never hand-edit them.

Concept round (Jared, 2026-10-02): each concept redesigns the activity bar and three panels — Files, Source Control and
Docker. The other six panels stay as they are, and "Current" (now labelled Original) shows the rail untouched, so the
concepts can be compared in place. Jared judges the concepts; nothing here ranks them.

| | Concept | Idea |
|---|---|---|
| A | Ledger | Read it in place: typographic two-line rows, text tabs with a gliding ink and an overflow menu, inline detail |
| B | Stack | Drill in: a summary page per panel instead of tabs, full-width pages per area and per item, depth told by motion |
| C | Lens | Detail beside the rail: compact one-line index rows, a transient sheet beside the rail for the selected item, morphing icon tabs |
| D | Polish | Today's rail, polished (Jared, 2026-10-05, after A-C): same structure and coloured shelves, no pills, status glyph + word, highlights concentric with their boxes, text that fits by layout (stacking, middle truncation) instead of abbreviation, tight horizontal spacing, per-family motion |

Concept D is a skin: it renders no views of its own. It keeps the shell's nine rail panels (`#panel-files` ...
`#panel-artifacts`; every behaviour and `data-demo-action` stays), restyles them under `html[data-rail-skin="d"]`, and
its script records every DOM change it makes and undoes it on a concept switch, so "Original" is byte-identical
afterwards. Every D change is a run-time, recorded change: never patch the opus-5.5 build or the base markup for D, or
"Original" stops being the rail before Polish.
Its stylesheet is generated: edit `src/concepts/d/css/*.src.css` and run `tools/build_d_css.py` (the Look settings
scaler only rescales flat rules, so the sources use selector macros instead of CSS nesting).

Hard rules for every concept: no pills, no boxes with coloured side bars, no emoji, every dropdown in the chat
assistant's picker style (`PMR.menu`), readable type (13 px names, 12 px facts, nothing under 11 px), the rail stays
narrow (280 px default), all eight theme variants plus NieR Mode, smooth motion. Browser checks run on the VM GPU
(`agent-browser`, never `--disable-gpu`; `/mnt/Cursor/Agent-Guides/gpu-recording.md`).

## Layout

```
Concepts/leftrail-redesign/
  README.md, DATA.md            this file; the fixture schema every concept renders from
  tools/build_rail.py           build / --check Concepts/LeftRailPMConcept7.html (--out PATH [--only a,b,c] for private
                                builds); the published page comes from opus-5.5 build.py, which calls rail_layer
  tools/rail_layer.py           apply_published(text, need) (PMConcept7.html: core subset + D), apply_review(text, need)
                                (the review copy, stacked on the published page), published_problems(built),
                                lint(profile), syntax_check(text, sid)
  tools/rail_boot.mjs           acceptance check on GPU Chrome (reach, overflow, type floor, pills, side bars, themes, NieR;
                                skin concepts d and current checked on all nine rail panels (the shell's own), their
                                dropdowns must open PMR.menu; --restore: D -> Current leaves the panels identical and
                                equal to the reference's own rail)
  tools/rail_perf.py            frames drawn per rail motion on the VM GPU (headful, renderer asserted): for the skin
                                concepts every panel's bar switch, expander, menu and tab
  tools/build_d_css.py          concept D's d.css from src/concepts/d/css/*.src.css (--check for staleness)
  tools/parity.py               every original data-demo-action/-arg pair of the three panels is in the fixture
  src/css/*.css                 published (rail_layer.PUBLISHED_CSS): 00 tokens, 10 the menu, 20 the host's icon box and
                                the side-bar removal, 40 the NieR hooks; review only: 25 the view sections, the Lens
                                layer, the switcher, the demo-pill move; 30 the kit of the view concepts
  src/js/*.js                   window.PMR. Published (rail_layer.PUBLISHED_JS, one shared scope): 00 core helpers,
                                20 the menu, 30 the host (concept registry, PMR.PANELS, views on first use, panel
                                watch), 90 boot. Review only (a second shared scope over window.PMR): the fixture (05-07
                                data only, 08 assembly), 10 glyphs, 12 rules, 40 the switcher
  src/concepts/d/               concept D, published (JS in its own wrapper, CSS under html[data-rail-skin="d"])
  src/concepts/<a|b|c>/         the review copy's view concepts (JS in its own wrapper, CSS scoped to
                                html[data-rail-concept])
```

## Commands (from the repository root)

```
python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7  # PMConcept7.html (and TestOpus5.5PmConcept.html) with D
python3 Concepts/onboarding/opus-5.5/tools/build.py --check     # "check ok": lint, syntax, rail markers, both pages current
python3 Concepts/leftrail-redesign/tools/build_rail.py          # build Concepts/LeftRailPMConcept7.html (after --publish-pm7)
python3 Concepts/leftrail-redesign/tools/build_rail.py --check  # rebuild in memory, lint, syntax, byte parity
python3 Concepts/leftrail-redesign/tools/parity.py --list       # fixture completeness against PMConcept7.html
node Concepts/leftrail-redesign/tools/rail_boot.mjs <out-dir> [--page P[?query]] [--ref R[?query]]
     [--concepts a,b,c,d,current|none] [--panels files,search] [--themes all|basic-dark,...] [--quick] [--shots] [--restore]
     # page: the review copy by default; the published page: --page Concepts/PMConcept7.html --concepts d
     # ref: the shell's own rail, by default Concepts/LeftRailPMConcept7.html?rail=current (D never mounts there)
     # d and current: all nine panels by default; a, b, c: files, source, docker; --panels overrides both;
     # --restore: switches to Current (Original), uses D, returns to Current and fails on any difference (every theme,
     #   NieR included) and when the first Current differs from the reference's own rail;
     # --concepts none --restore runs the restore check alone
python3 Concepts/leftrail-redesign/tools/rail_perf.py Concepts/LeftRailPMConcept7.html <out.json> [--concepts d,current]
     [--themes basic-dark,glass-dark,retro-light] [--size 1600x1000] [--port 9351]
     # d and current: nine panels (bar-switch, expand, menu-open, tab per panel, as each panel has them); a, b, c: their own
     # moments; each run record has name (the moment kind) and panel. On the VM, from the lane directory:
     # PM_PERF_TOOLS=~/src/PuppetMaster/Concepts/onboarding/opus-5.5/tools/perf python3 rail_perf.py rail.html out.json
python3 Concepts/leftrail-redesign/tools/build_d_css.py [--check]
```

`build_rail.py` starts from `build.build_text()` of `Concepts/onboarding/opus-5.5/tools/build.py` (the published bytes,
D included), so the base pin is enforced there. Order after any rail or opus-5.5 change: `build_d_css.py`, then
`build.py --publish-pm7`, then `build_rail.py`; `build.py --check` fails while `PMConcept7.html` is stale against the
D sources. The opus-5.5 build reads `Plans/settings_inventory.json`; in a sparse worktree without `Plans`, write
that one file from `HEAD` (`git show HEAD:Plans/settings_inventory.json > Plans/settings_inventory.json`). Keep
`<out-dir>` outside the repository; `--shots` writes review screenshots there (delete them after review).
`rail_boot.mjs` finds `playwright-core` through env `PM_PLAYWRIGHT` (a directory that contains it), then the VM lab's
`node_modules`, then `~/pm-motion-lab`. It starts one agent-browser GPU session at a time and stops each one when its page
is done. Pass the built page and the reference with `--page` and `--ref` when they are not in the repository, and never
run it with `--disable-gpu`.

## What the layer does

Two profiles over the same sources, so the D in both pages is one program.

- **Published** (`rail_layer.apply_published`, the last step of opus-5.5 `build.build_text()`): the shell's rail band
  stays as it is (guarded: the band and all nine panels exactly once). The layer adds `<style id="pm-rail-css">`
  before `</head>` and `<script id="pm-rail-js">` before `</body>` (between `RAIL:CSS` / `RAIL:BODY` markers) with
  the files named in `PUBLISHED_CSS` / `PUBLISHED_JS` and concept D, and writes `data-rail-concept="d"
  data-rail-skin="d"` into the `<html>` tag, so D's CSS holds from the first frame and the boot's switch to D writes
  nothing (the host writes root attributes only when they change). No switcher, no `?rail=`, no remembered choice,
  no `.pmr-view` sections, no fixture: the boot always mounts D. `PMR.concepts.set('current')` still unmounts it
  byte-identically, which is how `rail_boot --restore` and `t-restore` check the published page. `build.py` runs
  `rail_layer.published_problems()` (lint of the published files, `node --check`, markers, the root attributes, and
  that no review-only text reached the page).
- **Review** (`rail_layer.apply_review`, `build_rail.py`, on the published page): `<style id="pm-rail-review-css">`
  and `<script id="pm-rail-review-js">` right after the published blocks (between `RAIL-REVIEW:` markers) with the
  other `src/css` and `src/js` files and concepts A, B and C, plus the view concepts' NieR hooks `.pmr-chosen` and
  `.pmr-strip` in the Settings script's NieR selector lists (anchored on neighbours the usage-redesign layer does not
  touch, so both layers compose). The boot (end of the published script) waits for `load`, finds the switcher and
  behaves as before: `?rail=`, the remembered choice (`localStorage['pmr.concept.v2']`, written by the switcher), D by
  default. For a view concept the host adds, on first use, a `section.pmr-view[data-pmr-for="panel-*"]` per
  redesigned panel at the end of `#sidePanelSlot`; CSS hides the original panel and shows its view while the original
  is `.active`, so every way of switching panels keeps working.

D's NieR hooks are kit source (`Concepts/onboarding/opus-5.5/src/settings/kit.d/19-nier-parts.js`): `.pmr-cur` in the
cursor list (D's rows and every `PMR.menu` item get the square cursor and its tick; the ink bar is `src/css/40-nier.css`)
and `.pmr-lock` in the brackets' click handler (D's tabs: the brackets lock on after the click, on the box the ink
fills). Both do nothing for an element without those classes. Under any concept the active activity-bar icon's 3 px side
bar is removed; each concept draws its own active mark.
