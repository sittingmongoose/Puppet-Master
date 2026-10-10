# Rollout spec: Usage adopts the neon glyph set (pm7-glyphs, D44)

Status: DRAFT for t3-usage-pm7's review. A worker executes it only after that review and after the left rail's step.

## What changes, in one paragraph

Usage draws every icon through `PMU.icon(name, cls)` from the `SVG` table in `Concepts/usage-redesign/src/js/00-core.js`.
After this step `PMU.icon` asks the PMG registry first (`window.PMG.icon(glyph, size, cls)`, built into PMConcept7 by
`build.py` step 5) and keeps the old table only as the fallback for names PMG cannot draw. State glyphs on plates, rows
and alerts become `PMG.status(key, size, 'nx-still')`: lit and still, so nothing breathes or blinks at idle (Usage's
rule: only Live beats move). Provider brand marks are untouched.

## Inputs (read-only except the files named under "Edit")

- Map from PM7 name to glyph: `Concepts/glyph-system/opus-5.5/src/data/map.json` (items with `table` `T-usage-svg`,
  `T-usage-base`, `T-single`, `runtime`). The lead's table below wins where they differ.
- Status keys and the words Usage uses: `Concepts/glyph-system/opus-5.5/src/data/status.json` (`surfaces.usage`).
- The glyph API: `Concepts/glyph-system/opus-5.5/src/registry/00-loader.js` header.

## Edit

1. `src/js/00-core.js`: add a `NEON` map (PM7 name -> glyph) and change `PMU.icon` to
   `PMG.has(NEON[name] || name) ? PMG.icon(NEON[name] || name, sizeFor(cls), 'nx-r-' + roleFor(name)) : <the old SVG>`,
   wrapped in the same `<span class="pmu-ico">`. `sizeFor` reads the size the CSS gives `.pmu-ico` in that context
   (16 by default, 14 in card heads); never change a box size. Names to map (lead's table):
   `refresh`->refresh, `export`->outbox, `chevron`/`chevronDown`->chevron-down, `chevronRight`->chevron-right,
   `chevronLeft`->chevron-left, `close`->close, `gear`/`toolGear`->settings, `checkCircle`->check-circle,
   `alert`->st-warning, `hourglass`->hourglass, `key`->key, `lock`->lock, `link`->link, `arrowUp`->arrow-up,
   `arrowDown`->arrow-down, `coin`->coin, `info`->info, `plus`->plus, `minus`->minus, `resize`/`toolSize`/`size`->resize,
   `eye`->eye, `eyeOff`->eye-off, `search`->search, `clock`/`clockCircle`->clock, `file`->page, `user`->user,
   `briefcase`->briefcase, `pencil`->edit, `grip`/`drag`/`toolGrip`->grip, `kebab`/`dots`/`toolKebab`->more, `grid`->grid,
   `list`->list, `wallet`->wallet, `gauge`->gauge, `pulse`->pulse, `spark`->sparkles, `book`->notebook.
   Not glyphs, keep as they are: `notch`, `diamond`, `halfCircle`, `provider`, `tidy` (until drawn), and every brand mark.
2. State marks (`minusCircle`, `slashCircle`, `dashedCircle`, `halfCircle` used as a state, `xCircle`, the alert
   triangle on alert rows): replace each call site in `50-w-common.js`, `54-w-accounts.js`, `52-w-plans.js` and
   `74-rooms-c.js` with `PMG.status(key, size, 'nx-still')`, the key from `PMU.fmt`'s state word through
   `status.json` `surfaces.usage` (degraded/low -> warning, signed out/unavailable -> offline, cooldown -> recovering,
   standby/paused -> paused, exhausted -> failed, needs a seat -> off, live -> working). Write the word-to-key table once,
   in `10-fmt.js`, next to `PMU.fmt`.
3. `src/css/20-board.css`: no box sizes change. If a rule set `stroke-width` on `.pmu-ico svg`, scope it to
   `.pmu-ico svg:not(.nx)` so the neon weight ladder applies.
4. NieR (`96-nier.js`, `90-nier-shell.css`, `94-nier-widgets.css`): remove Usage's own NieR glyph overrides only where
   the neon set's NieR section already does the same (ink tubes, no glow, stepped); keep anything else, and keep no blur
   under NieR (F3-628).

## Must stay

- `data-tool` attributes and aria labels on the card-head buttons (probes use them); D43's per-account control slot.
- Card-head tool weight (PERF-3): today each tool is one path in one svg. The neon glyph adds its halo path. Measure the
  room chrome's element count before and after; report it. The lead decides whether to add a compact render.
- Reduce Motion is instant. No idle motion except Live beats. No pills, side bars or tinted boxes. Labels >= 11 px.
- Files owned by home-panels (40-board.js, 90-api.js, 15-film.js, 45-menu.js, the board-singleton parts of
  42-cards.js): do not edit; list any change they would need.

## Gates (all must pass; attach the outputs)

- `python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7` then `--check`.
- On ubuntu-p1000: `~/pm-scratch/usage-pm7-20261009/qa/walk.mjs` + `cmp.py`, before and after, and `usage_boot.mjs`
  in published mode (t3-usage-pm7's gates).
- A GPU film (P1000, `agent-browser --record --codec h264`) of the Usage page in all ten looks plus Reduced Motion,
  hovering the card-head tools and an alert row; frame strips of the hover and of a plate at idle (it must not move).
- Every state mark >= 3:1 on its field in every look (the catalog's measure, `PMG_CATALOG.contrastOf` logic).
