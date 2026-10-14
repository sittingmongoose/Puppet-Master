PM7 shared fitting and Settings performance work

Review and landing belong to home-redesign-planner. No main landing is performed by this task. Source is on `fix/pm7-perf-shared-settings-20261013`, from the Settings repair611b2404. M1 also has a separate current-main review branch `fix/pm7-perf-m1-ready-20261014`, final packet c3eef58d7d, so it can land before the remaining work.

M1 is landed by the coordinator’s worker at916059849e on GitHub and NAS. M5 source is committed at d61f00ddce and its complete proof is ready for coordinator review. M6 testing is complete and its source remains held for the combined bundle. M10 is a private candidate. M4’s original PURE-PERF candidate was rejected for different visible rows; the later Opus-approved candidate also fails its reading-anchor contract and is excluded. The coordinator authorized exactly one further focused M4 iteration after M5/M6/M10.

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

Auto responding to actual emulated system Dark→Light→Dark has120 additional CPU windows/60 matching pairs, three cold observations per artifact and look. `m5-scheme-measurements.json` holds all CPU/peak/restyle values; no trusted click exists for that external change. Geometry counters show32→19 event callbacks and2→1 actual sticky-strip geometry passes in BasicDark,GlassLight,NieRDark. This separate instrumented run is not used for CPU savings. Native density/font/resize/popup proof and normal/reduced hardware films are complete.

Failed attempts are retained. The first repeated run lost its owned HTTP server at port8879; the cause was not established. Five complete looks and three unmatched baseline windows were retained, and the driver now rejects wrong/error/unready documents. The later M1 priority stop and landing-gap stops preserve every completed action. Final groups are assembled only from complete13-observation look groups. One Auto comparator invocation used its wrong default artifact names and foundzero pairs; the corrected explicit before/after invocation verifies60 pairs withzero differences. No zero-pair run is treated as proof.

M6 — atomic theme application and repeated saves, tested and held for the combined bundle

Explicit before m5-proto4 / after m6-proto7 verification passed 728 primary windows / 364 pairs and 120 actual-scheme windows / 60 pairs, with zero snapshot differences. The existing 312-state UI matrix has zero visible geometry, fit, content, focus or saved-state differences; its three auxiliary Glass inline-width declarations remain qualified by the important CSS override. All 53 mechanism pairs, Inspector and failed-storage supplements pass. Four full saves become two and two theme writes become one in the targeted operation, while three equal owner commands still produce three owner transactions.

There is no broad whole-action gain recommendation. Warm Auto Task medians improve from 954.1 to 892.8 ms in Basic Dark, 1035.7 to 959.4 ms in Glass Dark and 1504.5 to 1417.3 ms in NieR Dark. Mode/family and actual-scheme changes are mixed. NieR Dark mode has an observed warm Task regression from 1065.7 to 1653.7 ms; cold medians are also higher. High/low windows occur in both artifacts and differ strongly in animation-frame and Layerize work, but the specific cause remains unresolved. This does not excuse the regression. All per-look cold/warm medians, p95 values and paired changes are in M6-RESULTS.md and m6-measurements.json.

Normal hardware film: 96 actions, 34789 decoded frames, timing bound ±71.77 ms. Application-reduced film: 28 actions across Basic Dark, Glass Light and NieR Dark, 10840 frames, bound ±46.27 ms. Both stops, complete decoding and both calibration sequences passed. All 496 native first/+50/+200/+500 ms samples and six Auto detail comparisons were reviewed. Content, fitting and the sampled transition sequence are retained. Existing control fills, selection ink and Glass completion differ in phase; exact compressed pixels are not claimed. Unchanged-body Auto feedback is the choice transition, separately labeled. These are one observation per side and do not establish a population feedback speedup.

Evidence: /mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m6-evidence-manifest.json, SHA-256 05792007279f21d49230f6edff1fc50d52d541e3101bc5cf202b75b2e495ae12 (2532 files). Source is a review candidate; the combined current-main comparison decides whether it earns a landing.

M10 — NieR placement, private

Candidate2 shares one target rectangle and zoom value only inside one placement callback, skips equal transforms and coalesces same-target requests before the existing widening-tab frame. It retains lock/scroll timers, the210ms steps(3) bracket animation and two-frame jump behavior. No geometry persists across callbacks. Dark/Light chosen/focus/scroll/zoom/moving-target and first-frame proof, matched CPU measurements and films remain pending.

Raw evidence is under `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013`. Required failures and superseded attempts are kept. The immutable M5/M6/M10 artifact/source/initial-driver bundle is `m5-m6-m10-artifacts/manifest.json`, SHA-256 `3db706ebf2e5411c14fb9463180f120dfa8a852075ab5c7a9aca250b8605d737`; later helper revisions will be sealed separately. Reports contain compact summaries, not raw captures. Final task cleanup and final result status remain pending.

Density supplement:42 records/21 pairs showed one initial BasicDark title-search width difference of0.11px and one invisible GlassLight inline declaration difference. The first run navigated before clearing previous stored state, so boot inputs were a confound. The BasicDark repeat has14 matching records/7 pairs. A controlled clear-before-load startup matrix adds12 matching records/6 pairs across BasicDark/GlassLight; all six native title-search pixel crops match exactly. No source changed for these retests, and the initial observations are retained. No repeatable M5 title-geometry change is established.

M6 open-Details supplement:6 cases/3 pairs match. During all sampled frames the scroll position stays1200px, the inspector remains settled, its left edge stays962px (BasicLight/NieRLight) or949px (GlassLight), and the layout is retained. Three identical failed saves each attempt storage three times, with no successful receipt; final restored0.55 is persisted and read back identically. The all-look UI matrix, complete CPU matrices and hardware films are now complete; the M6 result above records their limits and held verdict.

M5 hardware-film first feedback, before / after ms (one observation per artifact; normal bound±42.17ms, application-reduced bound±48.32ms):

| Look / case | Normal | Application reduced | Region |
|---|---:|---:|---|
| basic-dark / mode-opposite | 380.0 / 267.9 | 367.3 / 261.9 | main Settings body |
| basic-dark / mode-auto | 322.9 / 239.5 | 295.5 / 236.7 | main Settings body |
| basic-dark / scheme-light | 647.4 / 628.2 | 654.6 / 557.5 | main Settings body |
| basic-dark / scheme-dark | 629.0 / 544.5 | 590.8 / 606.3 | main Settings body |
| basic-dark / family-next | 870.3 / 568.7 | 825.9 / 463.3 | main Settings body |
| basic-light / mode-opposite | 385.7 / 306.8 | not sampled | main Settings body |
| basic-light / mode-auto | 159.7 / 169.9 | not sampled | clicked choice region; unchanged body |
| basic-light / scheme-light | 682.8 / 596.7 | not sampled | main Settings body |
| basic-light / scheme-dark | 749.2 / 579.0 | not sampled | main Settings body |
| basic-light / family-next | 680.9 / 518.2 | not sampled | main Settings body |
| friendly-dark / mode-opposite | 344.1 / 351.4 | not sampled | main Settings body |
| friendly-dark / mode-auto | 367.3 / 306.6 | not sampled | main Settings body |
| friendly-dark / scheme-light | 625.0 / 654.1 | not sampled | main Settings body |
| friendly-dark / scheme-dark | 641.4 / 604.5 | not sampled | main Settings body |
| friendly-dark / family-next | 555.2 / 592.2 | not sampled | main Settings body |
| friendly-light / mode-opposite | 419.9 / 341.5 | not sampled | main Settings body |
| friendly-light / mode-auto | 152.7 / 156.6 | not sampled | clicked choice region; unchanged body |
| friendly-light / scheme-light | 667.8 / 636.9 | not sampled | main Settings body |
| friendly-light / scheme-dark | 733.3 / 701.6 | not sampled | main Settings body |
| friendly-light / family-next | 601.1 / 562.9 | not sampled | main Settings body |
| retro-dark / mode-opposite | 427.4 / 370.1 | not sampled | main Settings body |
| retro-dark / mode-auto | 335.5 / 375.9 | not sampled | main Settings body |
| retro-dark / scheme-light | 669.4 / 664.0 | not sampled | main Settings body |
| retro-dark / scheme-dark | 682.5 / 791.2 | not sampled | main Settings body |
| retro-dark / family-next | 509.4 / 397.9 | not sampled | main Settings body |
| retro-light / mode-opposite | 382.2 / 376.9 | not sampled | main Settings body |
| retro-light / mode-auto | 121.4 / 129.4 | not sampled | clicked choice region; unchanged body |
| retro-light / scheme-light | 702.8 / 635.4 | not sampled | main Settings body |
| retro-light / scheme-dark | 813.1 / 825.6 | not sampled | main Settings body |
| retro-light / family-next | 501.5 / 397.4 | not sampled | main Settings body |
| glass-dark / mode-opposite | 496.9 / 651.9 | not sampled | main Settings body |
| glass-dark / mode-auto | 420.3 / 476.3 | not sampled | main Settings body |
| glass-dark / scheme-light | 811.0 / 865.9 | not sampled | main Settings body |
| glass-dark / scheme-dark | 845.2 / 1013.6 | not sampled | main Settings body |
| glass-dark / family-next | 660.6 / 672.4 | not sampled | main Settings body |
| glass-light / mode-opposite | 408.5 / 526.9 | 442.0 / 500.4 | main Settings body |
| glass-light / mode-auto | 187.4 / 198.6 | 157.7 / 131.6 | clicked choice region; unchanged body |
| glass-light / scheme-light | 794.9 / 833.3 | 777.7 / 855.4 | main Settings body |
| glass-light / scheme-dark | 924.2 / 986.4 | 684.1 / 891.6 | main Settings body |
| glass-light / family-next | 779.3 / 757.4 | 651.6 / 578.6 | main Settings body |
| nier-dark / mode-opposite | 517.4 / 598.3 | 506.9 / 607.6 | main Settings body |
| nier-dark / mode-auto | 493.7 / 527.7 | 461.1 / 483.5 | main Settings body |
| nier-dark / scheme-light | 972.3 / 1059.6 | 941.6 / 992.1 | main Settings body |
| nier-dark / scheme-dark | 1014.7 / 1151.9 | 929.1 / 1209.8 | main Settings body |
| nier-light / mode-opposite | 535.5 / 564.2 | not sampled | main Settings body |
| nier-light / mode-auto | 190.2 / 154.5 | not sampled | clicked choice region; unchanged body |
| nier-light / scheme-light | 1008.7 / 1092.9 | not sampled | main Settings body |
| nier-light / scheme-dark | 966.9 / 985.2 | not sampled | main Settings body |

The normal movie contains96 actions/35579 decoded frames across all ten looks. The reduced movie contains28 actions/10899 frames across BasicDark,GlassLight,NieRDark. Both calibrations and all actions are present, both recorder stops are complete, and independent decode passed. Mode/family timing starts at trusted pointerdown; emulated system-scheme timing starts at a browser-clock timestamp before the CDP command and includes transport. When Auto leaves the body unchanged, first feedback is the selected choice indicator; its native crop was reviewed. First,+50,+200,+500ms samples retain the same destination content, first-state fit and transition sequence. Asynchronous row/optical completion varies in phase, so this is not a claim of identical compressed pixels in every frame. No broad feedback speedup is established by these single observations.

The initial body-only analysis found no body change on ten normal/two reduced Auto actions; those analyses and the failed extraction are retained. The action-specific choice-region correction provides measured feedback and is labeled in the table. The lower-memory decoder matches the sealed8100-frame/22-action M1 analysis exactly, including calibration and latency values.

M5 evidence manifest: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m5-evidence-manifest.json`, SHA-256 `e6a42891c04cefb13a5b7b6e5589b688b19235b606b4ded45a17c28a1ca66a77` (2765 files). M5 is ready for coordinator review; M6/M10/M4 work continues. No main landing was performed.

The current-main bundle worktree remains unmodified on 916059849e. Its pinned private baseline has SHA-256 27cb521dbee73319339597c31159fbbd454feea793455299212dbf28c8ea9623. After M10, replay only the authored seams onto then-current main, preserve owner hooks, regenerate, and make the combined Settings entry / General / Return / theme comparison. M5 has no independent landing recommendation. Exactly one focused M4 iteration follows the bundle verdict.
