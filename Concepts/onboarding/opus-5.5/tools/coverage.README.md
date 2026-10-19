# PM7 harness coverage

`--coverage <union.json>` is opt-in. Without it, the harness does not enable the
profiler, CSS tracking, or coverage navigation wrappers. Keep one union per page.
Run harnesses writing the same file serially; independent processes should write
separate files, then merge with the exported `mergeCoverage(base, sample)`.

The switch is supported by `scenarios.mjs`, `draft_matrix.mjs`,
`onboarding_explorer.mjs`, `state_shots.mjs`, `shots.mjs`, `boot_check.mjs`,
`hover14.mjs`, `settings_nopills_accept.mjs`, `pill_check.mjs`,
`tour_scenarios.mjs`, `contrast_worst.mjs`, and the layer tools `usage_boot.mjs`
and `rail_boot.mjs`. `owner_fixtures.mjs` is exercised through `scenarios.mjs`.
The current selector/visual diagnostics `active_descendant_guard.mjs`,
`art_joints.mjs`, `nier_hue_audit.mjs`, and `onboarding_label_check.mjs` also accept
the switch. The label comparison covers its candidate only.
The boot comparison tools cover only their tested page, excluding the historical
reference. For `rail_boot`, the tested page and reference must belong to the same
page union; use a separate run/file for the published and review pages.

For the raw CDP driver, pass `coverageFile` to `chrome.mjs`'s `launch()` or
`drive.mjs`'s `open()`. For an attached Playwright page, call
`const finish = await coverPage(page, coverageFile)` before its first navigation,
and `await finish()` in `finally`, before closing the page/context. Coverage is
flushed before each `goto`/`reload` so Chrome cannot discard the old stylesheet
IDs or V8 execution context first. The caller still owns browser cleanup.

## Data and interpretation

The raw union stays version 2. `script` and `sheet` keys are the first 16 hex
characters of SHA-256 over CDP source text. Offsets are **UTF-16 code units**
relative to that source. They are not byte offsets. CSS rows merge with OR;
function/range counts add, including explicit zeros. Scripts also carry
`usedRanges`, calculated by resolving nested zero ranges **within each sample**
before taking their union. Applying nested zeros after adding counters can erase
bytes a different run executed.

Native sample normalization stamps each script with
`usedRangesProvenance: "per-sample-v1"`. Copying and merging preserve that marker
only when every contributing entry already carries it and supplies `usedRanges`.
Legacy aggregates become `unknown-merged-counters`; the collector never rebuilds
their byte union from accumulated function counters. Positive ranges can still
retain code, but uncertified remainders cannot establish unused bytes.

`stylesheets` records installed stylesheet hashes, including sheets with no
matching rules. A missing source remains unknown. A failed harness still
contributes everything it touched.

Generate a complete static-page census and source map with:

```sh
PM7_ANALYSIS_MODULES=/path/to/node_modules node Concepts/onboarding/opus-5.5/tools/coverage_summary.mjs \
  Concepts/PMConcept7.html /evidence/raw-union.json /evidence/summary \
  --complete-union /evidence/complete-union.json
```

The analysis module directory must contain `css-tree`, `acorn`, and `acorn-walk`.
Install those outside the repository. The collector itself uses Node built-ins.
The command writes JSON and Markdown, with every style/script block, every static
style rule's selector and offsets, and every static JS function's name, offsets,
and count. Source paths come from the live base manifest, assembly comments, and
the layer generators. Rail `d.css` maps to its authored `.src.css` inputs.

For a fresh capture made before provenance markers existed, an independently
reviewable hash-bound receipt may be passed with `--provenance-receipt FILE`.
It has `version: 1`, `kind: "pm7-coverage-per-sample-provenance"`, and a `unions`
array whose accepted entry exactly matches the input's absolute `path` and full
`sha256`, lists its verified `script_hashes`, has
`origin: "union-of-input-usedRanges"`, and declares
`reconstructed_from_counters: false`. The receipt must retain the source/run and
input-hash evidence for that claim. It does not change or certify legacy input
bytes automatically. Without a native marker or a matching receipt, the summary
reports the remainder as unmeasured rather than unused.

`--complete-union` fills explicit `used:false` rules only for installed/observed
stylesheet hashes and adds uncalled static functions only for observed scripts.
It preserves native counters. An extra function marked `union_projection:true`
expresses the byte union as nonoverlapping ranges for older v2 consumers; its
counts are Boolean byte coverage, not function invocation counts. Prefer
`usedRanges` when calculating executed bytes. Keep the raw union as provenance;
do not feed a completed union back into live collection.

When CDP cannot supply a script's source, its URL/ID fallback cannot establish
which inline block owns the offsets. The summary conservatively carries its
positive offsets as `uncertainRanges` in every compatible block of that page
union, excluding already resolved touches. Those bytes are unmeasured; function
counts are counts from resolved sources and flag overlapping uncertainty.
Unverified fallback range provenance makes the entire remaining block uncertain.
Consumers should return unknown for a probe overlapping `uncertainRanges` unless
`usedRanges` already proves a touch. The legacy projection conservatively retains
both used and uncertain ranges, and marks `includes_uncertain_ranges`.
An unresolved stylesheet's positive offsets similarly suppress false rule rows;
they never become proof of unused CSS. The summary lists unresolved identities.

CSS used and unused bytes count style-rule spans from observed sheets. Fonts,
keyframes, at-rule wrappers, whitespace, and unobserved source bytes are listed
separately as `unmeasured_bytes`. Data script blocks are also unmeasured. Parse recovery notices and unmatched
runtime styles/scripts are reported. A CSS usage range overlapping a static rule
conservatively retains it. Neither an unused row nor an unobserved row alone is
permission to remove code; the static analysis and parity evidence remain required.

Collector regression checks: `node --test Concepts/onboarding/opus-5.5/tools/coverage_union.test.mjs`.
