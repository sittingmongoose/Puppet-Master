PM7 shared and Settings performance — implementation in progress

Branch: `fix/pm7-perf-shared-settings-20261013`. Base and rebased main: `611b2404e4827675a435e7fe3113a0674bae2ed6`. Review and landing belong to home-redesign-planner. No Liquid Glass, wallpaper, terminal, hover, onboarding art, Planning Wizard, or Orchestrator source changes.

M1 source and repeated timings are pushed to both remotes. M4 was rejected after visible scroll parity failed; an Opus decision packet is in `M4-OPUS-DECISION.md`; M5, M6 and M10 follow in that order. M1 family-switch repetitions and films remain open. No aggregate saving is claimed.

The baseline was rebuilt by the onboarding generator, then composed with unchanged Liquid Glass sources by `build_proto.py`. Its PM7 SHA-256 is `f2c1c27673c784b34a4c85409d9cf52cd223799583e3e365c77c0e623233cc14`; its Glass-composed SHA-256 is recorded with the final artifact manifest.

Windows Chrome 155.0.8059.40, RTX 3090, ANGLE D3D11 hardware rendering; 1920 × 1080, DPR 1. Baseline and candidate use the same saved concept fixture, look and geometry. Fresh documents reset application and Glass caches; warm repetitions keep their document. Navigation and optical cache warming happen outside action windows. Traces include the action plus a fixed settlement interval, so a deferred flush still counts.

Task, Script, Style and Layout are cumulative CDP metric deltas. These overlap. Largest task comes from the page renderer's traced RunTask events. Restyled elements means summed element visits across style passes, not unique nodes. Click-to-paint uses trusted-input Event Timing (8 ms quantization); film-based first-visible feedback is reported separately when calibrated.

Diagnostic M1 pilots (ms; one sample each):

| Case | Task before / after | Style before / after | Layout before / after | Largest task before / after |
|---|---:|---:|---:|---:|
| Basic Dark Files → Search | 1114 / 974 | 325 / 121 | 58 / 32 | 278 / 30 |
| Glass Light Files → Search | 1984 / 1616 | 843 / 570 | 208 / 82 | 582 / 154 |
| Basic Dark → Friendly Dark | 1503 / 1275 | 591 / 374 | 194 / 72 | 447 / 143 |

Settings-entry pilots do not establish a saving. They remain in the evidence with that limitation.

M1 keeps the original full / abbreviated / symbol ladder, dependent control ordering, second pass and drag deferral. It fits visible pane content before its first paint, batches intrinsic probes within a dock strip or breakpoint row, skips equal writes, and compares conservative content / sizing / font / theme / visibility signatures. The pinned input remains unchanged. A region hash and exactly-once replacement guards reject source drift.

Initial correctness: all 360 pane records across ten looks, nine panes, 220 px and 500 px rail widths matched at both the first callback before paint and after settlement. Those records cover the initial candidate. A conservative signature refinement is receiving a final artifact check, long-label / font / visibility checks, repeated timings and films.

Raw evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/`. Failed and superseded attempts are retained. The first pilot had a renderer-selection parsing error, corrected offline from the retained trace; a later control inspection overlapped part of the Glass pilot, so those samples are diagnostic only. The release comparison uses separate immutable artifacts and no concurrent browser driver.

Repeated M1 proof (final artifact): 840 action windows, 420 paired UI snapshots, zero differences. Each look has three independent cold documents and ten warm repetitions. All ten looks have a repeatable Files → Search reduction. Settings-return and mode-only savings remain small or unestablished. This is not yet a complete release packet: family-switch repetitions and hardware films still remain.

Files → Search medians, before / after (13 samples per artifact and look):

| Look | Task ms | Style ms | Layout ms | Largest task ms | Restyled visits | Click-to-paint ms |
|---|---:|---:|---:|---:|---:|---:|
| basic-dark | 1037.1 / 793.0 | 354.1 / 122.6 | 38.2 / 7.7 | 286.0 / 49.5 | 14478.0 / 6269.0 | 352.0 / 88.0 |
| basic-light | 1031.1 / 802.0 | 339.6 / 109.3 | 37.7 / 7.1 | 280.6 / 44.4 | 14612.0 / 6269.0 | 344.0 / 80.0 |
| friendly-dark | 1000.9 / 758.7 | 372.0 / 144.0 | 38.2 / 9.7 | 307.0 / 48.2 | 16164.0 / 7898.0 | 376.0 / 112.0 |
| friendly-light | 987.7 / 779.2 | 359.2 / 139.3 | 39.4 / 9.5 | 303.6 / 47.0 | 16198.0 / 7910.0 | 368.0 / 112.0 |
| retro-dark | 977.6 / 767.9 | 343.8 / 112.1 | 35.2 / 8.0 | 275.7 / 43.4 | 14573.0 / 6238.0 | 344.0 / 80.0 |
| retro-light | 916.7 / 721.2 | 346.5 / 101.1 | 34.2 / 6.9 | 282.2 / 43.5 | 14606.0 / 6246.0 | 344.0 / 72.0 |
| glass-dark | 1387.0 / 1066.5 | 569.9 / 320.2 | 135.0 / 20.4 | 400.1 / 86.6 | 18750.0 / 10987.0 | 504.0 / 128.0 |
| glass-light | 1359.6 / 1080.6 | 559.3 / 328.4 | 135.3 / 20.7 | 382.6 / 85.2 | 18774.0 / 11019.0 | 496.0 / 128.0 |
| nier-dark | 766.5 / 356.6 | 449.2 / 76.9 | 38.1 / 6.5 | 410.9 / 27.4 | 13463.0 / 5579.0 | 456.0 / 56.0 |
| nier-light | 765.9 / 356.3 | 460.7 / 77.3 | 39.1 / 6.3 | 423.4 / 28.6 | 13523.0 / 5483.0 | 472.0 / 56.0 |

Median and p95 for every action, including cold Settings entry, warm Settings return, General entry and all-look mode switches, are in `m1-measurements.json`. Raw traces and snapshots are in `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m1-repeated-v2`. The raw manifest below supplies SHA-256 for every file.

Raw M1 evidence manifest: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-perf-shared-settings-20261013/m1-repeated-v2/evidence-manifest.json`, SHA-256 `06ec67e35534198dc4b5904dfa139b0f34b70686529487180459b9aa2fba6f40`. It covers 1,823 files (9,103,401,283 bytes), including every trace, measurement, snapshot and final summary.

Cold and warm measurements are also separated in `m1-phase-measurements.json` (three cold documents and ten warm repetitions per affected state). Immutable baseline/candidate page copies are under the raw evidence `artifacts/` folder; `artifacts/manifest.json` SHA-256 is `d3237bbd9a0f754d31ff3b1d540089660a988e84cfb173d020eb6b8ebaa6bdda`.

M4 stopped: 100 snapshots / 50 paired steps exposed eight differing fields. Glass Light soft restoration was 1597 → 1200 px; NieR Dark was 1631 → 1200 px. Different rows were visible, so no M4 implementation is delivered. Source and attempts are retained only in external evidence. See `M4-OPUS-DECISION.md` for the cold prototype table and designer decision.

M5 implementation and compatibility checks: 312 snapshots / 156 pairs across all ten looks. Pixels, geometry, fit modes, focus, popups and saved state match. One Glass Light startup inline search-width declaration differs while the rendered width remains 178 px and the fit remains full. The ten-look matrix also covers Auto resolving Dark → Light → Dark, font changes, real 1600 × 900 → 1920 × 1080 resizing, sticky strips and popup dismissal. Density and native films remain supplemental checks.

M5 repeated timing is in progress. The first five looks have three cold documents and ten warm repetitions each: 390 matched windows / 195 snapshot pairs, zero differences. Mode, Auto and family CPU results are small or mixed; no material speedup is established. The implementation removes the interactive global synthetic resize and explicitly retains necessary geometry and popup outcomes. The measured event counts are synthetic resize 1 → 0 and scoped theme geometry 0 → 1 per action. `m5-partial-measurements.json` contains median/p95 for all required CPU and input metrics in those five looks. This is a mechanism cleanup, not a claim that final theme restyling disappeared.

The sixth-look navigation failed when the owned HTTP server was no longer present and port 8879 refused connections. The GPU session was healthy. The server was restarted and HTTP 200 verified; the driver now rejects error, wrong-origin and unready documents before applying fixtures. The failed attempt and its three unmatched baseline windows are retained but excluded. The unfinished five looks run in `m5-repeated-resume-v1`. The server exit cause was not established.

M4 has a new approved design scope, separate from the rejected pure-performance candidate: coordinator authorization mail `1014005302-af53` and design decision SHA-256 `df7fa857254291a428bc6d9ef6411e1b586beee52aec8a11557ece98ee257df0`. Its private revision is not delivered until the contract checks pass.
