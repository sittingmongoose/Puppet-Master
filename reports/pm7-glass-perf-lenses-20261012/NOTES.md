# PM7 Liquid Glass lens performance patch

The lens engine now reuses exact spring samples and SVG displacement-node references, skips unchanged rounded scale writes, and owns one cancellable refraction RAF per travel. Replaced strips release lens elements and observers; Glass-off/motion-transition cleanup cancels active travel, scrub listeners, bead timers/animations, and deferred/active menu animations. An inactive pool of at most 16 SVG filters reuses prior sizes without retaining unbounded resize history. Connected filter users and the shared switch-knob filter stay alive.

Onboarding lens layers use a WeakMap cache. Unchanged reduced-motion lenses neither repeat nor cancel their 140 ms fade; changed geometry still updates exactly, including subpixels. Closed-menu scans skip lens rectangle reads; opening/closing overlap hiding retains its original behavior. All source changes are in the assigned lensFilter/setLensScale, spring/lens/scrub, bead, and menu-motion sections.

The optical equations/parameters, map image-data bytes, SVG graph, normal spring keyframes and timing, lens padding/dimensions/labels, live scrub geometry and nearest-item selection are preserved. CSS, art/wallpapers, PM_LG exports/version, switches, keyboard and focus code are untouched. No refraction, blur or quality tier is removed or lowered.

The fresh external harness passes 14 focused cases against frozen input `fd5d486c435a5d2b62469004b7ed999bc4521bda`. Negative controls reproduce 500 baseline SVG queries/1,500 writes for 500 repeated base scales versus zero/zero after the patch, and two pending baseline RAFs after retarget versus one after the patch and zero after teardown. A closed-menu control records 100 baseline lens layout reads versus zero. The harness compares optical image-data bytes before browser PNG encoding; it is not a GPU benchmark. The new source/preview scope witness confirms all non-owned source sections and all non-JS preview bytes are exact to input/presented v2.2. Its first draft had an extra-newline framing error, corrected without changing product source.

Required combined-build joins: runtime calls `pruneLenses()` during sync and `suspendLensMotion()` when motion preferences change; baking calls `suspendLensMotion()` before Glass-off unmount. Owned lens removal joins baking's `unmount(e)` when present and has a standalone fallback. `pruneLensFilters()` is available after clearing old element filter refs. Peers confirmed these names.

Known limits: the baseline filter cache key/sharing is retained, including existing shared refraction cross-talk; this patch makes no independent appearance decision about it. Live scrubbing keeps layout reads required to follow moved/resized strips. The standalone selected-function tests cover the new hooks but cannot establish whole-page timing or rendered visual equivalence. The sole profiler owns those checks on the combined build.

Rebuild uses the frozen exported `BASE-PMConcept7.html`. The external preview is a review artifact only. Main, canon, governance and original source-owner/share pages were not changed. The source patch and these two report paths are the only repository writes.

Run the focused lifecycle harness against any reviewed combined source:

```sh
node /mnt/Cursor/share/puppet-master/2026-10-12-glass-performance/lenses/lens-regression.mjs /absolute/worktree/Concepts/liquid-glass/opus-5.5/src/glass.js /absolute/evidence/result.json
```

Evidence paths and full SHA-256 values:

- `/mnt/Cursor/share/puppet-master/2026-10-12-glass-performance/lenses/lens-regression.mjs` — `782b3d7c2b14825a1f0408d4c7de2d5d7fb798bbe98eaa42c0bc21cecf66288e`.
- `/mnt/Cursor/share/puppet-master/2026-10-12-glass-performance/lenses/lens-scope.py` — `1e6246e53a804c08bf0194706b2ccef8e27259e5175ab3c22e729e71b7d5be11`.
- `/mnt/Cursor/share/puppet-master/2026-10-12-glass-performance/lenses/PMConcept7-LiquidGlass-lenses.html` — `230dc35789d14b61c3bc2c9b7b9ca7ee319bd0ac8e36666da0b829500eb918a0`.
- `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glass-perf-20261012/lenses/lifecycle-equivalence-result.json` — `23752265be98b785dac68b953c57bcf6f6b52ca488255a5bf937ef536bae975d`.
- `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glass-perf-20261012/lenses/source-preview-scope-result.json` — `d1f810d298da82c17b448ce75bbbd3fdbeb5093b89d3fea468181cad60da53c4`.
