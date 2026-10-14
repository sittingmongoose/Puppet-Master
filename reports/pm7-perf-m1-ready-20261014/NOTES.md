M1 shared control fitting — separate landing packet

Branch `fix/pm7-perf-m1-ready-20261014` starts at current main `b94e6183b1`. It changes only the guarded fitter in `Concepts/onboarding/opus-5.5/tools/build.py` and the four generator outputs. Landed wallpaper and terminal source stays in place. Review and landing belong to home-redesign-planner.

The fitter keeps the full / abbreviated / symbol ladder, dependent order, second pass and resize deferral. It fits visible pane content before its first paint, batches intrinsic probes within a strip or breakpoint row, avoids equal writes and compares conservative content, width, font, theme and visibility signatures. The pinned source is unchanged; its fitting region is protected by SHA-256 and exactly-once guards.

Completed frozen-base proof: 840 action windows and 420 paired UI snapshots, zero differences, three cold documents and ten warm repetitions per look. Files → Search improves in all ten looks. Median/p95 and separated cold/warm results are in `m1-measurements.json` and `m1-phase-measurements.json`. Measurements use Windows RTX3090, Chrome155.0.8059.40,1920×1080,DPR1. Task/Style/Layout are cumulative CDP duration deltas over the action plus fixed3-second settlement; largest task is traced renderer RunTask; restyled elements are summed visits, and Event Timing click-to-paint is quantized to8ms. These costs overlap.

Initial fitting parity covers360 records across10 looks,9 panes and220/500px widths at first callback and settlement; final frozen artifact adds72 first/settled records and56 long-label/font/width/visibility records, all matching.

The final current-main supplement is in progress: BasicDark/Light repetitions cover cold/warm Settings, General entry, Files→Search, Basic→Friendly and Glass entry. Clean calibrated hardware films and the remaining drag/readiness check follow. No speedup is claimed for an unfinished case.

Raw proof manifest: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m1-repeated-v2/evidence-manifest.json`, SHA-256 `06ec67e35534198dc4b5904dfa139b0f34b70686529487180459b9aa2fba6f40`. Failed and superseded attempts are retained in that evidence root.
