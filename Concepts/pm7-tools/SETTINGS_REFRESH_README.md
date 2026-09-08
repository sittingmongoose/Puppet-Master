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
`settings-refresh-checkpoint.json` plus screenshots; the film tool captures true 60 fps frames
in slow motion (`Animation.setPlaybackRate(0.05)` + scaled timers) and the sheet tool tiles
them with frame index and motion time labels for frame-by-frame review. These are browser
concept checks, not native Slint, runtime, provider, delivery or audibility certification.
