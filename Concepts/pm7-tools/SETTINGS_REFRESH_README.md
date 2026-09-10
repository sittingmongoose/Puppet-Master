# Settings managers refresh (T50) — how the published TestPMConcept is built now

`Concepts/TestPMConcept.html` is generated. Never hand-edit it.

## Rebuild / verify the published file

```sh
python3 Concepts/pm7-tools/build_testpm_settings_refresh.py            # writes Concepts/TestPMConcept.html
python3 Concepts/pm7-tools/build_testpm_settings_refresh.py --check    # published bytes == fresh build
python3 Concepts/pm7-tools/build_testpm_settings_refresh.py --out <scratch>/TestPMConcept.html --report <scratch>/report.json
```

The base is the exact published file recorded in `settings_refresh_checkpoint.json`
(`base/TestPMConcept-settings-refresh-base.html`, pinned at commit `0fd770946c`). A base
mismatch aborts; there is no silent repin. The transform is also registered as **T50** in
`build_pm7.py` (`settings_refresh_source.apply`), so the full pipeline carries the same
change; the checkpoint lane is what publishes, because the full pipeline currently also
contains the unpublished guided-tour reload guard in `guided_tour_source.py`.
`--parity <build_pm7 output.html>` asserts both paths produce identical Settings blocks.

`build_testpm_layout_b06.py --check` no longer matches the published file: the B06 lane is
predecessor lineage (its CSS-only rollback is inside this lane's pinned base).

## Sources (all authored, all under `settings_refresh/`)

| File | Role |
|---|---|
| `kit.js` | the shared manager kit: primitives (`page`, `section`, `rows`, `stats`, `list`, `listDetail`, `steps`, `advanced`, `quiet`, `empty`, `kv`, `note`, `field`, `pill`, `btn`, `select`, `toggle`, `segmented`, `input`, `chip`, `tech`), the side-panel anatomy (`openDrawer` re-assigned), the setting Details inspector body, the `pm51-*` action router, the workspace registry changes, the entrance-motion fixes and the page-scrolled virtualized All Project Settings list |
| `managers/NN-<name>.js` | one file per manager; each registers `PM51.manager(type, {render})` and its `pm51-<manager>-*` actions |
| `placement.json` | pass 2: the authored placement map (managers, subgroups, keyword overrides, synthetic sections, surviving pages, page defaults, hand moves, retired workspaces, domain labels); injected as `PM51_PLACEMENT`, validated at build time, resolved at boot by the kit's placement block so every concept id renders exactly once |
| `data.d/*.json` | pass 2: per-manager fixture files deep-merged over `data.json` at build time (objects merge, arrays replace) |
| `styles.css` | `<style id="pm51-settings-refresh">`, injected before `</head>` after the pm50 block; tokens only, no accent stripes |
| `data.json` | canonical fixtures: 13 AI services, 12 code-service rows (13 forge profiles), 7 sounds (6 labelled demo tones + 1 unavailable upload), server/project location, doctor groups, skills, plugins, MCP servers, commands and shortcuts, and the smaller extras copied into `state.pm51` |

`settings_refresh_source.py` replaces the provider, forge, event and sound fixture bands inside
the Settings data IIFE, makes every built-in sound row a labelled demo tone, exports the reference
row factory and widens the catalog and search walkers to any workspace that carries sections,
injects the CSS block, injects `PM51_DATA` and `PM51_PLACEMENT`, and appends the concatenated kit +
managers module right before `boot()` (after T49 and narrow v3, so the re-assigned renderers win).
`validate_placement` aborts the build when a placement rule matches no id, an id resolves twice or
not at all, a destination manager or tab does not exist, or a check-labelled inline action row sits
outside Advanced. Every non-Settings `<script>` is asserted
byte-identical; the builder runs `node --check` on all scripts and the pm6 no-emoji checker.

Dev aid: `PM51_MANAGERS=40-,10-` limits which manager files are concatenated (used while
several people write managers at once).

## What changed for the user (the plan behind it: `~/.claude/plans/i-want-you-to-hashed-iverson.md`)

* every manager rebuilt on one kit: no top action bar, ≤ 6 tabs, one Advanced disclosure per
  view, one quiet action row, exactly one check per connectable entity, plain-English copy;
* four promoted workspaces under Code & Tools (Skills, Plugins, MCP Servers, Commands & Shortcuts);
  one merged System workspace "Server & Project Location" (`servers`) replacing Servers &
  Installation + Project Location & Sync; Single Owners and Browser & SCM governance folded into
  Advanced disclosures; Back Seat Driver rebuilt as a real manager;
* side panels and the setting Details inspector share one anatomy (same spring motion; the
  inspector keeps its 350 px token); no accent stripes anywhere; no emoji;
* canonical AI-service and code-service inventories; all built-in sounds play (labelled demo tones);
* All Project Settings scrolls with the page (still variable-height virtualized);
* domain switches no longer blank: first frame ≥ 85 % of settled brightness (measured).
* navigation lands exactly: workspaces above the target are hydrated before the scroll, so a
  Home card or rail click no longer drifts into the wrong manager while placeholders grow
  (measured before the fix: Doctor landed ~870 px low and the scroll spy lit "Backup & Restore");
  cross-domain landings are instant, same-domain tab jumps keep the smooth scroll;
* host-driven re-renders (theme, density, host projections) keep the reader's place: the kit
  turns a same-domain `renderApp()` without navigation intent into a soft remount anchored on
  the active workspace block, so changing the theme while reading Doctor stays on Doctor;
* roster filters are re-applied after any re-render (`PM51.applyFilters`).

Pass 2 (2026-09-09, user review of pass 1):

* every dropdown in Settings is a themed listbox (`PM51.dropdown`; `PM51.select` is an alias): the
  native `<select>` stays in the DOM hidden beside a trigger so `change-setting`, every
  `PM51.onChange`, dialog `FormData` and `querySelector('select')` consumers keep working; the option
  list is a popout in `document.body` (never clipped by the settings portal) with the chat
  assistant's "sprout" motion (`window.PM6_SPROUT` when present, an identical local class
  choreography otherwise), grouped rows, icon tiles, meta, check mark, search above 12 options and a
  full keyboard model. Engine `renderControl`, `formField`, `inlineSelect` and the All-Settings
  facets are wrapped so no native select is ever visible;
* engine menus (`openMenu`) use the same popout engine (`.pm51-popout.pm51-menu`), as does the
  assistant model / persona picker (`PM51.pick`);
* side panels are hero sheets: icon tile, eyebrow, title, status token, summary, facts, progress
  rail, card sections that reveal in a stagger while the spring settles, sticky footer
  (`openDrawer({icon, eyebrow, status, summary, facts, steps, tone, size, mode})`; the drawer
  spring, backdrop fade and material close are unchanged);
* no pills: `PM51.pill` renders a dot + text status token (`PM51.status`), category labels are
  quiet tags (`PM51.tag`), keyboard keys use `PM51.kbd`;
* rosters (`PM51.listDetail`) stick inside their manager block and their list scrolls on its own
  (`--pm51-doc-h` from a ResizeObserver on the scroller);
* new primitives: `PM51.meter`, `PM51.order`, `PM51.accordion`, `PM51.settingRows`;
* fixtures may be split per manager: every `settings_refresh/data.d/*.json` is deep-merged over
  `data.json` by `load_data()` (objects merge, arrays replace); the events fixture carries stable
  ids and moved into the transform's `events` band.

Registry keys (`Plans/settings_system_contract_fixtures.json`, 38 managers), command ids and
the 887-row inventory are unchanged; workspaces carry `data-manager-key`.

## Verification

```sh
node Concepts/pm7-tools/verify/settings_refresh_checkpoint.mjs Concepts/TestPMConcept.html <out-dir>
node Concepts/pm7-tools/verify/settings_placement_checkpoint.mjs Concepts/TestPMConcept.html <out-dir>
node Concepts/pm7-tools/verify/settings_refresh_film.mjs Concepts/TestPMConcept.html <film-dir> all
python3 Concepts/pm7-tools/verify/settings_refresh_sheet.py <film-dir> <sheet.png> domain-switch,panel-open,panel-close --stride=2 --cols=6
```

`pm_cdp.mjs` is a dependency-free Chrome DevTools driver (Chrome at `/usr/bin/google-chrome`
or `$CHROME`; `file://` only). The checkpoint asserts the contract above and writes
`settings-refresh-checkpoint.json` plus screenshots (checks include the one-check-per-section rule,
the flash metric, panel anatomy, inspector tokens, page-scrolled all-settings, Web Audio sound
playback, roster-filter persistence, theme-change place-keeping, the 8-theme × 3-width matrix with one
dropdown and one menu probed per cell, no visible native select / native disabled / pills, the sprout
dropdown keyboard path, body-portaled menus, the hero sheet reveal, independent roster scrolling and
zero page errors); the placement checkpoint (`settings-placement-checkpoint.json`) walks every
workspace and every manager tab and asserts that the union of `#setting-<id>` and `[data-setting-id]`
rows is exactly the 892 concept ids with none rendered twice and each on the workspace and tab
`placement.json` names (the concept's own 31 hand rows on the plain pages and the five hand rows
that `hand_moves` carries into Toolchain, Commands and Doctor are reported separately), that no
canonical manager-topic row remains on the six plain workspaces, that inline sections precede the
view's single Advanced disclosure with advanced placements first inside it, that the page index lists
every non-advanced inline section under tab captions and its links switch tabs, that All Project
Settings still reads "of 892" with 12 categories, that Details, rail search and `refreshSettingRow`
(plain, tab round-trip and inspector-open soft remount) keep working for moved rows, that the Back Seat
Driver's composed rows keep their segmented override through an engine refresh, and that the runtime
placement audit is clean; the film tool captures true 60 fps frames
in slow motion (`Animation.setPlaybackRate(0.05)` + scaled timers) and the sheet tool tiles
them with frame index and motion time labels for frame-by-frame review. These are browser
concept checks, not native Slint, runtime, provider, delivery or audibility certification.

## Motion facts from the pass-2 frame review (2026-09-09)

* Popouts (dropdown lists, menus) open with the chat sprout: scale 0.72 × 0.48 at the anchor corner to
  1 × 1 over 300 ms with a spring overshoot (measured ×1.025 / ×1.047 at 141 ms) and a 140 ms fade;
  close is 220 ms. The first film frames look "instant" only because the spring covers most of its
  travel in the first 50 ms; measure `getComputedStyle(pop).transform` under
  `Animation.setPlaybackRate(0.05)` before calling it a jump (`scratchpad` probe pattern in the film tool).
* Hero sheets: header from frame 0, icon at 40 ms, status/facts/rail at 110 ms, cards from 150 ms in
  45 ms steps; the settled state adds a soft accent glow through `box-shadow`. While a sheet closes its
  content stays put (`is-closing` keeps the reveal states at opacity 1) so the shell slides out whole;
  the first pass let the body vanish on the first closing frame.
* Sheet-to-sheet handoff (a route's Set up, a command's Preview): the outgoing sheet holds still with no
  second backdrop (`pm51-handoff`) while the incoming one springs in over it (`pm51-handoff-in`, backdrop
  without fade), and the kit removes the outgoing wrap at 270 ms while it is fully covered.
* Accordions animate `grid-template-rows` 0fr → 1fr over 220 ms (ease-out, front-loaded); list reorders
  (accounts, routes) are instant re-renders by design.
* The film scenes that look at the account accordion scroll it into view first (the accounts section
  sits below the fold on Providers); the hover-tag layer shows a tag for whatever element regains focus
  after a sheet closes when the last input was keyboard-like (the film drives clicks from script), which is
  shell behaviour, not part of this lane.

## Known limits and pre-existing findings (2026-09-08)

* The shell page switch Dashboard → Settings (any page) keeps the outgoing Dashboard page in
  flow for ~450 ms because `#panel-dashboard.pm-home-owned { position: relative }` beats the
  pm8 transition's `.primary-content > .page.pm8-page-out { position: absolute }`; both pages
  split the height and Settings snaps up when the outgoing page is cleaned up. Identical on the
  pre-refresh file (commit 0fd770946c); it lives in the shell transform
  (`full_thread_performance_source.py`), not in this lane, and is reported rather than patched
  from here.
* `verify/guided_tour_checkpoint_selftest.mjs` fails on `adoptCheckpointRecovery` (0 !== 1)
  against the current tour script on both the pre-refresh and the refreshed file; the tour and
  onboarding bands are byte-identical before/after this lane (`--check` asserts every
  non-Settings script is unchanged).
* `verify/settings_polish_checkpoint.mjs` (2026-09-07) asserts the pre-refresh manager markup:
  its third check expects exactly one legacy "Set up provider" top-bar CTA, and its sound checks
  drive `[data-action="notification-tab"]` and `.sound-row.is-playing`. Against the refreshed
  build it passes "no audio context created on load" and "provider detail grid contains its
  content", then fails by design at the CTA count (the top bar was removed on purpose). The
  surfaces it covered are asserted by `verify/settings_refresh_checkpoint.mjs` instead (including
  the no-audio-context-on-load rule). It needs `playwright-core` from a module directory
  installed outside the repository (`npm install playwright-core --prefix <dir> --cache
  <dir>/npm-cache`); the lane's own tools need no dependency beyond Chrome and ffmpeg.
