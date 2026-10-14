M2/M3 Glass performance implementation — 2026-10-13

Pinned source: `34e5452f8e74f961a2cb3553f2fb480910460846`, branch `concept/pm7-liquid-glass-20261011`. Verified glass.js SHA-256 `9cf0143b59574bb468791d68acbdb71f29be930dbbba1858de6ed1ee380552f2`. Work is isolated on `fix/pm7-glass-perf-m2-m3-20261013`. No main landing. glass.css stays byte-identical; no Plans/governance or shared-shell edits.

M2 batches surface dimensions, radius and shared offset-chain reads before committing optics. Input mutations collect affected subtrees; unchanged attribute writes are skipped. An actual frame coalesces repeated hot input, while pointerdown still starts the owner's lens synchronously and a new menu still receives its held first keyframe immediately. Scroll ancestors index affected sheets and strips; frost reanchors and lens snaps stay in the scroll frame, and dirty sheets carry into the scoped settle pass. Removed output layers and opt-in cleanup retain the owner's filter and prune rules.

Validation so far: 180/180 decoded spec/ring images match exactly across entry, General, Code, scrolling and light/dark returns on Mac M3, 1920×1080 DPR1. All 41 owner-film hash entries were verified. Geometry/cleanup checks include opt-in removal, lens-layer reconstruction and reduced motion. No changes to visualRect's wall-clock path, travel, syncStrip, per-label compositor WAAPI, spring curves or lens maps.

Code probe: mount calls 146 → 40; strip syncs 96 → 6. Usage probe: mount calls 469 → 160; strip syncs 229 → 40. These are diagnostic counts, not speedups. Whole-action pilot timing is mixed and will be replaced by the final matched table. Baseline-vs-baseline Usage placement itself varies 320px/320.429px under the existing 0.5px still tolerance; no motion correction was introduced.

M3 is pending. An external math oracle confirms an exact zero-interior skip for baked maps; that preparation is not yet a product edit. Normal 60 fps before/after film proof is pending: Mac Data has 1.7GiB free, below the 2GiB recording reserve. No reserve was lowered and no alternate CPU recorder was started.

Raw evidence lives under `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glass-perf-m2-m3-20261013/`. `result.json` carries paths and SHA-256 digests. Review pages use the owner's `tools/build_proto.py`; published PMConcept7 is untouched.

M2 final matched pilot (Mac M3, 1920×1080 DPR1; one pair, 4.57 s action windows; milliseconds):

| Action | Task before / M2 | Style before / M2 | Layout before / M2 | Largest task before / M2 |
|---|---:|---:|---:|---:|
| glass-entry | 1844.2 / 1911.4 | 848.7 / 860.1 | 52.8 / 52.3 | 258.6 / 258.3 |
| cold-code | 1803.7 / 1605.5 | 685.9 / 604.7 | 40.1 / 33.1 | 134.4 / 102.4 |
| theme-into-glass | 2210.6 / 2242.4 | 1037.7 / 1032.6 | 40.0 / 40.6 | 322.0 / 314.3 |
| rail-search | 1987.9 / 2066.2 | 1033.1 / 1047.7 | 59.6 / 64.8 | 294.3 / 319.9 |
| page-orchestrator | 1394.3 / 1411.0 | 474.5 / 538.8 | 32.9 / 36.8 | 108.0 / 103.7 |
| usage-entry | 1793.6 / 1793.0 | 740.6 / 732.0 | 52.8 / 55.0 | 166.4 / 144.4 |
| usage-nav | 1642.7 / 1578.2 | 561.7 / 593.3 | 36.9 / 41.4 | 57.8 / 55.7 |

This single pair supplements the earlier balanced two-pair pilot; it is not a broad performance claim. Normal film proof and final M2+M3 repeats remain pending.
