M2 approved for adoption; M3 deferred — 2026-10-13

Owner decision 1014034735-3a72 and coordinator confirmation 1014034714-81d3: adopt only M2 `d46cd137ec07fcb30e74a94509e1162a45081278`. M3 `a42e1ee65b7f6547f5f6a3030d7285e80b5f0835` remains evidence on this branch. It is not an accepted PURE-PERF fix. Nothing is landed on main.

Pinned base: `34e5452f8e74f961a2cb3553f2fb480910460846`; glass.js SHA-256 `9cf0143b59574bb468791d68acbdb71f29be930dbbba1858de6ed1ee380552f2`. M2 source SHA-256 `06939358984390363856d7477289a0f2aa2f5e60c26e02d15f1e45f8a7f89f0b`; deferred combined source SHA-256 `0f7670fe0abf99077bf89c0772903f6217d391f9b27b377e8b044bb3e23254b8`. glass.css is unchanged (`ec0eb910b8d3101e6fa8c66b777ad6a4ff568f174816f06a0db44b1ee12e5c02`). All three review HTML files were built with the owner’s build_proto.py; embedded JS was checked byte-for-byte against its commit.

M2 scopes discovery to dirty surfaces/strips, shares one geometry/radius and offset-chain snapshot before writes, and indexes scroll ancestors. Scroll reanchoring and lens snap remain immediate; the scoped dirty sets persist into settling. Genuine repeated input shares an actual-frame pass; pointerdown travel and the first menu frame remain immediate. Generated mutation filtering, opt-in mounting/cleanup and removed-layer reconstruction remain. Code diagnostic mounts 146→40 and strip syncs 96→6; Usage mounts 469→160 and strip syncs 229→40. Counts alone are not CPU savings.

M2 standalone timing, Dark only, Mac Apple M3, 1920×1080 DPR 1. Values are milliseconds before/after; one matched pair. The 70 ms pointer hold is followed by 4.5 s settling after release; actual windows are retained in raw rows. The m2-final review artifact embeds the exact M2 commit.

| Action | Main Task | Style | Layout | Largest task |
|---|---:|---:|---:|---:|
| glass-entry | 1844.2 / 1911.4 | 848.6 / 860.1 | 52.8 / 52.3 | 258.6 / 258.3 |
| cold-code | 1803.7 / 1605.5 | 685.9 / 604.7 | 40.1 / 33.1 | 134.4 / 102.4 |
| theme-into-glass | 2210.6 / 2242.4 | 1037.7 / 1032.6 | 40.0 / 40.6 | 322.0 / 314.3 |
| rail-search | 1987.9 / 2066.2 | 1033.1 / 1047.7 | 59.6 / 64.8 | 294.3 / 319.9 |
| page-orchestrator | 1394.3 / 1411.0 | 474.5 / 538.8 | 32.9 / 36.8 | 108.0 / 103.8 |
| usage-entry | 1793.6 / 1793.0 | 740.6 / 732.0 | 52.8 / 55.0 | 166.4 / 144.4 |
| usage-nav | 1642.7 / 1578.2 | 561.7 / 593.3 | 37.0 / 41.4 | 57.8 / 55.7 |

M2 improves this cold Code sample and some peaks; entry, rail and selector totals remain mixed. A repeatable all-route CPU gain is not established.

M3 candidate retains the 64 MiB/80-entry map cache and 32 MiB/two-entry frost cache. It adds exact completed-ring reuse limited to 32 MiB/80 keys, with wallpaper identity, viewport, sheet geometry/position and optical arguments in the key. Visible/near-visible work is prioritized; no sheets are culled. Large map/saturation/readback/sampling/PNG work moves to one generation-checked worker, with at most two pending jobs/encoders. Warm maps transfer ordered rim samples; buffers and ImageBitmap use transfer lists. A mathematically zero interior is skipped exactly. Unsupported or failed workers use the synchronous path. These mechanics remain deferred because the visible-onset constraint failed.

Combined M2+M3 candidate versus v3, final source, one independent matched pair per mode on the same Mac. Do not pool this with M2-only timing or the earlier56-row cancellation snapshot.

| Mode / action | Main Task | Style | Layout | Largest main task | Worker Task |
|---|---:|---:|---:|---:|---:|
| Dark / glass-entry | 1607.7 / 1607.2 | 799.5 / 816.7 | 60.9 / 76.6 | 271.5 / 306.9 | 0.0 / 95.1 |
| Dark / cold-code | 1527.6 / 1277.0 | 603.3 / 562.3 | 42.6 / 40.0 | 148.9 / 93.6 | 0.0 / 185.2 |
| Dark / theme-into-glass | 2025.8 / 1798.8 | 1013.1 / 1003.7 | 52.4 / 47.5 | 335.5 / 332.0 | 0.0 / 0.0 |
| Dark / rail-search | 1810.1 / 1714.8 | 978.5 / 1029.0 | 64.3 / 78.0 | 292.1 / 350.7 | 0.0 / 208.9 |
| Dark / page-orchestrator | 1162.1 / 1169.0 | 461.2 / 468.8 | 33.5 / 35.7 | 106.7 / 108.5 | 0.0 / 0.0 |
| Dark / usage-entry | 1678.4 / 1563.7 | 715.3 / 734.6 | 55.1 / 57.6 | 176.7 / 147.6 | 0.0 / 87.8 |
| Dark / usage-nav | 1323.2 / 1393.7 | 529.7 / 578.6 | 36.6 / 37.8 | 58.9 / 48.9 | 0.0 / 57.8 |
| Light / glass-entry | 1651.8 / 1685.8 | 810.5 / 843.0 | 63.1 / 68.1 | 276.6 / 290.1 | 0.0 / 93.0 |
| Light / cold-code | 1553.3 / 1462.7 | 635.3 / 604.6 | 47.0 / 43.9 | 147.2 / 97.9 | 0.0 / 166.9 |
| Light / theme-into-glass | 2289.4 / 1787.1 | 1000.7 / 984.3 | 45.3 / 48.4 | 329.3 / 340.1 | 0.0 / 0.0 |
| Light / rail-search | 1918.5 / 1732.1 | 1044.4 / 1038.7 | 66.1 / 72.9 | 305.1 / 325.1 | 0.0 / 186.2 |
| Light / page-orchestrator | 1242.2 / 1232.9 | 489.6 / 514.5 | 37.1 / 36.0 | 106.7 / 105.5 | 0.0 / 0.0 |
| Light / usage-entry | 1834.7 / 1727.9 | 763.5 / 775.1 | 58.6 / 55.6 | 188.1 / 145.6 | 0.0 / 96.9 |
| Light / usage-nav | 1436.2 / 1413.5 | 584.8 / 617.5 | 46.5 / 42.7 | 59.3 / 52.4 | 0.0 / 57.9 |

Main and worker Task are wall time on separate threads, not measured total CPU. Worker totals exclude native encoder/raster threads. Cold Code peaks improve; entry/rail peaks and style/layout remain mixed. The 12 ms slice and 50 ms bake targets are not claimed universally achieved.

| Mode / action | Sampled browser-tree peak RSS MiB, before / after |
|---|---:|
| Dark / glass-entry | 2403.8 / 2719.3 |
| Dark / cold-code | 2657.1 / 2722.8 |
| Dark / theme-into-glass | 2734.8 / 2612.5 |
| Dark / rail-search | 2786.5 / 2884.3 |
| Dark / page-orchestrator | 2512.6 / 2600.4 |
| Dark / usage-entry | 2474.8 / 2590.4 |
| Dark / usage-nav | 2408.4 / 2578.2 |
| Light / glass-entry | 2762.9 / 3021.7 |
| Light / cold-code | 2781.4 / 2897.4 |
| Light / theme-into-glass | 2847.5 / 2790.2 |
| Light / rail-search | 3077.6 / 3153.0 |
| Light / page-orchestrator | 2972.4 / 2923.6 |
| Light / usage-entry | 2969.7 / 2868.2 |
| Light / usage-nav | 2794.6 / 2772.8 |

RSS is sampled every 0.5s and includes browser/image/compiler caches and all owned Chromium children. Worker/cache retention can increase it; explicit cache bounds are not whole-browser memory limits.

Clean films are separate from traces. Canvas pixel markers create no per-input DOM mutation. Two canvas barcodes align actual source video PTS with trusted pointerdown. Requested capture is1080p60; Mac source is variable-rate, so comparisons use actual PTS and 60 Hz samples, not assumed frame numbers. This is captured feedback, not photon latency. Allow at least one capture frame plus calibration residual; start/end Dark offsets differ by≤0.2 ms and p05/p95 residuals are about 5 ms. Light has about 14 ms offset drift.

The broad pixel detector can count a late old-pane/old-theme paint. It initially called Light Code 247 ms while App & Input was still visible. Corrected Code onset uses the new heading’s text shape; theme onset uses new page-selector chrome against pre/post templates. For theme routes,10%,25%,50% and 75% progression thresholds identify the same first new-theme frame. Generic raw detections remain in evidence.

| Mode / action | First captured feedback ms, before / combined candidate |
|---|---:|
| Dark / P1 Glass entry | 434 / 883 |
| Dark / P2 cold Code | 392 / 449 |
| Dark / P3 theme into Glass | 534 / 679 |
| Dark / P4 rail search | 23 / 25 |
| Dark / P5 page selector | 2 / 8 |
| Dark / P6 Usage entry | 16 / 15 |
| Dark / P7 Usage nav | 10 / 6 |
| Light / P1 Glass entry | 424 / 443 |
| Light / P2 cold Code | 288 / 407 |
| Light / P3 theme into Glass | 558 / 564 |
| Light / P4 rail search | 1 / 3 |
| Light / P5 page selector | 14 / 9 |
| Light / P6 Usage entry | 23 / 14 |
| Light / P7 Usage nav | 9 / 18 |

| Dark semantic onset | v3 | M2 only | M2+M3 |
|---|---:|---:|---:|
| P1 Glass entry | 434 | 457 | 883 |
| P3 theme into Glass | 534 | 537 | 679 |

M2 clears within capture noise. M3 delays Dark new-theme entry and return, and new Code heading onset in these captures. The owner approved M2 and deferred M3. First new Code/theme states show the same finished optics; that does not excuse their later arrival. Full clean Dark clips contain25 marked events per version, including the owner’s selector scrub/reversals, rail hover/collapse/reopen and Usage paths. Light clips contain all seven required scenarios per version. Clean lens departure/tracking and label motion were compared with owner Windows v3c and Mac v3f/v3g references; all 41 owner-manifest entries were SHA-256 checked.

The requested M3-only attribution trace contains a 252.9 ms click task and a 256.7 ms frame. Shared PMPillFit.run occupies 239.6 ms of the latter, including 132.9 ms style for 8006 elements. Wallpaper onload/bake work begins at 697.6 ms from the trace action mark; first observed dedicated-worker computation is 939.3 ms. The trace does not demonstrate worker startup or cloning as the cause of the delayed captured frame. A single guilty-head trace cannot establish what M3 adds. Reopening M3 requires a clean same-scene v3/M3 A/B trace. PMPillFit.run is M1 territory; its guarded fitting transform was not on this pinned baseline. No speculative first-frame/queue change was committed.

Validation: 180/180 decoded M2 optics pairs and180/180 final combined-candidate spec/ring pairs match exactly. Eleven float-plane/active-index/encoded-input oracle cases match; their Nas1 math timings are not GPU claims. Eight generation/fallback scenarios drain with zero stale publication: theme, wallpaper, detach, off/on, viewport, worker failure, synthetic resize and same-print alias. The last two target the final guard correction; the earlier six validate the unchanged pipeline before it. Opt-in removal, lens-layer reconstruction and reduced motion were checked. The original visualRect, travel, magnifyAlong, buildLensMaps, labelsOf, syncStrip, generatedMutation and pruneGlass bodies remain unchanged. Baseline Usage lens placement itself varies within its existing 0.5 px still tolerance; no corrective motion change was made.

Method correction: the earlier claim that DOM-marker style changes forced Glass’s observer was wrong; its attributeFilter excludes style. P1000 DOM-marker films remain diagnostic evidence. The clean canvas Mac films are the accepted onset basis. Initial Usage nth-child driver failures and one terminated batch were stopped/retrieved/purged and rerun; they are not counted as completed proof. All four clean films and the M2 bisect completed.

Raw evidence is outside the repository. result.json records primary paths plus SHA-256; EVIDENCE.sha256 covers the retained archive. The final source file remains the deferred combined candidate on this branch; the owner will merge only d46cd137ec. No glass.css, Plans, governance, shared-shell or published PMConcept7 edit. All owned GPU sessions/tunnels and HTTP servers are stopped; temporary runtime/worktree cleanup follows the pushed report.
