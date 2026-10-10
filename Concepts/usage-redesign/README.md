# Usage redesign

The redesigned Usage page of the Puppet Master concept. `Concepts/onboarding/opus-5.5/tools/build.py` is its publish
path: its step 2b calls `tools/usage_layer.py` here to replace the base's old Prism Usage page with the page in `src/`,
and `--publish-pm7` writes the result to `Concepts/PMConcept7.html` (and the same bytes to
`Concepts/Onboarding concepts/TestOpus5.5PmConcept.html`). Never hand-edit the Usage page inside a built page: change
`src/` or `tools/usage_layer.py` and rebuild.

Jared approved the redesign on 2026-10-09 and asked for it in PMConcept7 ("So the UsageTestPMConcept7.html will go away
after you finish"). Two stages, so check which one your checkout is in:
- **Before the publish** (the committed `Concepts/PMConcept7.html` has no `<!-- USAGE:BODY:START -->`): the review copy
  `Concepts/UsageTestPMConcept7.html` still exists and `tools/build_usage.py` writes it; that is the lanes' loop. A
  working tree where `build.py --publish-pm7` ran has the new page in both published pages; never commit them before
  the publish.
- **After the publish** (one coordinator commit, run from `FINAL-PUBLISH.md` in
  `~/PM-Experiments/usage-pm7-20261009/lanes/a-port/`): both published pages carry the new Usage page and the review
  copy is deleted. That deletion is the only one under `Concepts/` and rests on Jared's instruction above.
  `tools/build_usage.py` stays: without the review copy it is a thin wrapper around `build.py` (`--check`, or a private
  `--out` build) and never writes the review copy again.

Status: WOW round, polish round 2 integrated (2026-10-02). The design is
`~/PM-Experiments/usage-redesign-20261001/design/final/DESIGN-SPEC.md` with `DESIGN-SPEC-ATLAS.md` (wins over it),
`WOW-SPEC.md` (the motion and look bar) and the generated `BOARDS.md`; the module contract the three owners (engine,
charts, content) code against is `ARCHITECTURE.md` in the same folder. Every room is built: the rail of 13 rooms, the
one-line head, the board engine placing every room's default board on 12 / 20 / 24 / 30 tracks with move and resize
previews and gravity, the Settings bridge and the review roster, the chart kit, the widget kinds and the room heroes, and
the film core (`PMU.film`). What each round changed and what is open: `INTEGRATION.md` and `INTEGRATION-2.md` there.

## Layout

```
Concepts/usage-redesign/
  README.md
  tools/usage_layer.py    apply(text, need) -> (text, notes), lint(), syntax_check(text), REMOVED, KEPT: opus-5.5
                          build.py calls it at step 2b (apply), in lint_sources() (lint) and syntax_check()/check()
  tools/build_usage.py    review mode (while Concepts/UsageTestPMConcept7.html exists): writes and --checks the review
                          copy from build_text(usage=False) + the layer; published mode (once it is gone): build.py
                          --check, or build.py --out PATH (default <tmp>/usage-pm7/PMConcept7.html)
  tools/usage_boot.mjs    headless boot check: the review copy against its input while the review copy exists, else the
                          published page (or --page, a private build) against a reference build without the Usage layer
                          (build.py --out <path> --no-usage)
  tools/boards.py         default boards of all 13 rooms -> src/js/62-boards-data.js (and --md BOARDS.md); --check validates
  src/markup.html         the #panel-usage markup (root: <div class="pmu-shell" id="pmuApp">), ARCHITECTURE section 5
  src/copy.json           shell strings; src/copy.d/*.json one file per owner (merged; a key in two files fails the build)
  src/roster.json         the review roster: Settings fixture accounts + Usage facts + switch log (ARCHITECTURE section 7)
  src/css/*.css           sorted, concatenated into <style id="pm-usage-css">; owners in ARCHITECTURE section 2.2
                          (05-film.css: the film layers and key light of PMU.film, WOW round; 15-menu.css: the
                          dropdown menu, engine; 70-wrap.css: values wrap instead of ellipsizing, titles before meta,
                          fixer 2026-10-02)
  src/js/*.js             sorted, concatenated into one strict wrapper in <script id="pm-usage-js">; owners in section 2.1
    00-core.js            helpers, copy lookup t(), STORE, icons, state, the command/receipt/event/view-action seam, window.PMU
    05-data.js            every fixture of the old page's DATA object and its constants, unchanged (frozen)
    07-series-data.js     explicit chart series (data only)
    10-fmt.js .. 16-settings.js    formatters and value states, theme, motion, the Settings bridge (engine)
    15-film.js            PMU.film: the film vocabulary (voices, wave, odometer, comet, head glow, sweeps, flash, ring,
                          halo, springs with a settle threshold, the held-then-release entrance, the first arrival and the
                          hover-tag hold deferHoverTags; PMU.film.arcSweep is the chart kit's arc sweep);
                          design/final/WOW-SPEC.md section 10
    18-model.js           PMU.data and PMU.roster (content)
    30-34-charts-*.js     the chart kit (charts)
    40-board.js .. 46-shell.js     board engine, cards and widget registry, inspector, shell (engine)
    45-menu.js            PMU.menu: the one dropdown every Usage menu uses (Chat Assistant 5.6 Pro style and motion; engine)
    50-54-w-*.js          widget kinds (content)
    55-w-heroes.js        the room heroes: skyline (Overview), windows ahead (Plans), attempt timeline (Ledger), authority
                          flow (Source authority) (content, WOW round)
    62-boards-data.js     PMU_BOARDS, generated by tools/boards.py
    70-74-rooms-*.js      widget definitions per room (content)
    90-api.js             window.PM7_USAGE (the contract, ARCHITECTURE section 8) and boot
```

All `src/js` files share one scope (the layer writes the wrapper), so a top-level name may be declared only once across
them. New class names use the `pmu-` namespace: the old `pm7u-` rules that stay in shared stylesheets
(`pm7-architectural-glass-final`, `pm7-t37-contrast`, `pm51-settings-refresh`, `pm6-css-global`) then match nothing.

## Commands

Run from the worktree root. Both stages:

```
python3 Concepts/onboarding/opus-5.5/tools/build.py --out /tmp/u/page.html   # private build of the publish candidate: lint,
                                                                            # node --check, write only that path
python3 Concepts/usage-redesign/tools/boards.py --check                      # the generated default boards are current
node Concepts/usage-redesign/tools/usage_boot.mjs <out-dir> --page /tmp/u/page.html   # boot check of a private build
```

Before the publish (review copy present):

```
python3 Concepts/usage-redesign/tools/build_usage.py           # write Concepts/UsageTestPMConcept7.html (never commit it on a lane branch)
python3 Concepts/usage-redesign/tools/build_usage.py --check   # review copy current, guards hold, TestOpus current with or without Usage
python3 Concepts/onboarding/opus-5.5/tools/build.py --check    # fails on the two published-page staleness lines until
                                                               # --publish-pm7 runs in the working tree (do not commit them)
node Concepts/usage-redesign/tools/usage_boot.mjs <out-dir>    # boot check of the review copy
```

After the publish (review copy gone):

```
python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7   # publish: TestOpus5.5PmConcept.html and PMConcept7.html
python3 Concepts/onboarding/opus-5.5/tools/build.py --check         # lint, syntax, markers, old references gone, outside
                                                                    # contracts kept, both published pages byte-current
python3 Concepts/usage-redesign/tools/build_usage.py [--check | --out PATH]   # the same through the wrapper
node Concepts/usage-redesign/tools/usage_boot.mjs <out-dir>         # boot check of Concepts/PMConcept7.html
```

The dev loop after the publish: change `src/` (or `tools/usage_layer.py`), make a private build with `--out`,
boot-check it with `usage_boot.mjs --page`, look at it on the GPU (the P1000 VM), then publish with `--publish-pm7` and
run `--check`.
`build.py` enforces the base pin (`BASE_SHA256`). Each build lints `src/` (`usage_layer.lint()`, which also runs the
build's page-wide universal-selector lint over the Usage CSS) and runs `node --check` on `pm-usage-js`,
`pm4-settings-js` and `pm-o55-js`. In published mode `usage_boot.mjs` makes its reference page itself (`build.py --out
<out-dir>/reference-no-usage.html --no-usage`: the same sources with the old Prism Usage page) and writes
`<out-dir>/usage-boot.json`; it also takes `[page-under-test] [reference-page]` as plain arguments. Keep `<out-dir>`
outside the repository (for example under `~/PM-Experiments/`). The boot check takes no screenshots and deletes its
Chrome profiles.

## What the layer does

`usage_layer.apply()` guards every step: each anchor must be found exactly once, and each filtered stylesheet must
keep its exact rule count, or the build stops.

1. It replaces the `#panel-usage` band (`<div class="page page-usage" id="panel-usage">` ..
   `</div><!-- page-usage -->`) with the open tag, `<!-- USAGE:BODY:START -->`, `<style id="pm-usage-ctx-css">`, the
   filtered `pm7-t29-usage-final` and `pm7-t32-final`, `<style id="pm-usage-css">`, `src/markup.html`,
   `<script id="pm-usage-js">`, `<!-- USAGE:BODY:END -->` and the close tag. `pm7-t31-usage-final`, the old markup and
   the old Usage script go with the band.
2. It keeps what the rest of the concept needs from the band's stylesheets. From the T21 stylesheet it keeps the chat
   context module's rules: 63, plus the context halves of 6 shared rules. From `pm7-t29-usage-final` it keeps the two
   concept-wide Retro Light rules (`--accent-lime: #2f7a3d`). From `pm7-t32-final` it keeps the global status bar and
   the Home dashboard chrome: 61 rules, plus 1 rewritten. The kept stylesheets keep their ids and their order, so the
   cascade is unchanged.
3. It extracts the chat context module (`window.PM7_CONTEXT`, the Assistant's context ring, popup, details drawer and
   Compact) from the old Usage script. The module is pinned by sha256 `5fb11527...0c1e` and runs inside a shim. The
   shim's `command`, `completeCommandReceipt` and `usageEvent` go through `PM7_USAGE`, and its toasts go to
   `window.toast`. A compaction writes `PM7_USAGE.data.context` and calls `PM7_USAGE.rerender('context')`.
4. Outside the band, it removes `pm7-t24-usage-readability-and-fit` and filters `pm7-t23-adjustments` (75 rules kept,
   215 dropped).
5. It merges the review roster (`src/roster.json` `settings`) into the Settings providers fixture (the one
   `json.dumps(indent=2)` array after `  const providers = ` in `pm4-settings-js`; 22 providers asserted, original accounts
   asserted unchanged) and inserts a once-per-saved-state seed into the providers manager's `migrate()`, so Settings shows
   the same roster as the Accounts room, also in a browser with saved Settings. Every account's Settings usage windows (pct
   and reset words) are written from the roster facts (`align_usage`) and the seed re-aligns saved states, so Settings and
   Usage read the same resets.
6. It adds the new page's class names to the NieR Mode selector lists in the Settings script: the menu cursor
   (`.pmu-navbtn`, `.pmu-poprow`), the chosen brackets (`.pmu-navbtn`), the strip cursor (`.pmu-range button`,
   `.pmu-seg button`) and the page-title decode (`#pmuRoomTitle`, `.pmu-brand h1`) (`NIER_NAMES`).
7. It writes `window.PM_USAGE_COPY` (copy.json + copy.d) and `window.PM_USAGE_ROSTER` (the roster facts) before the page script.

`lint()` runs on every build. It refuses emoji glyphs, any `:has(` in Usage CSS, `border-left` or
`border-inline-start` of 2px or more, class names containing `pill`, the banned copy words of opus-5.5 `build.py` in
`copy.json`, a top-level name declared twice across `src/js`, and any `window` or `document` access in a `*-data.js`
file.

## Contracts the page keeps

The detail is in `understand/cur-xref.md` section 10 and `DESIGN-INPUTS.md` section 7, both under
`~/PM-Experiments/usage-redesign-20261001/`.

- `#tab-usage[data-page=usage]` and `.page.page-usage#panel-usage` keep page routing (`PM_PAGES.go('usage')`) working.
- `window.PM7_USAGE` provides these members:
  - for the `pm6-js-usage` bridge, which registers 10 actions and 3 subscriptions: `spinRefresh`,
    `exportJson(kind)`, `data.accounts`, `data.providers`, `rerender(room?)`, `injectIcons`, `setCooldown`,
    `pm7FlushCooldown` and `appendUsageAttempt`/`appendLedger`, plus `active_account_id`, which the bridge writes;
  - for the globals' liquid-ink boot: `syncNavInk`;
  - for NieR Mode's status-bar readout and Pod 042: `data.context.used/.limit`;
  - for verifiers and the build phase: `state`, `rooms`, `details`, `roomWidgets`, `setRoomDetail`, `selectRoom`,
    `render`, `refresh`, `projectedAttempts`, `setActiveAccount`, `command`, `completeCommandReceipt`, `usageEvent`,
    `viewAction`, `command_log`, `receipt_log`, `event_log`, `view_action_log` and `wiring`.
- The page dispatches the window events `pm:command-dispatch`, `pm:dispatch-receipt`, `pm:usage-event` and
  `pm:usage-view-action`.
- `body.pmu-page-active` is set while Usage shows, and Home's `#pm-home-workspace` takes no pointer events then (the old
  page's rule, kept).

`usage_boot.mjs` checks all of this against the reference build with the old page:
- no new console errors;
- `#pmuApp` is present and `#pm7UsageApp` is absent;
- every `.context-usage` is enhanced, its popup opens, the details drawer opens, and Compact writes
  `PM7_USAGE.data.context`;
- the bridge has 10 actions and 3 subscriptions;
- `PM7_USAGE.data` is identical to the old page's apart from timestamps;
- the status bar shows, Retro Light's green is right, and Home renders;
- the rail has its 13 rooms, and a room switch works;
- the 8 themes and NieR Mode load without errors.

## How it is published

`Concepts/onboarding/opus-5.5/tools/build.py` imports `usage_layer` from `tools/` here and, in `build_text()`, calls
`text, SETTINGS_NOTES['usage'] = usage_layer.apply(text, need)` as step 2b: after the PATCHES loop and the owner
exposures, before the O55 splice. It adds `usage_layer.lint()` to `lint_sources()` and `usage_layer.syntax_check()` to
`syntax_check()`, and `check()` fails on any of `usage_layer.REMOVED`, a missing `usage_layer.KEPT` entry, or a
`<!-- USAGE:BODY:START/END -->` marker that is not there exactly once.

- Order matters. The layer runs after the PATCHES loop, because the patch "usage card cta :has restyle" needs the old
  `.pm7u-card:has(.pm7u-setup-cta)` rule. It runs before the O55 splice, so it never sees the O55 modules; a later
  layer that anchors on `<!-- O55:CSS:END -->` (the left rail's `rail_layer`) runs after the splice. The order in
  `build_text()` is: settings layer, strip, PATCHES (+ NieR, first paint), owner exposures, usage (2b), O55 splice,
  then such a layer.
- `build_text(usage=False)` (`build.py --out <path> --no-usage`) leaves the old page in place. It is a private reference
  build for the boot check only, never published.
- Possible later clean-ups: the NieR selector patches (`NIER_NAMES`) can become plain edits of opus-5.5
  `src/settings/kit.d/19-nier-parts.js`, the page's NieR CSS can move to a `src/settings/styles.d/` file, and the old
  `pm7u` NieR rules can then be pruned.
