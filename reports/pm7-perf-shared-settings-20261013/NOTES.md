PM7 shared fitting and Settings performance work

Review and landing belong to home-redesign-planner. No main landing is performed by this task. Source is on `fix/pm7-perf-shared-settings-20261013`, from the Settings repair611b2404. M1 also has a separate current-main review branch `fix/pm7-perf-m1-ready-20261014`, final packet c3eef58d7d, so it can land before the remaining work.

M1 is landed by the coordinator’s worker at916059849e on GitHub and NAS. M5 source is committed at d61f00ddce and its repeated main matrix is complete; supplements and films are finishing. M6 and M10 are private candidates. M4’s original PURE-PERF candidate was rejected for different visible rows; the later Opus-approved candidate also fails its reading-anchor contract and is excluded. The coordinator authorized exactly one further focused M4 iteration after M5/M6/M10.

All authored work stays in the shared build transform, Settings layer and the named Settings fragments. Liquid Glass, wallpaper, terminal, art, hover, Wizard and Orchestrator authored source is untouched. Generated HTML is written only by the three project generators. Per-fix commits are pushed to GitHub and NAS.

Measurements use immutable before/after artifacts on Windows RTX3090, Chrome155.0.8059.40,1920×1080,DPR1, with alternating artifact order. Primary repeated cases have three cold documents and ten warm repetitions per look. CPU and film runs are separate, with no other driver on Windows during measurement. Task/Style/Layout are cumulative CDP duration deltas over the action and fixed3-second settlement; costs overlap. Largest task is traced renderer RunTask wall duration. Restyled elements are summed visits across style passes, including the page’s embedded frames, rather than unique DOM elements. Event Timing is trusted-click-to-paint with8ms quantization; it is separate from film-based first visible content feedback. Auto system-scheme supplements have three cold observations per direction and artifact.

M1 — shared PMPillFit

The guarded build transform retains the full/abbreviated/symbol ladder, dependent order, second pass and drag behavior. It fits visible panes before their first paint, batches local intrinsic probes, avoids equal writes and uses conservative content/width/font/theme/visibility signatures. The pinned input is unchanged.

The frozen611-base proof contains840 action windows and420 matching UI pairs across all ten looks. First/settled narrow220/wide500 fitting adds360 records; final frozen pages add72 records and56 long-label/font/visibility records, all matching. `m1-measurements.json` and `m1-phase-measurements.json` contain median/p95 and cold/warm results.

Current-main proof is in `reports/pm7-perf-m1-ready-20261014/`:220 windows/110 pairs, with two truncated focus-HTML diagnostic strings differing in attribute order but the same #themeSelect focus;72 first/settled pane comparisons and15 drag/font pairs match. Normal/application-reduced hardware films contain22 actions each. Both stop attempts failed gracefully, but recovery clips independently decoded completely, with both calibration sequences and exact owned-PID[] receipts. Sampled native first-state/motion review is complete. No claim of bit-identical encoded pixels or savings for cold Settings/General/warm return is made.

Current-main Basic Dark medians and separate normal-film observations:

| Case | Task ms | Style ms | Layout ms | Largest task ms | Restyled visits | First body/rail feedback ms |
|---|---:|---:|---:|---:|---:|---:|
| Files → Search | 1019.5 / 786.6 | 356.2 / 117.0 | 37.4 / 7.6 | 285.4 / 45.2 | 15125 / 6662 | 545.2 / 150.2 |
| Basic → Friendly | 1520.4 / 1213.3 | 897.5 / 541.1 | 75.5 / 36.5 | 499.2 / 208.9 | 31861 / 21649 | 717.5 / 489.6 |
| Friendly → Glass | 2652.8 / 2560.5 | 1778.4 / 1659.1 | 167.6 / 69.6 | 639.2 / 439.4 | 48318 / 39414 | 1137.8 / 996.0 |

CPU columns have13 observations per artifact. Film columns have one observation per artifact with±24.17ms calibration/capture bound. Cold Settings entry, General entry and warm return do not establish a material M1 benefit. Glass entry improves layout and peak tasks; substantial remaining Glass work keeps total cost high. The independent landing worker also reports144 first/settled comparisons and hover14 passing on the rebuilt Wizard composition; its single P1000 timing pair is separate from this Windows proof.

Frozen M1 manifest: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m1-repeated-v2/evidence-manifest.json`, SHA-256 `06ec67e35534198dc4b5904dfa139b0f34b70686529487180459b9aa2fba6f40`. Current M1 manifest: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m1-current-evidence-manifest.json`, SHA-256 `d4690be12250ab2b76cfcdbae7ecdeaf754c300d994617d17b2e4ab154dd857d`.

M4 — Settings shell reuse, excluded

The initial candidate changed soft-restored rows: Glass Light1597→1200px and NieR Dark1631→1200px. Its gains are rejected prototype measurements, not delivered improvements. The Opus decision and pilot table are in `M4-OPUS-DECISION.md`.

Opus then authorized the explicit reading-anchor/arrival contract in `/mnt/Cursor/share/puppet-master/2026-10-13-perf-fixes/M4-DESIGN-DECISION.md`, SHA-256 `df7fa857254291a428bc6d9ef6411e1b586beee52aec8a11557ece98ee257df0`, under coordinator authorization1014005302-af53. Private prototype12 received an authorized P1000 probe:30 cases,25 without asserted failure and5 flagged. Actual bottom drift is10px; Glass also bounces. The comparator overcounts pre-existing will-reveal flags and unrelated hidden-workspace section defaults. `M4-APPROVED-CONTRACT-FAILURES.md` contains exact failures and raw hashes. No M4 source is shipped. One focused iteration is authorized after the remaining pure-performance fixes; if it still fails, source/checkpoints/raw evidence go back to Opus.

M5 — theme geometry fan-out

Interactive theme changes dispatch one scoped geometry event. Necessary geometry and popup/focus consumers remain; native resize, initial bootstrap and active Wizard/Orchestrator/onboarding routes retain the legacy resize behavior. Sticky-strip rectangles are read before changed classes are written. Actual viewport dimensions extend M1’s cache signatures for native resize.

Compatibility proof:312 snapshots/156 pairs across all ten looks, with matching visible geometry, fits, focus, popup outcomes and saved state. One Glass Light startup inline search-width declaration differs while its rendered width stays178px and its fit staysfull. The matrix covers font changes, native1600×900→1920×1080 resizing, sticky strips and popup dismissal.

Primary repeated proof:728 windows/364 matching UI pairs, three cold and ten warm observations per look, for mode, Auto and family picks. Synthetic resize deliveries change1→0 and scoped geometry deliveries0→1. Mode/family/Auto total CPU results are small or mixed, so broad savings are not established. Median/p95 and separated cold/warm results are in `m5-measurements.json` and `m5-phase-measurements.json`.

M5 primary medians, before / after:

| Look / case | Task ms | Style ms | Layout ms | Largest task ms | Restyled visits | Event Timing ms |
|---|---:|---:|---:|---:|---:|---:|
| basic-dark / theme-auto | 995.2 / 983.8 | 123.0 / 119.9 | 88.6 / 85.8 | 44.4 / 44.9 | 7083.0 / 7097.0 | 96.0 / 104.0 |
| basic-dark / theme-family | 1285.2 / 1263.4 | 548.2 / 531.2 | 29.7 / 28.9 | 215.9 / 210.6 | 21243.0 / 21044.0 | 472.0 / 464.0 |
| basic-dark / theme-mode | 1155.1 / 1164.7 | 417.0 / 417.3 | 11.0 / 11.0 | 182.9 / 189.6 | 21379.0 / 21442.0 | 296.0 / 296.0 |
| basic-light / theme-auto | 1279.6 / 1269.2 | 411.6 / 414.2 | 78.3 / 79.8 | 177.7 / 185.1 | 21116.0 / 21159.0 | 280.0 / 296.0 |
| basic-light / theme-family | 1254.0 / 1255.4 | 538.3 / 544.1 | 28.0 / 27.5 | 207.7 / 205.9 | 22315.0 / 22198.0 | 456.0 / 464.0 |
| basic-light / theme-mode | 1164.7 / 1162.5 | 426.7 / 431.3 | 11.1 / 11.6 | 182.0 / 186.4 | 22012.0 / 21460.0 | 304.0 / 312.0 |
| friendly-dark / theme-auto | 953.3 / 938.1 | 118.9 / 117.1 | 85.4 / 78.8 | 43.5 / 43.7 | 6947.0 / 7047.0 | 96.0 / 96.0 |
| friendly-dark / theme-family | 1286.4 / 1254.3 | 541.0 / 535.5 | 37.2 / 35.2 | 214.5 / 212.4 | 22323.0 / 21853.0 | 472.0 / 472.0 |
| friendly-dark / theme-mode | 1132.8 / 1134.1 | 426.0 / 420.9 | 11.3 / 10.4 | 191.1 / 188.3 | 21193.0 / 20930.0 | 304.0 / 304.0 |
| friendly-light / theme-auto | 1269.7 / 1285.9 | 422.7 / 418.5 | 79.1 / 79.0 | 183.6 / 181.5 | 21271.0 / 21285.0 | 304.0 / 288.0 |
| friendly-light / theme-family | 1276.8 / 1284.6 | 534.6 / 522.4 | 36.4 / 36.7 | 215.5 / 209.1 | 21630.0 / 20799.0 | 472.0 / 464.0 |
| friendly-light / theme-mode | 1148.8 / 1149.0 | 429.9 / 429.8 | 10.9 / 10.5 | 183.7 / 187.9 | 21358.0 / 21239.0 | 312.0 / 312.0 |
| glass-dark / theme-auto | 1113.4 / 1087.8 | 231.2 / 226.7 | 101.8 / 100.4 | 55.0 / 58.8 | 8859.0 / 8810.0 | 128.0 / 136.0 |
| glass-dark / theme-family | 1420.4 / 1419.1 | 667.1 / 660.5 | 33.4 / 33.3 | 360.0 / 354.9 | 24707.0 / 24413.0 | 560.0 / 544.0 |
| glass-dark / theme-mode | 1623.9 / 1656.9 | 834.3 / 845.5 | 7.6 / 7.8 | 237.8 / 240.1 | 31252.0 / 31134.0 | 384.0 / 384.0 |
| glass-light / theme-auto | 1756.0 / 1721.2 | 831.2 / 803.2 | 78.2 / 75.7 | 227.2 / 222.1 | 31710.0 / 31726.0 | 360.0 / 360.0 |
| glass-light / theme-family | 1396.0 / 1379.4 | 658.4 / 642.8 | 33.9 / 32.9 | 354.9 / 347.0 | 24034.0 / 23927.0 | 544.0 / 528.0 |
| glass-light / theme-mode | 1589.6 / 1599.3 | 817.0 / 820.5 | 7.7 / 7.5 | 233.2 / 230.3 | 31400.0 / 31821.0 | 392.0 / 376.0 |
| nier-dark / theme-auto | 1127.9 / 1138.8 | 160.8 / 167.8 | 83.6 / 84.7 | 39.9 / 39.1 | 15494.0 / 16178.0 | 80.0 / 80.0 |
| nier-dark / theme-mode | 1353.1 / 1220.8 | 530.5 / 527.0 | 10.0 / 9.4 | 255.3 / 255.5 | 25604.0 / 25251.0 | 352.0 / 360.0 |
| nier-light / theme-auto | 1497.0 / 1524.0 | 530.7 / 536.1 | 83.5 / 78.2 | 248.2 / 249.7 | 26253.0 / 27045.0 | 344.0 / 344.0 |
| nier-light / theme-mode | 1324.2 / 1332.4 | 544.7 / 539.2 | 10.3 / 9.9 | 254.4 / 250.3 | 25909.0 / 26581.0 | 376.0 / 368.0 |
| retro-dark / theme-auto | 1006.5 / 994.3 | 123.6 / 120.0 | 86.4 / 82.8 | 44.8 / 47.5 | 7110.0 / 7092.0 | 96.0 / 104.0 |
| retro-dark / theme-family | 1183.5 / 1156.7 | 451.8 / 442.5 | 35.2 / 34.9 | 216.5 / 210.9 | 18711.0 / 17627.0 | 368.0 / 360.0 |
| retro-dark / theme-mode | 1156.2 / 1152.3 | 390.2 / 392.2 | 12.1 / 11.4 | 187.8 / 192.6 | 20089.0 / 20137.0 | 296.0 / 304.0 |
| retro-light / theme-auto | 1243.3 / 1296.8 | 388.4 / 390.9 | 73.8 / 79.0 | 181.4 / 181.8 | 20753.0 / 20702.0 | 288.0 / 288.0 |
| retro-light / theme-family | 1139.3 / 1122.5 | 430.5 / 430.3 | 34.7 / 33.4 | 214.0 / 202.9 | 18139.0 / 17743.0 | 368.0 / 352.0 |
| retro-light / theme-mode | 1142.2 / 1138.4 | 390.6 / 386.8 | 11.4 / 12.2 | 184.2 / 184.2 | 20394.0 / 20723.0 | 304.0 / 312.0 |

Auto responding to actual emulated system Dark→Light→Dark has120 additional CPU windows/60 matching pairs, three cold observations per artifact and look. `m5-scheme-measurements.json` holds all CPU/peak/restyle values; no trusted click exists for that external change. Geometry counters show32→19 event callbacks and2→1 actual sticky-strip geometry passes in BasicDark,GlassLight,NieRDark. This separate instrumented run is not used for CPU savings. Native density/font/resize/popup proof is complete; films are running.

Failed attempts are retained. The first repeated run lost its owned HTTP server at port8879; the cause was not established. Five complete looks and three unmatched baseline windows were retained, and the driver now rejects wrong/error/unready documents. The later M1 priority stop and landing-gap stops preserve every completed action. Final groups are assembled only from complete13-observation look groups. One Auto comparator invocation used its wrong default artifact names and foundzero pairs; the corrected explicit before/after invocation verifies60 pairs withzero differences. No zero-pair run is treated as proof.

M6 — atomic theme application and repeated saves, private

Candidate7 exposes family+mode application preserving Auto and NieR, avoids equal root/chrome writes and reuses a successful unchanged save within a synchronous operation. Persistence remains immediate; owner commands are sent independently. Public save returns stayundefined. Project/registry/storage guards and receipt invalidation prevent reuse after changed or failed persistence.

Mechanism proof has106 cases/53 matching state, return and saved-byte pairs in BasicDark,GlassLight,NieRDark. Trusted family/mode paths use one atomic API and one changed root write instead of two APIs/two writes; one four-save path becomes two full saves. Three repeated accepted owner commands still produce three owner transactions. Refused/read-only paths remain unchanged. `m6-mechanism-measurements.json` reports save/JSON counts and inclusive timing separately from whole-action CPU. This does not establish a whole-action speedup. Open-Details motion/focus, three identical failed-storage retries, all-look Auto/label/geometry checks and whole-action timings/films remain pending.

M10 — NieR placement, private

Candidate2 shares one target rectangle and zoom value only inside one placement callback, skips equal transforms and coalesces same-target requests before the existing widening-tab frame. It retains lock/scroll timers, the210ms steps(3) bracket animation and two-frame jump behavior. No geometry persists across callbacks. Dark/Light chosen/focus/scroll/zoom/moving-target and first-frame proof, matched CPU measurements and films remain pending.

Raw evidence is under `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013`. Required failures and superseded attempts are kept. The immutable M5/M6/M10 artifact/source/initial-driver bundle is `m5-m6-m10-artifacts/manifest.json`, SHA-256 `3db706ebf2e5411c14fb9463180f120dfa8a852075ab5c7a9aca250b8605d737`; later helper revisions will be sealed separately. Reports contain compact summaries, not raw captures. Final task cleanup and final result status remain pending.

Density supplement:42 records/21 pairs showed one initial BasicDark title-search width difference of0.11px and one invisible GlassLight inline declaration difference. The first run navigated before clearing previous stored state, so boot inputs were a confound. The BasicDark repeat has14 matching records/7 pairs. A controlled clear-before-load startup matrix adds12 matching records/6 pairs across BasicDark/GlassLight; all six native title-search pixel crops match exactly. No source changed for these retests, and the initial observations are retained. No repeatable M5 title-geometry change is established.

M6 open-Details supplement:6 cases/3 pairs match. During all sampled frames the scroll position stays1200px, the inspector remains settled, its left edge stays962px (BasicLight/NieRLight) or949px (GlassLight), and the layout is retained. Three identical failed saves each attempt storage three times, with no successful receipt; final restored0.55 is persisted and read back identically. Broader UI/CPU/film proof remains pending.
