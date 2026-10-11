# Rollout spec: Usage adopts the neon glyph set (pm7-glyphs, D44)

Status: APPROVED by t3-usage-pm7 (2026-10-10) with the six changes folded in below. A worker executes it after the left rail's step.

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
   `PMG.has(NEON[name] || name) ? PMG.icon(NEON[name] || name, SIZE[cls] || 16, 'nx-r-' + roleFor(name)) : <the old SVG>`,
   wrapped in the same `<span class="pmu-ico">`. `SIZE` is a static map per class (card head 14, default 16; list each
   class you find); never measure (no getComputedStyle or layout read: PMU.icon runs on every live-beat re-render), and
   cache the returned string per (glyph, size, role). Never change a box size.
   The four card-head tools (toolGrip, toolSize, toolGear, toolKebab) use `PMG.flat(glyph, 14, 'nx-r-control')`: one
   path, no halo, ink-only hover (PERF-3). The kebab becomes the set's `more`: horizontal dots, like every other menu
   in Puppet Master. Names to map (lead's table):
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
   `74-rooms-c.js` with `PMG.calm(key, size)` (lit and still from the first frame: no rhythm and no mount act; the
   room entrance owns all arrival motion), placed BESIDE the state word, never replacing it, the key from `PMU.fmt`'s state word through
   `status.json` `surfaces.usage` (degraded/low -> warning, signed out/unavailable -> offline, cooldown -> recovering,
   standby/paused -> paused, exhausted -> failed, needs a seat -> off, live -> working). Write the word-to-key table once,
   in `10-fmt.js`, next to `PMU.fmt`; it maps words only and changes no copy.
3. `src/css/20-board.css`: no box sizes change. If a rule set `stroke-width` on `.pmu-ico svg`, scope it to
   `.pmu-ico svg:not(.nx)` so the neon weight ladder applies.
4. NieR (`96-nier.js`, `90-nier-shell.css`, `94-nier-widgets.css`): remove Usage's own NieR glyph overrides only where
   the neon set's NieR section already does the same (ink tubes, no glow, stepped); keep anything else, and keep no blur
   under NieR (F3-628).

## Must stay

- `data-tool` attributes and aria labels on the card-head buttons (probes use them); D43's per-account control slot.
- Card-head tool weight (PERF-3): `PMG.flat` keeps each tool one path in one svg. Report the room chrome's element count
  before and after, and the room-click main-thread budget (no task over about 50 ms).
- Reduce Motion is instant. No idle motion except Live beats. No glyph act on mount anywhere in Usage; the hover
  ignite is the only glyph motion and follows PMH (src/bridge/pm7-hover-bridge.css).
- Hosted boards (home-panels D10) use the same PMU.icon: PMG must exist before the first board mount on Home (it does:
  the glyph layer is in the head); a gate checks it. No pills, side bars or tinted boxes. Labels >= 11 px.
- Files owned by home-panels (40-board.js, 90-api.js, 15-film.js, 45-menu.js, the board-singleton parts of
  42-cards.js): do not edit; list any change they would need.

## Gates (all must pass; attach the outputs)

- `python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7` then `--check`.
- On ubuntu-p1000: `~/pm-scratch/usage-pm7-20261009/qa/walk.mjs` + `cmp.py`, before and after, and `usage_boot.mjs`
  in published mode (t3-usage-pm7's gates).
- A GPU film (P1000, `agent-browser --record --codec h264`) of the Usage page in all ten looks plus Reduced Motion,
  hovering the card-head tools and an alert row; frame strips of the hover and of a plate at idle (it must not move).
- A 1920 room-change film in glass-dark and nier (no glyph flickers or redraws mid-entrance), and an idle strip of
  6 s with Live paused and 6 s with Live on, where only beat cells may change.
- `window.PMG` exists before the first board mount on Home (log it in the boot check).
- Every state mark >= 3:1 on its field in every look (the catalog's measure, `PMG_CATALOG.contrastOf` logic).

## D43 (account switch-level control, concept/usage-d43-20261010, lands after the panels and terminal publish)

t3-usage-pm7, 2026-10-11. The control adds `.pmu-accsw` (button), `.pmu-accswi` (its glyph box with
`<i class=is-link>` = PMU.icons.link, "follows provider", and `<i class=is-own>` = PMU.icons.notch, "own level"),
`.pmu-accswv`, the SWITCH AT column (`.pmu-accswcell` / `.pmu-accsww` / `.pmu-accswcap`), the stacked form
(`.pmu-accactcell.is-stack` / `.pmu-accactw`), row class `.pmu-accrow.is-swbtn` and plate `.pmu-acc[data-sw]`.
- `is-link` -> the set's `link` (concept role, 14 px, through PMU.icon like every other name).
- `is-own` -> keep PMU.icons.notch exactly: it must stay identical to the meters' own notch (not a glyph).
- The menu's "Open in Settings" row: gear -> `settings`.
If the rollout runs before D43 lands, leave a note in the D43 branch's files instead of editing them.
