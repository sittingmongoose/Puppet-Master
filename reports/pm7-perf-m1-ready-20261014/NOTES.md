M1 shared control fitting — separate landing packet

Branch `fix/pm7-perf-m1-ready-20261014` starts at current main `b94e6183b1`. It changes only the guarded fitter in `Concepts/onboarding/opus-5.5/tools/build.py` and the four generator outputs. Landed wallpaper and terminal source stays in place. Review and landing belong to home-redesign-planner.

The fitter keeps the full / abbreviated / symbol ladder, dependent order, second pass and resize deferral. It fits visible pane content before its first paint, batches intrinsic probes within a strip or breakpoint row, avoids equal writes and compares conservative content, width, font, theme and visibility signatures. The pinned source is unchanged; its fitting region is protected by SHA-256 and exactly-once guards.

Completed frozen-base proof: 840 action windows and 420 paired UI snapshots, zero differences, three cold documents and ten warm repetitions per look. Files → Search improves in all ten looks. Median/p95 and separated cold/warm results are in `m1-measurements.json` and `m1-phase-measurements.json`. Measurements use Windows RTX3090, Chrome155.0.8059.40,1920×1080,DPR1. Task/Style/Layout are cumulative CDP duration deltas over the action plus fixed3-second settlement; largest task is traced renderer RunTask; restyled elements are summed visits, and Event Timing click-to-paint is quantized to8ms. These costs overlap.

Initial fitting parity covers360 records across10 looks,9 panes and220/500px widths at first callback and settlement; final frozen artifact adds72 first/settled records and56 long-label/font/width/visibility records, all matching.

The current-main supplement is complete: BasicDark/Light repetitions cover cold/warm Settings, General entry, Files→Search, Basic→Friendly and Glass entry. Three-look drag/font readiness matches, and normal/application-reduced hardware films are attached. This M1-only packet is ready for coordinator review.

Raw proof manifest: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m1-repeated-v2/evidence-manifest.json`, SHA-256 `06ec67e35534198dc4b5904dfa139b0f34b70686529487180459b9aa2fba6f40`. Failed and superseded attempts are retained in that evidence root.

Current-main repeated proof:220 action windows /110 paired snapshots. All fitting,content,scroll andtheme fields match. Two400-byte focus HTML strings differ in generated attribute order or truncation; both identify the focused `#themeSelect` button. These diagnostic strings are retained rather than silently discarded.

Current-main medians,before /after (ms; visits are counts):

| Look / case | Task | Style | Layout | Largest task | Restyled visits | Event Timing |
|---|---:|---:|---:|---:|---:|---:|
| basic-dark / settings-entry | 802.6 / 713.5 | 133.3 / 129.9 | 34.9 / 32.9 | 61.8 / 66.4 | 4402.0 / 4429.0 | 112.0 / 112.0 |
| basic-dark / settings-return | 1121.5 / 1128.9 | 370.0 / 367.2 | 16.4 / 17.1 | 92.4 / 95.1 | 13646.0 / 13601.5 | 180.0 / 192.0 |
| basic-dark / home-general | 971.1 / 976.9 | 238.5 / 240.8 | 37.3 / 32.2 | 118.4 / 125.6 | 10419.0 / 10340.0 | 224.0 / 248.0 |
| basic-dark / files-search | 1019.5 / 786.6 | 356.2 / 117.0 | 37.4 / 7.6 | 285.4 / 45.2 | 15125.0 / 6662.0 | 352.0 / 80.0 |
| basic-dark / basic-friendly | 1520.4 / 1213.3 | 897.5 / 541.1 | 75.5 / 36.5 | 499.2 / 208.9 | 31861.0 / 21649.0 | 480.0 / 464.0 |
| basic-dark / friendly-glass | 2652.8 / 2560.5 | 1778.4 / 1659.1 | 167.6 / 69.6 | 639.2 / 439.4 | 48318.0 / 39414.0 | 816.0 / 800.0 |
| basic-light / settings-entry | 702.4 / 715.9 | 122.9 / 124.5 | 24.5 / 24.0 | 54.8 / 50.9 | 4404.0 / 4423.0 | 104.0 / 96.0 |
| basic-light / settings-return | 1130.6 / 1150.3 | 366.3 / 380.4 | 17.0 / 17.3 | 92.1 / 95.5 | 13547.0 / 13571.5 | 176.0 / 184.0 |
| basic-light / home-general | 933.7 / 939.8 | 228.0 / 241.0 | 28.6 / 28.0 | 109.9 / 116.7 | 10282.0 / 10383.0 | 224.0 / 208.0 |
| basic-light / files-search | 997.8 / 781.5 | 353.0 / 121.5 | 37.1 / 7.7 | 285.7 / 47.3 | 15140.0 / 6679.0 | 344.0 / 80.0 |
| basic-light / basic-friendly | 1506.7 / 1239.4 | 871.7 / 546.1 | 74.6 / 36.4 | 487.8 / 207.6 | 31784.0 / 21516.0 | 448.0 / 464.0 |
| basic-light / friendly-glass | 2661.4 / 2612.1 | 1758.9 / 1661.7 | 177.0 / 70.1 | 646.8 / 450.0 | 48114.0 / 39601.0 | 792.0 / 800.0 |

Each Files→Search and family transition has13 observations per artifact; Settings entry and General entry have3 cold observations,and Settings return10 warm observations. Median/p95 and separated phases are in `m1-current-measurements.json` and `m1-current-phase-measurements.json`. Savings are established for Files→Search and Basic→Friendly CPU work. Glass entry reduces layout and peak tasks while its remaining optics work keeps total Task and feedback changes small. Settings entry,General entry and warm return do not establish a material performance benefit. Costs overlap and are not added.

Drag/readiness parity:30 snapshots /15 paired states inBasicDark,GlassLight,NieRDark,500→220→500px. The resize deferral, font-readiness notification during resize, release through the shared PM_DRAGEND producer and final restored fit all match. The first attempt used a nonexistent Debug locator; its failure is retained and the corrected run uses the canonical `data-ab-id=run`.

Hardware-film first visible content feedback, before / after (ms; one observation per artifact, separate from traces):

| Look / action | Normal | Application reduced animations |
|---|---:|---:|
| basic-dark / settings-entry | 166.0 / 130.4 | 76.2 / 63.3 |
| basic-dark / home-general | 254.9 / 231.8 | 294.8 / 222.9 |
| basic-dark / settings-return | 260.5 / 205.1 | 164.3 / 142.8 |
| basic-dark / files-search | 545.2 / 150.2 | 437.5 / 110.8 |
| basic-dark / basic-friendly | 717.5 / 489.6 | 863.9 / 566.3 |
| basic-dark / friendly-glass | 1137.8 / 996.0 | 1303.3 / 1300.9 |
| glass-light / settings-entry | 215.2 / 217.6 | 105.6 / 108.3 |
| glass-light / home-general | 316.4 / 425.9 | 440.0 / 301.2 |
| glass-light / settings-return | 312.7 / 323.4 | 233.9 / 234.6 |
| glass-light / files-search | 763.4 / 382.2 | 802.3 / 384.7 |
| glass-light / mode-dark | 538.1 / 461.4 | 427.8 / 359.7 |

The normal film timing bound is ±24.17ms; the reduced film bound is ±41.67ms (maximum start/end calibration residual plus one60Hz capture interval). These single film observations establish the observed feedback time, not population speedups. Settings body or Search rail onset is measured; earlier menu press/color cues are excluded. Reviewed native onset,+50,+200,+500ms samples retain the same content/entrance sequence and first-show fit. Reduced animation frames show the existing instant presentation. Optical baking remains owned by Glass and can finish earlier as CPU work clears; no optical or motion source changed. This sampled review is not a bit-exact comparison of every encoded frame.

Both recorder stop attempts returned exit1 with `Recorder did not stop gracefully and was killed; validated recovery clip retained if readable`. Recovered movies independently decoded in full (8100 normal,8040 reduced frames), contain all22 actions and both calibration sequences, and exact owned-PID checks returned[] afterward. Failed attempts and the superseded inefficient extraction are retained. No CPU recorder was used. Tool maintenance was given an actual OWN0 seam.

Current-main evidence manifest: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m1-current-evidence-manifest.json`, SHA-256 `d4690be12250ab2b76cfcdbae7ecdeaf754c300d994617d17b2e4ab154dd857d` (781 files). Older frozen-base proof uses the separately hashed manifest above. Source635aea6fbd and all report companions are pushed to GitHub and NAS; no main landing was performed. M4/M5/M6/M10 are excluded from this branch and continue in the original task.

Current-main first-show supplement: 72 pane records (36 paired entries,72 first/settled comparisons), nine panes at220/500px inBasicDark andGlassLight. Every first and settled fit,stack,width,label and content field matches.
