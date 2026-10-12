# Liquid Glass runtime performance candidate

Frozen input: `fd5d486c435a5d2b62469004b7ed999bc4521bda`. Branch: `fix/pm7-glass-perf-runtime-20261012`.

`syncAll -> applyWall -> unchanged data-lg-wall write -> root MutationObserver -> queueSync` kept the frozen page synchronizing every frame at idle. The patch makes wallpaper writes and root state comparison idempotent. An immediate hot/API sync cancels a covered RAF and cold timer. Body observation ignores mutations from generated optics, lenses, shine, presses and tracks; removing a persistent generated layer still schedules reconstruction.

Disconnected elements leave the live set and stop resize observation. Integration invokes baking's `unmount(e)` and lenses' `pruneLenses()` hooks when present; the runtime patch remains independently executable. Entering reduced motion invokes the lens suspension hook when present. A scroll frame now includes every container that scrolled, anchoring each affected sheet once.

The public PM_LG declaration, all material/optical parameters, CSS, art, wallpaper bytes, hot/menu/materialize/start/page/lazy timings, same-frame per-element ResizeObserver mount, hidden connected surfaces and focus behavior remain intact. No blanket CPU tier or effects reduction was used.

Validation: Node syntax, clean whitespace diff, exported BASE rebuild and native DOM observer/event regressions pass. All preview bytes outside the injected glass.js block equal the frozen presented page. Native 120-frame idle: frozen 120 syncs / 240 mutation records / one queued RAF; candidate zero in each. Menu opening still mounts before the next frame and morphs in that frame for the identical 750 ms curve, including reopen. Tests also cover covered queues, mixed generated/product changes, persistent-layer removal, dynamic cards and Settings, detach/hidden return, same-frame resize, focus, Glass off/on materialization, saved wallpaper across looks, two simultaneous scroll containers and peer teardown joins.

The native harness stubs geometry and optical mount, so these numbers establish scheduler behavior rather than actual GPU cost or visual equivalence. Profiler owns the real-machine checks. See `result.json` for every evidence path and SHA-256.

Reproduce the changed lifecycle checks in a new local experiment directory: copy `runtime-regression.cjs`, `package.json`, and `package-lock.json` from `/mnt/Cursor/share/puppet-master/2026-10-12-glass-performance/runtime/`; run `npm ci --ignore-scripts`; then `node runtime-regression.cjs /absolute/path/to/glass.js candidate`. Use `baseline` against frozen source to produce the differential without candidate-only assertions. The harness requires no browser, GPU or server.
