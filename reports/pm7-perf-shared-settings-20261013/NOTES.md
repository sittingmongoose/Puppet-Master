PM7 shared and Settings performance — implementation in progress

Branch: `fix/pm7-perf-shared-settings-20261013`. Base and rebased main: `611b2404e4827675a435e7fe3113a0674bae2ed6`. Review and landing belong to home-redesign-planner. No Liquid Glass, wallpaper, terminal, hover, onboarding art, Planning Wizard, or Orchestrator source changes.

M1 is under validation. M4, M5, M6, and M10 are next, in that order. Measurements below are diagnostic pilots; repeated comparisons and films are pending. No aggregate saving is claimed.

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
