# Slint 1.17.1 Portability Audit — Usage-Concept Prototypes

Target runtime: Rust + **Slint 1.17.1**. Scope: all active shared CSS/JS
(`base.css`, `themes.css`, `usage-*.css`, `usage-*.js`, `menu.js`, `icons.js`).
Slint capability claims verified against official docs (slint.dev, 1.17.1):
- Rectangle: `background` brush, `border-*`, `border-radius` (per-corner), `clip`, `drop-shadow-*`, `inner-shadow-*` — `/reference/elements/rectangle/`
- Colors & Brushes: `@linear-gradient`, `@radial-gradient` (**circle only**), `@conic-gradient`; `color.mix()`, `.transparentize()`, `.brighter()`, `.darker()`, `.with-alpha()`, `oklch()`, `hsv()` — `/reference/colors-and-brushes/`
- GridLayout: `row`/`col`/`rowspan`/`colspan` exist **but "any bindings to these properties must be compile-time constants"** → no auto-flow / responsive re-wrap — `/reference/layouts/gridlayout/`
- PopupWindow, Flickable/ScrollView, DragArea/DropArea, TouchArea, Timer, `animation-tick()`, property `animate {}`, states/transitions.
- **No** CSS `filter`/`backdrop-filter`, **no** CSS `transform` on elements, **no** `@keyframes`, **no** `@media`, **no** `position:sticky/fixed`, **no** `z-index`, **no** `:has()`/selectors.

Severity: **blocker** = no direct equivalent; requires a documented redesign pattern.
**needs-fallback** = a deterministic Slint path exists but code must be rewritten.
**ok** = direct/equivalent mapping or harmless.

---

## BLOCKERS (6)

### B1 — `backdrop-filter` blur-behind surfaces
- `base.css:63-64` `blur(34px) saturate(160%)` (title bar glass), `base.css:83` `blur(14px)` (status bar), `base.css:490` friendly-theme status bar.
- Does: frosted-glass translucency sampling the pixels behind the chrome.
- Slint has **no backdrop blur**. Fallback: the prototype already anticipates this (`base.css:34` "pre-blurred asset in production") → bake a pre-blurred translucent asset, or use a flat semi-opaque `Rectangle` (`background: rgba(...)`); accept loss of live blur.

### B2 — `filter: blur()` ambient blobs
- `base.css:50` `filter: blur(60px)` on `.glass-bg` orbs (`.gb-a/b/c`, `base.css:52-54`).
- Does: soft out-of-focus color fields behind content.
- No element-level blur in Slint. Fallback: pre-blurred PNG/SVG asset, or approximate the falloff with `@radial-gradient(circle ...)` to transparent (see N6).

### B3 — CSS `transform` (translate/scale/rotate) for motion
- `base.css:158,169,178` sprout `translate3d/scale3d`; `base.css:265,703,706,782,786` shimmer `translateX`; `base.css:350,598` button `scale(.96/.97)`; `base.css:547,556,611,615,634,639` toast/reveal nudges; `usage-shared.css:81` `rotate(360deg)` spin; `usage-shared.css:249,252,253,256,262` sprout + tooltip transforms; `usage-tabs.css:16-17` panel slide; `usage-widgets.css:11` widget entrance.
- Slint has **no `transform` property** (no translate/scale/rotate on elements; gestures ≠ rendering). Fallback: animate `x`/`y`/`width`/`height` + `opacity` via `animate {}`/states; springs via easing curves; rotation (spinner) → std-widgets `Spinner` or a Timer-stepped image. Every one of these motion effects must be re-authored.

### B4 — CSS Grid dynamic auto-placement / `repeat()` / `minmax()` / `span`
- `usage-shared.css:38` `.us-cols repeat(4,minmax(0,1fr))` + `:42-44` `grid-column: span 3/2/1`; `usage-widgets.css:1` `.uw-canvas repeat(4) grid-auto-rows`; `base.css:752` `.pm-2col`.
- Does: cards auto-flow into N columns and span at breakpoints.
- Slint `GridLayout` requires **compile-time-constant** `row/col/span`; there is **no auto-flow / auto-placement / re-wrapping**. Fallback: compute row/column assignment in Rust from a width binding and drive a model, or build nested `HorizontalLayout`/`VerticalLayout` rows; explicit fixed grids (e.g. `usage-context.css:29,36,41` — no span) map 1:1 to `GridLayout`.

### B5 — JS FLIP + `getBoundingClientRect()` drag/resize canvas
- `usage-widgets.js:26,57,61,163` (FLIP capture/apply + drag hit-test), `:138,157` (pointer resize/drag on `window`).
- Does: measures live DOM rects to animate reorder, and free-drags/resizes widgets.
- No DOM measurement in Slint. Fallback: model-driven layout — store each widget's `c`/`r` in a Rust model, render via `GridLayout` (const spans) or absolute `x`/`y`, move items with `DragArea`/`DropArea`/`TouchArea`, animate position changes with `animate {}`. FLIP itself is deleted; the data model already persists `c`/`r` (see `usage-widgets.js:23`).

### B6 — `@media` width-driven layout switching
- `usage-shared.css:42-44,265-266`; `usage-widgets.css:2-4,40-41`; `base.css:113-118,520-530,568`; `usage-context.css:30`.
- Does: switches column counts and hides chrome by viewport width.
- Slint has **no media queries**. Fallback: bind to `root.width`/`Window` size and drive `states`/conditional layouts (pure visibility toggles like `base.css:113-115` are easy; the column switches are coupled to B4).

---

## NEEDS-FALLBACK (17)

| # | Feature | file:line(s) | Slint equivalent / fallback |
|---|---|---|---|
| N1 | `:has()` running-row tint | `base.css:673-691` | Drive row background from a data property (`is-running`) on the model; bind `Rectangle.background` conditionally. |
| N2 | `position: sticky` table header | `usage-shared.css:172` | Keep header as a sibling **above** a `Flickable`/`ScrollView`, or use `StandardTableView` (draws its own header). |
| N3 | custom/hidden scrollbars (`::-webkit-scrollbar`, `scrollbar-color`) | `themes.css:56-66`; `base.css:273-278`; `usage-shared.css:33-35,269-273`; `usage-tabs.css:1-2` | Prototype mostly *hides* bars → use `Flickable` (no bar). `ScrollView` bar style is fixed (thumb color not styleable). |
| N4 | `@keyframes` loops (shimmer/pulse/spin/flash) | `base.css:333,696,706,786`; `usage-shared.css:81,131,180`; `usage-tabs.css:16-17`; `usage-widgets.css:11` | `Timer`/`animation-tick()` driving a 0..1 phase, or repeated `animate {}`; spinner → `Spinner` widget. (Coupled with B3.) |
| N5 | one-shot `transition:`/entrance (42 decls; `railPanelIn`) | `base.css:264-265` + 42 `transition:` sites | `animate <prop> { duration; easing }` and `states`/transitions. Direct mapping, re-authored. |
| N6 | elliptical/tiled `radial-gradient` | `base.css:41-43,711,776-777`; `usage-shared.css:293-296` | Slint `@radial-gradient` is **circle only**; tiling (`/ 18px 18px` dot grid) unsupported → approximate with circle, or repeat a `Path`/image. |
| N7 | `filter: drop-shadow()` icon glow | `usage-context.css:3` | `drop-shadow-*` on a containing `Rectangle`, or a pre-glowed asset. |
| N8 | `filter: brightness()` hover | `usage-widgets.css:8` | Swap to a `.brighter(factor)` brush on hover state. |
| N9 | `localStorage` persistence | `usage-chrome.js:142`; `usage-widgets.js:20,23` | Rust-side persistence (config file / `directories` crate) behind a callback. |
| N10 | `postMessage` cross-window sync | `usage-chrome.js:15,209,218` | Single-process app: share one model/`global`; drop the mechanism. |
| N11 | `requestAnimationFrame` tickers/springs | `usage-data.js:420-421`; `usage-tabs.js:69,71,137,150,165`; `usage-chrome.js:43`; `usage-widgets.js:64,104` | `Timer` + `animation-tick()` for springs/counters; easing curves for cubic-bezier springs. |
| N12 | `MutationObserver` resync | `usage-tabs.js:159` | Unnecessary — Slint reactivity re-evaluates bindings automatically. |
| N13 | `matchMedia('(prefers-reduced-motion)')` | `usage-data.js:403`; `usage-tabs.js:5` | A `global` bool (already mirrored by the chrome's reduced-motion toggle). |
| N14 | `position: fixed; inset` overlays | `base.css:36,184`; `usage-widgets.css:30` | Menus → `PopupWindow`; focus mode → a full-`Window` overlay component. |
| N15 | `z-index` stacking | `usage-tabs.css:3,14-15`; `usage-shared.css:262`; `usage-widgets.css:30`; `base.css:184` | Declaration order defines stacking; overlays via `PopupWindow`. |
| N16 | `:nth-child` stagger / responsive hide | `base.css:474,526,533,783-785` | Index math in `for` loops (`index % 3`); width bindings for hides. |
| N17 | popup anchor via `getBoundingClientRect` | `menu.js:20,72,88,130`; `usage-context.js:96,98`; `usage-widgets.js:28` | `PopupWindow` positions relative to its parent automatically; drop manual viewport math. |

---

## OK (8)

| # | Feature | Evidence | Slint mapping |
|---|---|---|---|
| O1 | `color-mix()` (~70 sites) | base.css, themes.css:27-28,52-53, usage-*.css throughout | `a.mix(b, factor)` / `.transparentize()` — exact documented equivalent. |
| O2 | `linear-gradient` | `base.css:628,682,702,781` etc. | `@linear-gradient(angle, color %, …)`. |
| O3 | `box-shadow` / `--elev-*` (24 sites) | `themes.css:29-30,96-99,148-151` | `drop-shadow-offset-x/y`, `drop-shadow-blur`, `drop-shadow-color` (docs give exact CSS box-shadow translation). Note: `drop-shadow-spread`/`inner-shadow-*` are **Skia-renderer only**. |
| O4 | `opacity`, `border`, `border-radius` | everywhere | Direct `opacity`, `border-width`/`border-color`, `border-radius` (per-corner available). |
| O5 | `will-change` | `base.css:163,637`; `usage-tabs.css:3,8` | Perf hint; drop. |
| O6 | `cursor` | 31 sites | Drop; pointer handled by `TouchArea`. |
| O7 | `@supports` feature query | `usage-shared.css:282` | Not needed; pick the Slint easing directly. |
| O8 | Absent risky features | — | **Not used anywhere:** `scroll-snap`, `subgrid`, container queries, `mix-blend-mode`, `grid-auto-flow:dense`, `clip-path`, `mask`, `oklch()/lab()` in CSS, `conic-gradient`, `ResizeObserver`, `IntersectionObserver`. |

---

## Summary

| Severity | Count |
|---|---:|
| blocker | **6** |
| needs-fallback | **17** |
| ok | **8** |
| **total categories** | **31** |

### Verdict

**The concepts are NOT Slint-portable today.** Six blockers have no direct Slint 1.17.1
equivalent — live `backdrop-filter`/`blur` (B1, B2), CSS `transform` motion (B3),
dynamic CSS-Grid auto-placement (B4), JS FLIP drag/resize (B5), and `@media` layout
switching (B6). Each has an identified fallback *pattern*, but none is a drop-in:
B3–B6 in particular force the widget/board/canvas concepts (U6/U8/U9) to be re-authored
as model-driven layouts instead of measured-DOM layout. "Slint-portable" can only be
claimed after every blocker has its fallback implemented and re-verified; the 17
needs-fallback items are routine rewrites, and the 8 ok items map directly.
