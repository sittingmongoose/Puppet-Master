# V1 Verification Report — THE RAIL (PMConcept7.html, post motion-overhaul)

Agent: V1 · Date: 2026-08-02 · Target: `http://127.0.0.1:8792/PMConcept7.html` (served from `Concepts/`)
Rig: standalone Playwright, chromium headless, viewport 1440×900. Raw machines: 236 checks over 3 batteries (`results.json`, `results3.json`, `results4.json`). Battery-1 failures were triaged against source + instrumented probes (MutationObservers on the bar, `PMPANEL.go` tracing); 13 of 14 re-tested FAILs were proven to be harness artifacts (sampling anchors vs the designed 130ms exit-then-swap, pointer magnet residue, stale rects). Verdicts below are the adjudicated ones.

## Verdict table

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1.1 | Click each of the 9 panel icons → correct `.side-panel-view.active`, icon `.active`, `.ab-ind` WAAPI in-flight, lands within 1px | **PASS** | All 9: anims sampled at t=35/80ms (`cur` advancing 0→100 of 260ms); settle deltas 0.00px top / 0.00px h. Long hop search→artifacts: slug stretched to **528px** vs 44px target mid-flight (`v1-01-indicator-midflight.png`). Indicator flight starts ~130ms after click on SWITCH by design (outgoing view exits first via `exitThen`); starts immediately on first-open/close. |
| 1.1 | chat + `#dashboardToggleIcon` | **PASS** | chat toggles `#chatPanel.hidden` + `.active`; indicator follows first `.icon.active` within 1px (66.0=66.0). Dashboard toggles `#dashboardView` display none↔flex + `.active`. Indicator priority works as coded: panel icon (data-target) > first `.icon.active`; with files panel open the indicator correctly stays on files while chat/dashboard are active. |
| 1.2 | Hover scale = `--ab-hover-scale`, press = `--ab-press-scale` (.9) on all 11 icons | **PASS** | friendly-dark: all 11 symbols reach matrix a=1.14 at rest, in-flight sample caught mid-transition (a=1.098, 1 running anim); `:active` settles at a=0.900 (sampled after the 260ms spring lands; early samples read ~0.941 mid-spring — correct dynamics, not a miss). Note: friendly/glass theme overrides apply scale only (pill tiles); retro/basic apply `translateY(-1px) scale()` — matches theme CSS. |
| 1.3 | Re-click active icon closes panel: exit anim on outgoing view, slot `.hidden`, indicator sane | **PASS** | `.pm-panel-exit` + `railPanelOut` WAAPI sampled on `#panel-search` at t=25ms and t=70ms (runs ~146ms total, verified by probe trace). After settle: slot `.hidden=true`, icon inactive. Indicator: falls back to dashboard icon (still `.active` from boot) or fades to opacity 0 when nothing is active (0<op<1 sampled mid-fade, op=0 at settle). |
| 1.4 | Ctrl+2…Ctrl+9 hotkeys | **PASS** | All 8 switch panels in live `.icon[data-target]` DOM order; indicator agrees within 1px every time. Hotkeys correctly follow visual order after reorder (live query per keydown). |
| 2.1 | Drag reorder down 2 slots: ghost lags, drop indicator slides, `abIconLand`, order persisted | **PASS** | Ghost lag early: 6.9→8.9px and growing (0.35/frame lerp), then converges while pointer held still (1.24px after 160ms at throttled headless fps; <1px at full fps — code path is deterministic). Drop indicator: `top` CSSTransition running while crossing slot lines, intermediate tops sampled between lines (504→555→577→568→619→641→632, lines at 535/598). `abIconLand` class + WAAPI sampled <40ms post-drop (`v1-03-land-settle.png`). DOM order + `localStorage["pm.activity_bar_order:v2"]` both correct with `__more__` sentinel. Drag ghost + indicator: `v1-02-drag-ghost.png`. |
| 2.2 | Drop icon onto `#abMoreBtn` to hide | **PASS** | More lights during approach: opacity ramp 0.90→0.99→1.00 with running transition + `.pm-ab-drop-hot` (`v1-04-more-lit.png`); icon removed from rail, `data-empty="0"`, LS records id after sentinel. |
| 2.3 | Reload persistence + first-paint indicator | **PASS** | Order restored from LS. Indicator initialized with **zero animations** (`getAnimations()=0`, inline top set pre-paint, opacity 1), geometry on files exact. |
| 3.1 | Tray sprout + row cascade | **PASS** | Full phase capture: closed `matrix(0.7,0,0,0.5)` → grow 0.81→0.89→0.95→0.99 → **overshoot peak scaleX 1.028 / scaleY 1.047** → decay to 1 (textbook `cubic-bezier(.22,1.55,.36,1)`), WAAPI running throughout. Rows: `--pi` 0/1, delays 0s/0.026s ascending; mid-cascade row0 leads row1 (0.69 vs 0.40 opacity @130ms; `v1-05-tray-cascade.png`). |
| 3.2 | Row hover: bg tint + `translateX(2px)` | **FAIL** | bg tint applies (`rgba(0,0,0,0)`→`rgb(42,39,49)`) but `translateX(2px)` **never applies** — see repro below. |
| 3.3 | Row click restores with `abIconLand`; tray refreshes; emptied tray exits animated | **PASS** | artifacts + agents restored to rail with `ab-icon-land` + WAAPI; tray rebuilds to remaining rows; last restore → `.pm-ab-tray-closing` + 2 running anims (scale 0.92/0.87, op .74 sampled) → removed from DOM. |
| 3.4 / 3.5 | Outside-click / Escape close animated | **PASS** | Both: `.pm-ab-tray-closing` + WAAPI sampled mid-exit (`v1-06-tray-closing.png`), removed within 220ms, hidden set intact. |
| 3.6 | Rapid open/close ×5 | **PASS** | 9 toggles at 75ms cadence: transient max 1–2 trays (closing excluded from toggle query — by design), **0 orphan `.pm-ab-tray` after settle**, More still opens with correct row afterwards. |
| 4 | Rail collapse toggle | **PASS** | `transition: width` with `cubic-bezier(0.22,1,0.36,1)` (token `--motion-fast`, not `ease`). Mid-flight width sampled both directions (expand 43.2px/`anims=1`; collapse 53.1px/`anims=1`). Settles 72↔36; labels `display:none` collapsed; indicator repositioned with dTop=0/dH=0 (height resizes with icon); icons switch panels correctly in both states (`v1-07-collapsed-rail.png`). |
| 5 | Themes: friendly-dark / glass-light / retro-light / basic-dark | **PASS** | Tokens exact: 1.14/12px, 1.1/14px, 1.04/4px, 1.08/8px. 3-icon click subset per theme: views + indicator within 1px (0.00 deltas with pointer parked). Hover obeys token per theme (matrix a = 1.14/1.10/1.04/1.08; retro/basic ty=-1). Tray opens/closes under all 4 (`v1-08-theme-retro.png`). |
| 6 | Reduced motion — media query AND `data-motion="reduced"` | **PASS** | Both paths: indicator MOVES (snaps, top==target) with `getAnimations()=0`; hover scale applies instantly (a=1.14, 0 running anims); drag gesture intact with direct-follow ghost (zero lag dynamics; flat series vs 6.9→8.9 growing curve under full motion) and **no** `abIconLand`; tray appears fully visible instantly (op=1, rows op=1, 0 anims) and is removed instantly on Escape (`v1-09-reduced-tray.png`). All states correct. |
| 7 | Console / page errors | **PASS** | 0 console errors (favicon baseline didn't even fire on this server), 0 uncaught page errors, 0 failed requests across the full session. |

**Score: 16/17 sub-checks PASS, 1 FAIL (3.2 partial — translateX only; bg tint works).**

## Failure — exact repro

**3.2 More-tray row hover loses its `translateX(2px)` slide (animation fill-mode masking).**

- Selector: `.pm-ab-tray-row` (any row in the More tray; e.g. hide an icon via drag-to-More, click `#abMoreBtn`, hover the row).
- Expected: `transform: translateX(2px)` (and `:active` `translateX(2px) scale(.98)`) per CSS at `Concepts/PMConcept7.html:2476-2477`.
- Actual: computed transform stays `matrix(1, 0, 0, 1, 0, 0)` while `:hover` matches and `background`/`color` tints apply normally.
- Root cause (proven): rows run `animation: trayRowIn .24s var(--ease-out) both` (`:2491-2493`). `fill-mode: both` keeps the animation's `to { transform: none }` keyframe applied forever, and a filling CSS animation outranks the static `:hover` declaration for `transform`. Setting `row.style.animation = 'none'` in DevTools makes `translateX(2px)` apply immediately (measured `matrix(1,0,0,1,2,0)`).
- Suggested fix: `animation-fill-mode: backwards` (rows end at identity anyway, so nothing else changes), or run `trayRowIn` on an inner wrapper so `:hover` transform stays live on the row.
- Severity: low — hover feedback still exists via bg/color tint; the 2px slide and `:active` squash are the only casualties. Reproduced deterministically in two independent clean sessions.

## Screenshots (all in this directory)

1. `v1-01-indicator-midflight.png` — long-hop FLIP slug stretched ~528px mid-flight
2. `v1-02-drag-ghost.png` — drag ghost lagging pointer + drop indicator between slots
3. `v1-03-land-settle.png` — `abIconLand` settle sampled <40ms after drop
4. `v1-04-more-lit.png` — More button lit (`pm-ab-drop-hot`, opacity ramp) during drag-over
5. `v1-05-tray-cascade.png` — tray mid-cascade, row0 leading row1
6. `v1-06-tray-closing.png` — animated tray exit (Escape)
7. `v1-07-collapsed-rail.png` — collapsed 36px rail, indicator resized/repositioned
8. `v1-08-theme-retro.png` — retro-light rail
9. `v1-09-reduced-tray.png` — reduced-motion tray (instant, fully visible)

Raw logs: `results.json` (battery 1, 132 checks), `results3.json` (clean battery, 116), `results4.json` (targeted re-tests, 10). `results2.json` is a partial battery aborted after it self-contaminated (its own press-test's mouse-up outside the icon executed accidental drop-to-bottom drags — harness bug, discarded).

## Adjudicated battery-1 "failures" (harness artifacts, not product issues)

- *Indicator "no in-flight anim" at t≈90ms*: on panel SWITCH the icon `.active` swap (and thus the indicator flight) fires ~130ms after click, after `exitThen`'s outgoing-view exit; sampling at +170/210ms catches full flight. On first-open/close it starts immediately. Designed sequencing, not a bug.
- *Press scale read ~0.941*: sampled mid-spring; settled `:active` value is exactly 0.9.
- *Hover "missing translateY" on friendly/glass*: theme overrides intentionally use scale-only pill hover.
- *Geometry deltas ~1.4px under glass-light*: PM8 magnet-hover was translating/scaling the hovered icon at sample time; with pointer parked, deltas are 0.00. The indicator deliberately targets layout geometry (`offsetTop`) to avoid freezing magnet jitter — correct per its own design comment.
- *"Indicator doesn't fade on close"*: dashboard icon ships `.active` at boot, so the indicator correctly falls back to it; fades to 0 only when no icon is active.
- *Ghost "not converging"*: headless fps throttling stretches the lerp; converges with held pointer (code is a deterministic 0.35 lerp).
