# PM7 Motion Wave — Master Spec

Expert-level animation overhaul for the left activity-bar rail and all nine side
panels of PMConcept7. This document is the single source of truth for the wave.
Scope excludes dashboard, chat, pages, and the bottom debug host.

## 0. Governance (non-negotiable)

- `Concepts/PMConcept7.html` is a BUILD ARTIFACT. Never edit it. Edit ONLY
  `Concepts/pm7-tools/base/PM7-base.html` (snapshot already taken:
  `PM7-base.html.bak-pre-motion-wave`), then:
  1. `shasum -a 256 Concepts/pm7-tools/base/PM7-base.html` → new sha
  2. set `BASE_SHA = "<new sha>"` in `Concepts/pm7-tools/build_pm7.py`
  3. `python3 Concepts/pm7-tools/build_pm7.py` (default out = Concepts/PMConcept7.html)
  4. ALL gates must pass: brace_balance, css_vars_defined, js_node_check, no_emoji
- ASCII only, zero emoji (the no_emoji gate will fail the build otherwise).
- Comments: only where surrounding code convention already uses them (block
  banners, section notes). No running commentary.
- Every `var(--x)` you introduce must be defined (css_vars_defined gate checks
  deltas against base).
- Every new @keyframes MUST be referenced by a rule that ships, or T01-family
  sweeps/diff review will flag it. Verify presence in built output by grep.
- One writer at a time on the base file. Do your work end-to-end, then report.

## 1. File map (locate by selector / style-id, never by line number)

Base = PM7 minus transforms T01-T17 (no "PM7 SECTION" banners; blocks found by
`<style id=...>` / `<script id=...>` ids):
- `:root` motion tokens: `style#pm4-tokens-css` region — search `--motion-fast:120ms` /
  `--ease-out:cubic-bezier(.22,1,.36,1)` / `--ease-spring:cubic-bezier(.34,1.56,.64,1)`.
- Per-theme personality blocks: every `[data-theme...]` rule overriding
  `--ease-default` (basic-light/dark, retro-light/dark, glass-light/dark,
  friendly-light/dark — 8 blocks; search `--ease-default:` inside `[data-theme`).
- Rail/slot structure CSS: search `.activity-bar {`, `.activity-bar .icon`,
  `.side-panel-slot`, `.side-panel-view` (base shell CSS + `style#pm6-css-panels`).
- Theme rail overrides (friendly/glass hover scale): search
  `[data-theme^="friendly"] .activity-bar .icon .symbol`.
- Sprout menu engine CSS: search `.pm6-chat-more-menu, .pm6-tb-menu` (has the
  overshoot beziers `cubic-bezier(0.22, 1.55, 0.36, 1)` open / close states
  `.is-open` / `.is-closing`).
- Cozy shelves CSS: `style#pm6-css-cozy-shelves` — `railPanelIn`, `shPaneIn`,
  `shPulse`, `fmSprout`, `[data-acc]` grid-rows spring, `.pm-segtab-ink`,
  `.fm-children`, disclosure `.sh-idxpanel/.sh-filtpanel`, dead `fmPaneIn`.
- Rail JS: legacy click handler (search `sidePanelSlot.classList.add('hidden')`
  near `iconBtn`), `wireActivityBar`, `initActivityBarCustomization`
  (`armGesture`, `suppressNextClick`, More-tray builder `buildTrayRow` /
  `.pm-ab-tray`).
- Panel JS: `style`...` script sections containing `PMCozeMenu`, `wireAccordion`,
  `wireTabber`, `wireSegInk`, `fmInk`, `collapseAnim` (FM tree),
  `wireFiles`, `wireSearch`, `wireSource`, `wireArtifacts`, `PMPillFit`,
  `cozeSwitchPanel`, `PANEL_TARGETS`, `reduce()`.
- Panel markup: `#activityBar` icons (`data-ab-id`, `data-target`),
  `#sidePanelSlot` > `.side-panel-view#panel-files/search/run/source/git/docker/
  artifacts/testing/agents`.

## 2. W1 — Motion token layer (lands first; everyone consumes it)

Add to `:root` alongside existing motion tokens:
```
--ease-settle: cubic-bezier(.22,1.5,.36,1);   /* overshoot once, land soft */
--ease-pop:    cubic-bezier(.3,1.36,.34,1);   /* quicker pop for small things */
--ease-antic:  cubic-bezier(.5,-.28,.42,1.25);/* wind-up + overshoot; tiny excursions only */
--pm-travel: 10px;     /* distance for pane/panel slides */
--pm-stagger: 26ms;    /* per-step group stagger */
--pm-row-step: 22ms;   /* per-row list cascade step */
--ab-hover-scale: 1.09;
--ab-press-scale: .9;
```
Per-theme personalities — in EVERY `[data-theme...]` block that overrides
`--ease-default`, add (values below; keep proportional for light/dark twins):
| theme | --pm-travel | --pm-stagger | --pm-row-step | --ease-settle | --ab-hover-scale |
|---|---|---|---|---|---|
| basic-* | 8px | 22ms | 18ms | cubic-bezier(.26,1.4,.36,1) | 1.08 |
| retro-* | 4px | 12ms | 10ms | cubic-bezier(.3,1.14,.38,1) | 1.04 |
| glass-* | 14px | 30ms | 24ms | cubic-bezier(.24,1.34,.4,1) | 1.1 |
| friendly-* | 12px | 34ms | 26ms | cubic-bezier(.22,1.68,.36,1) | 1.14 |
Basic is a FULL personality — lively and crisp, not restrained. Retro is
mechanical (short travel, fast snap, minimal overshoot) but still alive.
Also tokenize existing off-token stragglers: `.activity-bar { transition: width
0.2s ease }` and `.side-panel-slot { transition: width 0.3s ease }` → token
easing/duration; `pm6-panels-pulse ... ease-in-out` → `var(--ease-out)`; delete
dead `@keyframes fmPaneIn` + its redundant nth-child(4) delay line.

## 3. W2 — Rail chrome

- **Sliding active indicator**: replace the teleporting `.icon.active::before`
  with a real element `.ab-ind` (JS appends to `#activityBar`, out of flow,
  left edge, matching current `::before` look). JS: on active-icon change,
  FLIP-animate it between icons with WAAPI: keyframes that STRETCH to span
  from→to during travel and settle at the destination (3 keyframes: at-from /
  span-both (height = distance + icon, reduced opacity) / at-to), duration
  `--motion-med`, easing `--ease-settle` (per-theme). Hide the CSS `::before`
  (keep selector for theme color compat; indicator reads same accent vars).
  Initial position set with no animation on load.
- **Icon hover/press in ALL themes**: base `.activity-bar .icon .symbol` gets
  `transition: transform var(--motion-fast) var(--ease-settle), background
  var(--motion-fast) var(--ease-out), box-shadow var(--motion-med)
  var(--ease-out), color var(--motion-fast) var(--ease-out)`;
  hover: `transform: translateY(-1px) scale(var(--ab-hover-scale))`;
  `:active`: `transform: scale(var(--ab-press-scale))` (squash — anticipation);
  release springs back via the settle transition. Friendly/glass theme blocks
  that already set hover scale now just feed the knob. Active-icon glow
  (`box-shadow`/background on `.icon.active .symbol`) transitions in/out.
- **Badge pop**: keyframes `abBadgePop {0%{transform:scale(.4)} 60%{transform:
  scale(1.22)} 100%{transform:scale(1)}}` with `--ease-out`; fire on load for
  badges with count > 0 and on any JS count update (add class, remove on
  animationend).
- **Drag reorder**: ghost follows pointer with spring-lag (rAF lerp factor
  ~0.35/frame instead of raw style writes); drop indicator moves with
  `transition: transform var(--motion-fast) var(--ease-settle)` (slide between
  slots, not teleport); on drop, landed icon plays `abIconLand`
  (scale 1→1.07→1, 260ms, `--ease-pop`). Keep `suppressNextClick` semantics.
- **More tray**: give `.pm-ab-tray` a real entrance/exit — reuse the sprout
  beziers: open `transform-origin: 100% 100%` (grows up-left from the More
  button), scale(.7,.5)→1 with `cubic-bezier(0.22,1.55,0.36,1)` 300ms + fade;
  rows cascade (`--pi` delay × `--pm-row-step`, cap 6); exit via `.is-closing`
  (150ms shrink+fade) then remove. Row hover: bg tint + translateX(2px).
  `#abMoreBtn[data-empty]` opacity change gets a transition.
- Rail collapse width: tokenized in W1; add `will-change: width` sparingly.

## 4. W3 — Panel lifecycle (the biggest gap: no exits today)

- **Enter** — upgrade `railPanelIn` to overshoot + settle (keep the one-shot
  `.pm-panel-enter` MutationObserver pattern; NEVER animate `.active` itself;
  do not break the pill-fit measure guard that sets `animation: none` on the
  measure pass — that guard prevents the documented black flash):
```
@keyframes railPanelIn {
  from { opacity:0; transform: translateX(calc(var(--pm-travel) * -1)) scale(.995); }
  70%  { opacity:1; transform: translateX(calc(var(--pm-travel) * .22)) scale(1.001); }
  to   { transform:none; }
}
```
  duration ~340ms, default easing between keyframes is `--ease-out`.
- **Exit** — new `@keyframes railPanelOut { to { opacity:0; transform:
  translateX(calc(var(--pm-travel) * -.6)); } }` 130ms `--ease-smooth`.
  New orchestrator `PMPANEL.go(targetId)` (IIFE next to the legacy handler)
  that the legacy rail click handler delegates to (keep handler's class
  semantics EXACTLY: `.active` swap on views, `.hidden` on `#sidePanelSlot`):
  - close (same icon re-click): add `.pm-panel-exit` to outgoing view, after
    animationend/130ms-timeout remove `.active` + add `.hidden` + clean class.
  - switch: exit outgoing (130ms) then swap + incoming `.pm-panel-enter` fires
    via existing observer. If another switch arrives mid-exit, cancel timer,
    swap immediately (interrupt-safe — single pending state per slot).
  - first open of session: slot `.hidden` removed instantly (width appears)
    but view ENTER animation covers it; add a subtle slot settle: width
    transition already tokenized.
  - `reduce()` → immediate swaps (existing class flow, no classes added).
- **Panel content settle**: on enter, also cascade the view's top-level rows
  (see W4 stagger) — enter = container slide + row cascade together.

## 5. W4 — Inner tabs, panes, lists

- **Ink**: upgrade both inks (`wireSegInk` scaleX approach and `fmInk`
  width+translateX approach): transition/animation easing → `--ease-settle`,
  plus STRETCH during travel: WAAPI 3-keyframe pulse (from / mid with
  scaleX(width+|dx|)/wider width, transform-origin at travel direction / to),
  origin flips by direction (moving right → origin left, and vice versa).
  Keep ResizeObserver/transitionend re-syncs.
- **Direction-aware panes**: `wireTabber` computes old vs new tab index →
  sets `--pm-pane-dir: 1|-1` on the panel view before un-hiding. Pane enter
  keyframes `shPaneInDir`: `from { opacity:0; transform: translate(
  calc(var(--pm-travel) * .55 * var(--pm-pane-dir,1)), 0) }` + existing rise
  blended — content slides FROM the direction of the tab you came from
  (new index > old → dir 1).
- **Per-row stagger (replaces the 4-child nth-child cap)**: on wire-up, assign
  `--pi: min(index,7)` to children of every `[data-pane]` and to row lists
  (`.sh-run`, `.sh-ctr`, `.sh-card`, `.sh-commit`, `.sh-chg`, `.sh-wt`,
  `.fm-changeitem`, `.fm-openitem`, `.sh-hit` groups, notify rows). CSS:
  `[data-pane]:not(.pm-hidden) > * { animation: shPaneInDir .3s var(--ease-out)
  both; animation-delay: calc(var(--pi,0) * var(--pm-row-step)); }` (delete the
  old nth-child ladder). Also re-cascade rows on panel enter and on
  filter/sort re-render (helper `pmRecascade(scope)` that bumps a class to
  re-fire, or resets `animation: none` → reflow → restore).
- **FLIP for reorder/filter**: helper `pmFlip(scope, mutate, itemSel)` —
  capture rects, run mutate(), invert with transforms, WAAPI to identity
  (`--motion-med`, `--ease-settle`), `reduce()`-guarded. Apply in
  `wireArtifacts` (family tabs + sort menu — both do REAL DOM reorders),
  worktree filter chips, docker dangling chip, search filter chip re-renders.
- **Tab icon lift** stays (`.pm-segtab-item.active svg` translateY/scale) but
  easing → `--ease-settle`.

## 6. W5 — Trees, accordions, disclosures

- **FM tree (`collapseAnim`)**: keep measured max-height (interrupt-safe
  pattern is good) but: container easing → `var(--ease-smooth)` explicitly;
  on OPEN, cascade child rows: assign `--pi` (cap 6) to `:scope > .fm-children`
  direct rows/nodes and they play `fmKidIn` (`translateX(-5px)+fade → none`,
  .26s, delay × `--pm-row-step`); chevron gets overshoot: keyframes
  `chevOpen { 0%{rotate:0} 70%{rotate:102deg} 100%{rotate:90deg} }` (and
  reverse `chevClose`), .3s — applied via class toggled in the same JS path.
- **Shelf accordions (`[data-acc]` grid-rows)**: keep `--ease-spring` on
  grid-template-rows ONLY for friendly (personality: bounciest); other themes
  switch that transition to `--ease-settle` (theme-aware rule keyed on
  `[data-theme...] [data-acc] ...`) so height overshoot doesn't shiver rows
  below in calmer themes; on `.open` add inner row cascade (same `--pi`
  pattern, cap 6). Header hover: subtle bg tint + chevron nudge.
- **Disclosures (`.sh-idxpanel`, `.sh-filtpanel`, FM filter wrap)**: easing →
  `--ease-settle`; inner controls cascade on open; toggle chevron springs.

## 7. W6 — Menus & popovers

- **`fm-ctx`**: replace `fmSprout` scale(.94) with the tb-menu sprout system —
  transition-based (not one-shot animation) with the same overshoot beziers,
  transform-origin at the RIGHT-CLICK POINT (JS sets `--pm6-sprout-ox/oy` from
  event coords relative to menu), `.is-closing` exit (reuse the engine's close
  timing pattern), item cascade (`--pi` × 12ms, cap 8), submenu
  `.fm-ctx-sub` cascades from parent hover with directional origin.
- **All menu items (tb + fm)**: hover = bg tint + `translateX(2px)`
  (`--motion-fast`/`--ease-out`), `:active` scale(.98); selected-item check
  pops on change (`--ease-pop` 200ms). Keyboard focus gets the same treatment
  as hover.
- **Sprout triggers (`.pm6-tb-menu-trigger`)**: chevron rotates 180deg with
  `--ease-settle` while open; trigger keeps `aria-expanded`.

## 8. W7 — Liveness, feedback, row polish

- **Value flash**: helper `pmFlash(el)` toggles `.pm-flashing`; CSS `::after`
  overlay `accent-soft` opacity 0→.55→0, 550ms `--ease-out` (no box-shadow
  keyframes — Slint-safe). Fire on REAL state changes: worktree filter
  results, artifact sort/family reorders, search filter chip, collapse-all
  state flips, commit/stage counts if the demo updates them, docker container
  Stop/Start status chips, test run status changes.
- **Status pulses**: unify easings to `var(--ease-out)`; stagger paired dots
  slightly (`animation-delay` offset) so they breathe, not blink in unison.
- **Legacy instant-hover rows** (`pm6-sp-row`, `pm6-fm-file`,
  `pm6-search-hit`, any others in panel scope): add `transition: background
  var(--motion-fast) var(--ease-out), transform ...` + `translateX(2px)` hover
  where a nudge fits.
- **Chips/buttons**: `transition: all` → explicit property lists; chip select =
  bg/color pop + scale pulse `.96→1` (`--ease-pop`); press states get
  `scale(.97)` squash.

## 9. W8 — Hygiene + reduced-motion contract (folded into every workstream)

- Every new keyframe/transition gets killed by BOTH:
  `[data-motion="reduced"] *, ...` data-attr rules AND
  `@media (prefers-reduced-motion: reduce)` — extend the existing kill blocks
  in the cozy-shelves CSS region; JS paths check `reduce()`.
- Contract: killing motion must leave the CORRECT END STATE (open shelves
  open, ink at final position, rows opacity 1, menus visible when open).
- `will-change: transform` on the indicator, ghost, tray; avoid `transition:
  all`; prefer transform/opacity; height/width animation only where already
  established (grid-rows shelves, measured fm-children, slot width, ink width).
- Keep 60ms setTimeout refit fallbacks during this wave; transitionend
  upgrades are optional, never mandatory.

## 10. Do-not-touch list

Dashboard/chat/pages/bottom-host CSS+JS, `PM_PAGES`, sprout engine positioning
logic (extend, don't rewrite), `cozeSwitchPanel` + `PANEL_TARGETS` contracts,
`data-*` attribute names, pill-fit measure guard, `suppressNextClick`,
Ctrl+1..9 hotkey DOM-order contract, localStorage key `pm.activity_bar_order:v2`.

## 11. Verification protocol (all agents)

- Build: `python3 Concepts/pm7-tools/build_pm7.py` → 4 gates PASS.
- Standalone headless browser (isolated from shared Playwright MCP):
  `const { chromium } = require('/var/folders/11/2hptcv3s40dbdlfwdzmy3ym80000gn/T/opencode/pw-standalone/node_modules/playwright');`
  Serve Concepts/ yourself: `python3 -m http.server <unique port 8792-8799> --bind 127.0.0.1`
  from Concepts/, kill it when done.
- Motion proof pattern: `document.getAnimations()` / element-level
  `el.getAnimations()` sampled during interactions; assert non-empty where
  animation expected, empty under `page.emulateMedia({reducedMotion:'reduce'})`.
- Evidence: screenshots + a `report.md` per agent in
  `Concepts/motion-wave/evidence/<agent-id>/`.
- Console must show zero NEW errors vs baseline (baseline = favicon 404 only).

## 12. Integration order

A1 tokens/hygiene → A2 rail → A3 panel lifecycle → A4 tabs/panes/lists →
A5 trees/accordions/disclosures → A6 menus → A7 liveness+final hygiene.
Each agent: read this spec fully first, prototype risky recipes in
`Concepts/motion-wave/protos/<workstream>.html` (browser-verified) before
touching the base, then integrate → re-pin → rebuild → gates → grep-check new
symbols in `Concepts/PMConcept7.html` → browser smoke of own surface → report.
