M2/M3 Glass performance fixes — 2026-10-13

Source changes and same-host pixel/generation checks are complete. Normal60fps motion and first-visible feedback film proof is pending the P1000 handoff. Nothing is landed on main.

Pinned base: `34e5452f8e74f961a2cb3553f2fb480910460846`; verified glass.js SHA-256 `9cf0143b59574bb468791d68acbdb71f29be930dbbba1858de6ed1ee380552f2`. Only glass.js changes product behavior. glass.css remains byte-identical (`ec0eb910b8d3101e6fa8c66b777ad6a4ff568f174816f06a0db44b1ee12e5c02`). Review pages use the owner’s build_proto.py over the pinned PMConcept7.

M2 batches geometry/radius and shared offset-chain reads before committing sheet optics. Mutation dirtiness scopes surfaces/strips to affected layout regions; repeated actual-frame input shares a pass. Pointerdown lens travel remains synchronous and new menus retain their held first keyframe. Scroll ancestry indexes reanchor the affected frost and snap affected lenses in the scroll frame, then carry those exact dirty sets into settling. The original generated-mutation filter and opt-in cleanup remain.

M3 retains the existing map/frost caches and adds exact completed-ring reuse, limited to32MiB/80 keys. Its key covers wallpaper identity, viewport, geometry/position and all encoded optical arguments. Connected sheets also reuse their exact completed image. Idle retention prefers visible/near-visible sheets; every offscreen job still completes. A mathematically zero flat interior is skipped without changing float planes or active-index order. Large sheet map generation, saturation/readback, rim sampling and PNG encoding run on one worker with at most two pending jobs/encoders. Warm maps transfer only ordered rim samples. Generation, connection, signature, theme, print, viewport and geometry checks guard publication. Unsupported/failed workers use the synchronous path.

The worker publishes spec after sampling and ring after encoding, preserving the owner’s stage order. Existing output remains until its valid replacement finishes. No sheet is hidden, dropped, downsampled or given a new fallback. Lenses, menus, springs, visualRect’s wall-clock path, press pending/from/away logic and per-label compositor WAAPI are preserved. A genuine viewport/print change cancels old work; an unchanged synthetic resize or same-print alias does not strand a cold job.

Final corrected-source measurements: same Mac M3 browser,1920×1080 DPR1. Each action uses a70ms pointer hold followed by4.5s settling after release; actual wall windows are retained in raw rows. Values below are milliseconds, before / after. This is one pair per mode; the earlier balanced56-row run belongs to the preceding cancellation snapshot and is not pooled into this table.

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

Task and worker columns are wall-time measurements on separate threads, not a measured total CPU sum. Worker time excludes native encoders/raster threads. Cold Code peak tasks improve, and exact warm returns remove work; entry/rail peaks and some style/layout results remain mixed. Shared control fitting/theme restyling remains untouched. The12ms loop and50ms bake targets are not claimed universally achieved.

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

RSS is sampled at0.5s, includes persistent browser/image/compiler caches and all owned Chromium children, and is not a cache-residency measurement. It can rise with the added worker/retention. Explicit cache bounds remain enforced.

Validation:180/180 final decoded spec/ring images match exactly across entry, General, Code, scroll and light/dark returns. Eleven raw-float/active-index/encoded-input cases match the original map algorithm; the oracle’s Nas1 math timings are not GPU performance claims. Eight forced race cases have zero stale publications and drain fully: theme, print, detach, off/on, viewport, worker failure, synthetic resize and same-print alias. The failure case exercises the synchronous fallback. Source checks confirm visualRect, travel, magnifyAlong, buildLensMaps, labelsOf, syncStrip, generatedMutation and pruneGlass are unchanged. Opt-in removal, lens-layer reconstruction and reduced motion were checked. The baseline alone varies320px/320.429px for the Usage lens under its existing0.5px still threshold.

Diagnostic M2 Code calls: mounts146→40; strip syncs96→6. Usage: mounts469→160; strip syncs229→40. These counts do not establish a CPU saving.

All41 owner-film SHA-256 entries were verified. Motion review must compare the final films with the owner’s r3/v3/v3c Windows and v3f/v3g Mac references; it is still pending. Mac capture was not attempted below its2GiB reserve. The sole Mac browser bfc7d558cb00 is stopped and purged.

Raw evidence paths and SHA-256 values are in result.json. Raw traces, PNGs and experiment runtime remain outside the repository. No Plans, generated governance, shared-shell, glass.css or published PMConcept7 edits.
