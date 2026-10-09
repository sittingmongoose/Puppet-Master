# Left rail redesign

Four concepts for the left rail of the Puppet Master concept (the activity bar and its side panels), built as a layer
over the published concept. The review copy is `Concepts/LeftRailPMConcept7.html`: `PMConcept7.html` with the concepts
added and a switcher in the status bar ("Rail", Alt+Shift+1..5 for A, B, C, D and Current, or
`?rail=a|b|c|d|current`; D is the default). It is generated: never hand-edit it, and never edit `PMConcept7.html` for
this work.

Concept round (Jared, 2026-10-02): each concept redesigns the activity bar and three panels — Files, Source Control and
Docker. The other six panels stay as they are, and "Current" shows today's rail untouched, so the concepts can be
compared in place. Jared judges the concepts; nothing here ranks them.

| | Concept | Idea |
|---|---|---|
| A | Ledger | Read it in place: typographic two-line rows, text tabs with a gliding ink and an overflow menu, inline detail |
| B | Stack | Drill in: a summary page per panel instead of tabs, full-width pages per area and per item, depth told by motion |
| C | Lens | Detail beside the rail: compact one-line index rows, a transient sheet beside the rail for the selected item, morphing icon tabs |
| D | Polish | Today's rail, polished (Jared, 2026-10-05, after A-C): same structure and coloured shelves, no pills, status glyph + word, highlights concentric with their boxes, text that fits by layout (stacking, middle truncation) instead of abbreviation, tight horizontal spacing, per-family motion |

Concept D is a skin: it renders no views of its own. It keeps the shell's `#panel-files`, `#panel-source` and
`#panel-docker` (every behaviour and `data-demo-action` stays), restyles them under `html[data-rail-skin="d"]`, and its
script records every DOM change it makes and undoes it on a concept switch, so "Current" is byte-identical afterwards.
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
  tools/build_rail.py           build / --check Concepts/LeftRailPMConcept7.html (--out PATH [--only x] for private builds)
  tools/rail_layer.py           apply(text, need) -> (text, notes), lint(), syntax_check(text)
  tools/rail_boot.mjs           acceptance check on GPU Chrome (reach, overflow, type floor, pills, side bars, themes, NieR;
                                skin concepts d and current checked on all nine rail panels (the shell's own), their
                                dropdowns must open PMR.menu; --restore: D -> Current leaves the panels identical)
  tools/rail_perf.py            frames drawn per rail motion on the VM GPU (headful, renderer asserted): for the skin
                                concepts every panel's bar switch, expander, menu and tab
  tools/build_d_css.py          concept D's d.css from src/concepts/d/css/*.src.css (--check for staleness)
  tools/parity.py               every original data-demo-action/-arg pair of the three panels is in the fixture
  src/css/*.css                 shared tokens, the menu, the host, the kit, the NieR hooks
  src/js/*.js                   window.PMR: core helpers, the fixture (05-07 data only, 08 assembly), glyphs, rules,
                                the menu, the host (concept registry, views, panel watch), the switcher, boot
  src/concepts/<a|b|c>/         one folder per concept (JS in its own wrapper, CSS scoped to html[data-rail-concept])
```

## Commands (from the repository root)

```
python3 Concepts/leftrail-redesign/tools/build_rail.py          # build Concepts/LeftRailPMConcept7.html
python3 Concepts/leftrail-redesign/tools/build_rail.py --check  # rebuild in memory, lint, syntax, byte parity
python3 Concepts/leftrail-redesign/tools/parity.py --list       # fixture completeness against PMConcept7.html
node Concepts/leftrail-redesign/tools/rail_boot.mjs <out-dir> [--concepts a,b,c,d,current|none] [--panels files,search]
     [--themes all|basic-dark,...] [--quick] [--shots] [--restore]
     # d and current: all nine panels by default; a, b, c: files, source, docker; --panels overrides both;
     # --restore: boots Current, uses D, returns to Current and fails on any difference (every theme, NieR included);
     # --concepts none --restore runs the restore check alone
python3 Concepts/leftrail-redesign/tools/rail_perf.py Concepts/LeftRailPMConcept7.html <out.json> [--concepts d,current]
     [--themes basic-dark,glass-dark,retro-light] [--size 1600x1000] [--port 9351]
     # d and current: nine panels (bar-switch, expand, menu-open, tab per panel, as each panel has them); a, b, c: their own
     # moments; each run record has name (the moment kind) and panel. On the VM, from the lane directory:
     # PM_PERF_TOOLS=~/src/PuppetMaster/Concepts/onboarding/opus-5.5/tools/perf python3 rail_perf.py rail.html out.json
python3 Concepts/leftrail-redesign/tools/build_d_css.py [--check]
python3 Concepts/onboarding/opus-5.5/tools/build.py --check     # the published concept stays untouched: "check ok"
```

`build_rail.py` starts from `build.build_text()` of `Concepts/onboarding/opus-5.5/tools/build.py`, so the base pin is
enforced there. The opus-5.5 build reads `Plans/settings_inventory.json`; in a sparse worktree without `Plans`, write
that one file from `HEAD` (`git show HEAD:Plans/settings_inventory.json > Plans/settings_inventory.json`). Keep
`<out-dir>` outside the repository; `--shots` writes review screenshots there (delete them after review).
`rail_boot.mjs` finds `playwright-core` through env `PM_PLAYWRIGHT` (a directory that contains it), then the VM lab's
`node_modules`, then `~/pm-motion-lab`. It starts one agent-browser GPU session at a time and stops each one when its page
is done. Pass the built page and the reference with `--page` and `--ref` when they are not in the repository, and never
run it with `--disable-gpu`.

## What the layer does

The concept round leaves the original rail band in place. `rail_layer.apply()` adds `<style id="pm-rail-css">` before
`</head>` and `<script id="pm-rail-js">` before `</body>` (each between `RAIL:` markers), and adds the rail's NieR hook
classes (`.pmr-cur`, `.pmr-chosen`, `.pmr-strip`) to the NieR selector lists of the Settings script, anchored on
neighbours the usage-redesign layer does not touch (agreed with that thread), so both layers compose. At run time the
host adds a `section.pmr-view[data-pmr-for="panel-*"]` per redesigned panel at the end of `#sidePanelSlot`; CSS hides
the original panel and shows its view while the original is `.active`, so every way of switching panels keeps working.
Under any concept the active activity-bar icon's 3 px side bar is removed; each concept draws its own active mark.
