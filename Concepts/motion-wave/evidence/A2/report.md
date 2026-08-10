# A2 — W2 Rail Chrome

Workstream: W2 (rail chrome). Base edited ONLY:
`Concepts/pm7-tools/base/PM7-base.html`. Build output regenerated:
`Concepts/PMConcept7.html` (never hand-edited). W1 tokens consumed, not redefined.

## Prototype (Concepts/motion-wave/protos/rail.html)
38/38 assertions on standalone Playwright (:8793). Verified: FLIP stretch
keyframes (span-both mid, opacity .55, offset .45), interrupt-safe restart,
hover knobs per theme, press squash, badge pop lifecycle, ghost lag 78px ->
0.02px converge, drop-indicator slide, land pop, tray sprout/cascade/exit +
Escape, drop-to-hide, both reduce() paths, friendly pill restyle.

## New BASE_SHA
`fdfe5fbc2fd7a7ad973024fbda7cfbb8303d26ef9e00207f3903157c8326c095`
(was `ccf9ffa8...`); re-pinned in build_pm7.py line 45.

## Changes (anchors / selectors)
- Base rail CSS: `.activity-bar` (+position:relative, `--ab-ind-left:0px`,
  `--ab-ind-inset:4px`); `.icon` (+z-index:1); `.icon .symbol` transition +
  `:hover .symbol` translateY(-1px)+scale(var(--ab-hover-scale)) +
  `:active .symbol` scale(var(--ab-press-scale)); `.icon.active::before`
  hidden (opacity:0, rule kept); new `.ab-ind`.
- Customization CSS: `.pm-ab-drop-indicator` +transition top; @keyframes
  `abIconLand`/`.ab-icon-land`, `abBadgePop`/`.ab-badge-pop`; `#abMoreBtn`
  opacity transition; `.pm-ab-tray` sprout closed/open/closing states
  (origin 100% 100%, sprout beziers); row transition + hover translateX(2px)
  + @keyframes `trayRowIn` cascade (--pi x --pm-row-step, cap 6); W2 reduced-
  motion kill block (media + [data-motion="reduced"]).
- Theme blocks: glass `.ab-ind` bg + hover knob + :active; friendly inset 8,
  symbol transition +box-shadow/color, hover knob, :active, `.ab-ind` sky pill.
- pm6-js-panels JS: `reduce()`/`cssMs()` helpers; `abIndicator()` IIFE
  (MutationObserver on bar childList+class + documentElement theme/motion +
  resize; WAAPI 3-keyframe FLIP, --motion-med/--ease-settle, cancel-before-
  start); `abBadgePopInit()`; drag engine lerp loop (0.35/frame, reduce() =
  direct follow), `landIcon()` on `applyDrop()` result; `closeTray()` animated
  exit routed from killTray/outside-click/Escape/drag-start; tray open via
  double-rAF `pm-ab-tray-open`; rows get `--pi`; boot() calls both new IIFEs.

## Gates + grep (built PMConcept7.html)
brace_balance, css_vars_defined, js_node_check, no_emoji: ALL PASS.
@keyframes abBadgePop/abIconLand/trayRowIn: 1 each; ab-ind: 15 sites.

## Browser smoke of built file (:8793, friendly-dark) — 37/37
All 9 panel-icon switches FLIP (260ms) + land exact + panel follows; hover
1.14 knob + press .9; close -> indicator falls back to Dashboard, re-open
FLIPs back; drag-to-hide (ghost lag 42px, More drop-hot, no land, suppressed
click); tray sprout + row cascade + animated exit; tray-row restore + land
pop; reorder drag (lag + sliding indicator + land + order + suppressNextClick
intact); Ctrl+3 -> source FLIP; prefers-reduced-motion: zero WAAPI, instant.
Console: 0 errors; network: favicon-404 baseline only. Screenshots in this dir.

## Deviations
1. `.ab-ind` sits at left:0 (inner rail edge): the old ::before left:-6px was
   outside the rail and clipped by the bar's overflow-x:hidden (invisible).
2. Indicator tracks `.icon[data-target].active` with `.icon.active` fallback:
   Dashboard/Chat keep their own .active while a panel is open (dual-active).
3. geom() uses offsetTop/offsetHeight, not rects: the pre-existing pm8-live
   jiggle translates icons subpixels constantly; rect samples froze jitter in.
4. No rail badge markup exists today (.pm6-ab-dot defined but unused; no badge
   writes found in panel scope): abBadgePop ships armed, load scan is a no-op.
5. Added friendly/glass `:active .symbol` rules (their higher-specificity
   hover rules would otherwise beat the base press squash).
6. Tray-row click-restore also plays abIconLand (same settle as drag-restore).
