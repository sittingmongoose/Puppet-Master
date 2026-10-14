M4 is rejected from this implementation branch. It changed visible scroll restoration. An Opus designer needs to decide the required restoration and reveal behavior before shell reuse can proceed.

The private transform retained authored rail/chrome and unchanged soft-render rows while preserving the original hard-navigation stage, focus replacement, popover close path and reveal setup. It never changed Liquid Glass or hover source. The final private version adopted already parsed replacement nodes rather than cloning a second tree.

At the same Windows RTX 3090, Chrome 155.0.8059.40, 1920 × 1080, DPR 1, the final private candidate produced 100 correctness snapshots (50 baseline/candidate step pairs). Eight fields differed. The decisive visible differences were:

| Same action | M1 baseline scrollTop | M4 candidate scrollTop | Effect |
|---|---:|---:|---|
| Glass Light: set document scrollTop to 1200, wait, call renderApp(), sample | 1597 | 1200 | Different rows are visible |
| NieR Dark: same sequence | 1631 | 1200 | Different rows are visible |

Inspector snapshots also differed during arrival, and later saved active-section data differed. The timing of inspector snapshots is not a certified motion comparison. The scroll/visible-row mismatch is sufficient to stop the patch. Retaining source nodes changes the interaction between scroll anchoring, section reveal and the existing restoration/hydration pipeline; this is a diagnosis to investigate, not a proven single cause.

Do not land the private M4 source or HTML. The source has been removed from the deliverable tree. A designer must specify whether to preserve the baseline's exact restored position and first-show sequence, or authorize a visible change. Then an implementation engineer can target that contract and rerun the whole matrix. The candidate's position must not silently be treated as the better product behavior.

Superseded prototype 4 cold pilot medians (three fresh documents per artifact; no ten-run warm certification):

| Case | Task ms before / after | Style ms | Layout ms | Largest task ms | Restyled visits | Event Timing click-to-paint ms |
|---|---:|---:|---:|---:|---:|---:|
| Basic Dark Home → General | 978.7 / 941.0 | 235.9 / 231.4 | 31.4 / 28.9 | 113.6 / 110.3 | 10395 / 10446 | 208 / 224 |
| Basic Dark General → Code | 1398.3 / 1226.2 | 288.0 / 244.2 | 33.7 / 33.2 | 120.3 / 136.5 | 10573 / 10390 | 224 / 240 |
| Glass Light Home → General | 1921.8 / 1780.1 | 939.9 / 883.8 | 82.0 / 72.4 | 258.6 / 230.5 | 26211 / 24945 | 288 / 272 |
| Glass Light General → Code | 2082.9 / 1990.0 | 1022.2 / 944.8 | 82.6 / 76.1 | 280.4 / 246.9 | 30994 / 29343 | 280 / 288 |

These are rejected/superseded prototype results, not a delivered saving. Event Timing is an 8 ms rounded click-to-next-paint proxy; calibrated semantic feedback remains unmeasured for this rejected patch. The final allocation-only prototype was checked for correctness but was not timed or filmed after the parity failure.

Raw evidence is under `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/`: `m4-canary-v1`, `m4-pilot-v1`, `m4-pilot-v2`, `m4-correctness-v2`, `m4-rejected-source`, and the immutable `artifacts/m4-proto*.html` pages. Failed builds and the completed-driver socket cleanup error are retained under `attempts/` and `m4-pilot-v1/`. The evidence manifest supplies individual SHA-256 values.

Rejected M4 evidence manifest: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m4-rejected-manifest.json`, SHA-256 `f042bc4851007fd0b99f67da5aea8dfa1a1255d45df15ad427d72d9a47380156` (284 files, 796,967,114 bytes). Saved section mismatch after inspector entry: baseline `app-chat`, candidate `app-visual` in both affected looks.
