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
| `styles.css` | `<style id="pm51-settings-refresh">`, injected before `</head>` after the pm50 block; tokens only, no accent stripes |
| `data.json` | canonical fixtures: 13 AI services, 12 code-service rows (13 forge profiles), 7 sounds (6 labelled demo tones + 1 unavailable upload), server/project location, doctor groups, skills, plugins, MCP servers, commands and shortcuts, and the smaller extras copied into `state.pm51` |

`settings_refresh_source.py` replaces the provider, forge and sound fixture bands inside
the Settings data IIFE, makes every built-in sound row a labelled demo tone, injects the CSS
block and appends the concatenated kit + managers module right before `boot()` (after T49
and narrow v3, so the re-assigned renderers win). Every non-Settings `<script>` is asserted
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

Registry keys (`Plans/settings_system_contract_fixtures.json`, 38 managers), command ids and
the 887-row inventory are unchanged; workspaces carry `data-manager-key`.

## Verification

```sh
node Concepts/pm7-tools/verify/settings_refresh_checkpoint.mjs Concepts/TestPMConcept.html <out-dir>
node Concepts/pm7-tools/verify/settings_refresh_film.mjs Concepts/TestPMConcept.html <film-dir> all
python3 Concepts/pm7-tools/verify/settings_refresh_sheet.py <film-dir> <sheet.png> domain-switch,panel-open,panel-close --stride=2 --cols=6
```

`pm_cdp.mjs` is a dependency-free Chrome DevTools driver (Chrome at `/usr/bin/google-chrome`
or `$CHROME`; `file://` only). The checkpoint asserts the contract above and writes
`settings-refresh-checkpoint.json` plus screenshots (checks include the one-check-per-section rule,
the flash metric, panel anatomy, inspector tokens, page-scrolled all-settings, Web Audio sound
playback, roster-filter persistence, theme-change place-keeping, the 8-theme × 3-width matrix and
zero page errors); the film tool captures true 60 fps frames
in slow motion (`Animation.setPlaybackRate(0.05)` + scaled timers) and the sheet tool tiles
them with frame index and motion time labels for frame-by-frame review. These are browser
concept checks, not native Slint, runtime, provider, delivery or audibility certification.

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
