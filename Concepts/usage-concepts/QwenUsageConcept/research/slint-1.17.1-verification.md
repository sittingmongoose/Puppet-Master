# Slint 1.17.1 Verification — Re-audit of the Portability Audit

Purpose: confirm or correct every flagged item in `slint-portability-audit.md` against
**exactly Slint 1.17.1** (released 2026-07-07). The prior audit was written against an
implicitly older Slint; several "blockers" assume pre-1.14/1.15 limitations that no longer hold.

Accessed date for all sources: **2026-07-30**.

## Authoritative sources (version-pinned to tag `v1.17.1` unless noted)

| Source | URL |
|---|---|
| Docs hub (rendered SPA, latest stable = 1.17.1) | https://slint.dev/docs |
| CHANGELOG (1.x history) | https://github.com/slint-ui/slint/blob/master/CHANGELOG.md |
| Builtin element definitions + doc comments | https://raw.githubusercontent.com/slint-ui/slint/v1.17.1/internal/compiler/builtins.slint |
| Colors & Brushes reference | https://raw.githubusercontent.com/slint-ui/slint/v1.17.1/docs/astro/src/content/docs/reference/colors-and-brushes.mdx |
| Animations guide | https://raw.githubusercontent.com/slint-ui/slint/v1.17.1/docs/astro/src/content/docs/guide/language/coding/animation.mdx |
| States guide | https://raw.githubusercontent.com/slint-ui/slint/v1.17.1/docs/astro/src/content/docs/guide/language/coding/states.mdx |
| Builtin functions (`animation-tick`) | https://raw.githubusercontent.com/slint-ui/slint/v1.17.1/docs/astro/src/content/docs/reference/global-functions/builtinfunctions.mdx |
| ScrollView widget | https://raw.githubusercontent.com/slint-ui/slint/v1.17.1/docs/astro/src/content/docs/reference/std-widgets/views/scrollview.mdx |
| EasingCurve enum (Rust source) | https://raw.githubusercontent.com/slint-ui/slint/v1.17.1/internal/core/animations.rs (line 145) |
| AnimationDirection enum (Rust source) | https://raw.githubusercontent.com/slint-ui/slint/v1.17.1/internal/core/properties/properties_animations.rs (lines 93-94) |
| Shipped easings gallery (32 named curves) | https://raw.githubusercontent.com/slint-ui/slint/v1.17.1/examples/gallery/ui/pages/easings_page.slint |
| Slint AI skill reference (transforms/gradients gotchas) | https://raw.githubusercontent.com/slint-ui/slint/v1.17.1/ai-plugins/skills/slint/reference/gotchas.md |

---

## Per-item verdicts (14)

Legend: **feasible** = direct mechanism exists; **partial** = works with caveats/redesign;
**not-feasible** = no equivalent symbol in 1.17.1.

### 1. `backdrop-filter` / live blur behind a translucent panel — **NOT-FEASIBLE**
Grep of `builtins.slint` finds the only `blur` symbols are `drop-shadow-blur` and
`inner-shadow-blur` (shadow radii, not a blur-behind primitive). There is **no** `backdrop-filter`,
**no** element `blur`/`filter`, **no** user-facing `Shader` element, **no** `Image.blur`,
**no** effects layer. `Image` exposes only `colorize`. → CONFIRMS prior blocker **B1**.
Fallback unchanged: bake a pre-blurred translucent asset, or a flat `Rectangle { background: rgba(...) }`.
Source: `builtins.slint` (blur only in shadow props, lines 215-249; `BoxShadow` internal comp line 1581).

### 2. `filter: blur()` on elements / blurred gradient orbs — **NOT-FEASIBLE**
Same root cause: no element-level blur primitive in 1.17.1. → CONFIRMS prior blocker **B2**.
Fallback: pre-blurred PNG/SVG, or approximate falloff with `@radial-gradient(circle ...)` fading to
transparent — **improved** by 1.17.0's new radius/center control (see item 4), but still not true blur.
Source: `builtins.slint`; CHANGELOG 1.17.0 (#11760).

### 3. `box-shadow` / elevation (`drop-shadow-*`) — **FEASIBLE**
Properties on Rectangle: `drop-shadow-offset-x`, `drop-shadow-offset-y`, `drop-shadow-blur`,
`drop-shadow-color` (all renderers). **New in 1.17.0:** `drop-shadow-spread` and
`inner-shadow-{color,blur,offset-x,offset-y,spread}` — **Skia renderer only**. Documented CSS
translation: `box-shadow: 2px 2px 4px 1px black` → `drop-shadow-offset-x: 2px; drop-shadow-offset-y: 2px;
drop-shadow-blur: 4px; drop-shadow-spread: 1px; drop-shadow-color: black;`. 1.17.0 also fixed
per-corner radii for drop shadows. → CONFIRMS prior **O3** (Skia-only caveat now explicit in source).
Source: `builtins.slint:206-265`; CHANGELOG 1.17.0.

### 4. Gradients — **FEASIBLE (all three exist)**
- `@linear-gradient(angle, color % …)`.
- `@radial-gradient(circle [radius] [at x y], color % …)` — **circle ONLY, no ellipse/tile**.
  The optional `radius` and `at x y` center are **new in 1.17.0** (#11760). Default radius = half the
  bounding-box diagonal; default center = element center.
- `@conic-gradient([from angle] [at x y], color deg …)` — added **1.13.0**; `from <angle>` added
  **1.15.0**; `at x y` added **1.17.0**. (Note: negative stop-angles must be rewritten as positive.)
→ Conic IS available (prior **O8** only said the *prototypes* don't use it). → **DOWNGRADES N6**:
radial is still circle-only (ellipse/`18px 18px` tiling unsupported), but center+radius are now
controllable, so the orb/glow approximation is much closer.
Source: `colors-and-brushes.mdx`; `gotchas.md`; CHANGELOG 1.13.0/1.15.0/1.17.0.

### 5. Color mixing — **FEASIBLE**
Methods on every color/brush: `.mix(other, factor)`, `.transparentize(factor)`, `.brighter(factor)`,
`.darker(factor)`, `.with-alpha(alpha)`, `.to-hsv()`, `.to-oklch()`. Channels: `.red/.green/.blue/.alpha`
(0-255). Global ctors: `rgb()`, `rgba()`, `hsv()`, `oklch(l,c,h[,a])`. **`oklch()`/`.to-oklch()` are new
in 1.15.0.** Note: there is **no `.rgba()` method** — alpha is set via `.with-alpha()`/`.transparentize()`
or the global `rgba()`; the prior audit's "Color.rgba()" phrasing is imprecise but the capability exists.
→ CONFIRMS prior **O1**. Source: `colors-and-brushes.mdx`; CHANGELOG 1.15.0.

### 6. Property animations — **FEASIBLE**
Syntax: `animate <prop>[, <prop2> …] { delay; duration; iteration-count; easing; direction; enabled; }`.
- Animates **any** property, including `x`, `y`, `width`, `height`, `opacity`; multiple props in one block.
- `delay: <duration>`; `duration: <duration>`.
- `iteration-count: <float>` — negative = infinite, fractional allowed.
- `direction: <AnimationDirection>` = `normal` | `reverse` | `alternate` | `alternate-reverse`
  (added 1.9.0; `Alternate`/`AlternateReverse` confirmed in `properties_animations.rs:93-94`).
- `enabled: <bool>` — toggle animation on/off (**new in 1.17.0**, #9604).
- **EasingCurve variants** (`internal/core/animations.rs:145`): `Linear`, `CubicBezier([f32;4])`
  (the `cubic-bezier(x1,y1,x2,y2)` function), and 32 named curves shipped in the gallery: `ease`,
  `ease-in`, `ease-out`, `ease-in-out`, plus `ease-{in,out,in-out}-{quad,cubic,quart,quint,expo,sine,back,circ,elastic,bounce}`.
  An `Easing` namespace (1.13.0) references curves outside `easing` properties.
- **SPRING: NO.** There is no spring easing keyword. `internal/core/animations/physics_simulation.rs`
  has a `ConstantDecelerationSpringDamper`, but that is **internal Flickable scroll/overscroll physics**,
  not a user-facing easing. Spring-like motion = `ease-*-elastic` / `ease-*-back` / `cubic-bezier()` with
  y>1 overshoot, or manual physics via `Timer` + `animation-tick()` (item 11).
→ DOWNGRADES the prior **B3** "springs must be Timer-stepped" concern: elastic/back + cubic-bezier cover
most CSS spring/cubic-bezier effects natively. Source: `animation.mdx`; `animations.rs:145`;
`properties_animations.rs:93`; `easings_page.slint`; CHANGELOG 1.9.0/1.13.0/1.17.0.

### 7. States + transitions — **FEASIBLE**
`states [ name when <cond> : { <prop>: <val>; in { animate * { … } } out { … } in-out { … } } ]`.
Three transition kinds: `in` (entering), `out` (leaving), `in-out` (both). `in-out` **added 1.12.0**.
`animate * {}` animates every property changed by the state. → CONFIRMS prior **N5**.
Source: `states.mdx`; CHANGELOG 1.12.0.

### 8. GridLayout row/col/rowspan/colspan — **PARTIAL (downgraded from blocker)**
- The `builtins.slint` doc-comment **still** says "Any bindings to these properties must be compile-time
  constants" (line 1817) — **this prose is STALE**. The CHANGELOG is authoritative for behavior:
  - **1.14.0:** "GridLayout: allow access to row/col/rowspan/colspan properties from other bindings."
  - **1.15.0:** "GridLayout: `row`, `col`, `colspan`, and `rowspan` properties can now be changed at
    runtime." **and** "GridLayout: Support for `if` and `for`."
  - **1.15.1:** "GridLayout: Honor colspan and rowspan in repeated rows." (#10727)
  - **1.17.1:** "GridLayout: Fixed … `colspan` in conditional cells." (#12257)
  → **Spans and positions CAN be data-bound / changed at runtime in 1.17.1.**
- **No CSS-Grid auto-placement engine:** there is still no `repeat()`, `minmax()`, or `grid-auto-flow:dense`
  equivalent. You assign `row`/`col` explicitly (or wrap cells in `Row` for sequential assignment).
- **However:** `FlexboxLayout` exists in 1.17.1 with `flex-wrap` (default `wrap`), `flex-direction`
  (`row`/`column`/`row-reverse`/`column-reverse`), `align-content`, `cross-axis-alignment` — i.e. genuine
  auto-flow / responsive re-wrapping. It is marked **`\draft`** (experimental) in the source, so treat as
  usable-but-unstable.
→ **DOWNGRADES prior blocker B4**: the compile-time-constant wall is gone (runtime spans + `if`/`for`);
responsive re-wrap is achievable via `FlexboxLayout` (draft) or Rust-side column math. Only *arbitrary
dense auto-placement* still needs Rust computation. Source: `builtins.slint:1817` (stale) +
`builtins.slint` FlexboxLayout (`\draft`); CHANGELOG 1.14.0/1.15.0/1.15.1/1.17.1.

### 9. Repeater with dynamic grid / reorderable+resizable widget grid — **FEASIBLE (mechanism exists)**
- `for item[index] in model : …` repeater.
- Position each item via `GridLayout` with **runtime** `row`/`col`/`rowspan`/`colspan` bound to model
  fields (1.15.0), or via absolute `x`/`y`.
- **Drag & drop is first-class in 1.17.0:** `DragArea` (`data: data-transfer`, `drag-image`,
  `drag-image-offset-x/y`, `allow-copy/move/link`, `dragging` out, `drag-finished(action)`) and
  `DropArea` (`can-drop(event)->DragAction`, `dropped(event)->DragAction`, `has-drag` out,
  `current-action` out). Plus `TouchArea` (manual pointer drag via `pointer-event`) and `Flickable`
  (panning). Reorder = mutate the model in `dropped`; animate the move with `animate x, y { … }`.
- No DOM `getBoundingClientRect`/FLIP — that part of **B5** stays true — but the model-driven fallback
  the prior audit prescribed is now backed by a real in-window DnD API.
→ **DOWNGRADES prior blocker B5** to needs-fallback (a redesign, not a missing capability).
Source: `builtins.slint:1234-1300`; CHANGELOG 1.17.0.

### 10. Scrollbars — **PARTIAL**
`ScrollView`: `vertical-scrollbar-policy` / `horizontal-scrollbar-policy` (`ScrollBarPolicy`:
`as-needed` [default] | `always` | `on`), `viewport-width/height` (in-out), `viewport-x/y` (in-out),
`visible-width/height` (out), `scrolled()` callback, `mouse-drag-pan-enabled`. `Flickable` = no bar.
Scrollbar **thumb color/shape is governed by the active widget style** (Fluent is default since 1.16.0)
and `Palette`/`StyleMetrics` — there is **no per-property scrollbar styling** like CSS `::-webkit-scrollbar`
/ `scrollbar-color`. → CONFIRMS prior **N3**: hide bars with `Flickable`, or theme globally via
`Palette`/`StyleMetrics`; arbitrary scrollbar CSS is not expressible. Source: `scrollview.mdx`; CHANGELOG 1.16.0.

### 11. Timers / `animation-tick()` — **FEASIBLE**
- `animation-tick() -> duration`: monotonically increasing time; calling it in a binding **re-evaluates
  the binding every frame** — ideal for manual springs and count-up counters
  (e.g. `width: parent.width * mod(animation-tick(), 2s) / 2s`).
- `Timer` pseudo-element: `interval`, `running`, `triggered()`; plus `stop()`/`start()`/`restart()`
  (**added 1.13.0**). `Timer` itself added 1.8.0.
→ CONFIRMS the prior **N4/N11** fallbacks are solid (and better than the audit implied).
Source: `builtinfunctions.mdx`; `builtins.slint:2642-2679`; CHANGELOG 1.8.0/1.13.0.

### 12. clip / border-radius / opacity / rotate / scale transforms — **FEASIBLE**
- `clip: bool` + **per-corner** `border-top-left-radius` / `border-top-right-radius` /
  `border-bottom-left-radius` / `border-bottom-right-radius` + `border-width` (internal `Clip` comp).
- `opacity: float` (default 1).
- **Transforms (added 1.14.0 — "rotation and scaling of all elements and their children"):**
  `transform-rotation: angle`, `transform-scale-x: percent`, `transform-scale-y: percent`,
  `transform-origin: point` (internal `Transform` comp, mixed into every element; `rotation-angle` is an
  alias). They apply **visually** to the element and descendants; the layout box is unchanged.
  There is **no `transform-translation`** — translation is done by animating `x`/`y`.
→ The prior audit's **B3** claim "Slint has **no `transform` property** (no translate/scale/rotate on
elements)" is **WRONG for 1.17.1** re: rotate+scale. Rotate and scale are native visual transforms;
only translate maps to `x`/`y`. Source: `builtins.slint:500-507` (Transform), `1745-1760` (Clip/Opacity);
`gotchas.md`; CHANGELOG 1.14.0.

### 13. Text: elide / wrap / font loading / tabular-nums — **FEASIBLE (tabular-nums partial)**
- `overflow: TextOverflow` (`clip` | `elide`) → elide yes. `wrap: TextWrap` (`no-wrap` | `word-wrap` |
  `char-wrap`; `char-wrap` evidenced by 1.13.1 fix).
- `font-family: string`, `font-weight: int` (100-900; `FontWeight` namespace constants **added 1.16.0**),
  `font-size`, `font-italic`, `letter-spacing`, `stroke`. Window-level `default-font-family`/`default-font-size`.
- **Font loading:** declarative via `font-family`; runtime custom-font registration via the Rust
  **fontique** API (`slint::fontique_010` since 1.17.0; `fontique_07` since 1.15.0). No `@font-face`-style
  declaration inside `.slint`.
- **tabular-nums:** **no** `font-feature-settings` / tabular-figures property exists. Use a font that ships
  tabular figures (selected via `font-family`) or a monospace family. → partial.
Source: `builtins.slint:509-660`; CHANGELOG 1.15.0/1.16.0/1.17.0/1.13.1.

### 14. `prefers-reduced-motion` OS binding — **NOT-FEASIBLE as a built-in**
Grep of `builtins.slint` for `reduced-motion` = **zero hits**. The `Platform` global exposes
`style-name`, `os`, `decimal-separator`, `open-url`, `macos-bring-all-windows-to-front()`; `Palette`
exposes `color-scheme`/dark-light detection and accent color (1.9.0/1.16.0/1.17.0 added system dark/light
detection) — but **nothing for motion preferences**. The app must read the OS setting itself
(Rust/winit) and mirror it into a `global` bool. → CONFIRMS prior **N13**.
Source: `builtins.slint` (Platform/Palette members); absence across CHANGELOG 1.8-1.17.

---

## CORRECTION SECTION — disposition of the prior audit's 6 blockers + 17 fallbacks

### Of the 6 BLOCKERS:

| Prior | Feature | New verdict in 1.17.1 | Disposition |
|---|---|---|---|
| **B1** | `backdrop-filter` live blur | **not-feasible** — no blur/backdrop/shader primitive | **CONFIRMED blocker** |
| **B2** | `filter: blur()` orbs | **not-feasible** — no element blur (gradient approx improved by 1.17.0 radius/center) | **CONFIRMED blocker** |
| **B3** | CSS `transform` motion | rotate+scale are **native** (`transform-rotation`, `transform-scale-x/y`, `transform-origin`, 1.14.0); translate→`x`/`y`; springs via elastic/back/cubic-bezier | **DOWNGRADED → needs-fallback** |
| **B4** | CSS-Grid auto-placement | row/col/span **runtime-bindable** + `if`/`for` (1.15.0); `FlexboxLayout` `flex-wrap` auto-flow exists (**\draft**); still no `repeat()`/`minmax()`/dense engine | **DOWNGRADED → needs-fallback / partial** |
| **B5** | JS FLIP drag/resize | first-class `DragArea`/`DropArea` + `data-transfer` (1.17.0) + runtime grid; no DOM measure (still true) but the prescribed model-driven fallback is now native | **DOWNGRADED → needs-fallback** |
| **B6** | `@media` layout switching | no media queries (true), but `root.width`-bound `states` (1.x) + `FlexboxLayout` wrap make responsive switching feasible | **DOWNGRADED → needs-fallback** (was already fallback-able) |

**Net: only B1 and B2 remain genuine missing-capability blockers.** B3-B6 were over-stated against an
older Slint; each now has a real 1.17.1 mechanism. They remain **redesigns** (not drop-in mappings), but
they are no longer "no direct equivalent" blockers.

### Of the 17 NEEDS-FALLBACK:

All 17 are **CONFIRMED** as needs-fallback (correct calls), with these 1.17.1 refinements:
- **N3** scrollbars — confirmed; `ScrollView` policy settable (`as-needed`/`always`/`on`), thumb not
  per-property styleable (flows from widget style + `Palette`/`StyleMetrics`).
- **N4 / N11** keyframe loops & rAF tickers — `Timer` (`stop/start/restart`, 1.13.0) + `animation-tick()`
  confirmed; no spring keyword, but `ease-*-elastic`/`ease-*-back`/`cubic-bezier` + `animation-tick()` cover it.
- **N5** transitions — `animate {}` + states `in/out/in-out` (in-out added 1.12.0) confirmed.
- **N6** radial ellipse/tiling — **still circle-only** (ellipse NOT supported; tiling unsupported), but
  1.17.0 `radius`+`at x y` improves positioning of the gradient approximation.
- **N7** icon glow — `drop-shadow-*` confirmed feasible on all renderers (spread/inner = Skia-only).
- **N8** brightness hover — `.brighter(factor)` confirmed.
- **N13** prefers-reduced-motion — confirmed: **no built-in**, must mirror via a `global` bool.
- **N1, N2, N9, N10, N12, N14, N15, N16, N17** — unaffected by 1.x changes; confirmed as written.

### UPGRADED (worse than the prior audit claimed): **none.**
No item is more limited than the prior audit stated. The audit was, if anything, **pessimistic** — it
assumed pre-1.14/1.15 Slint.

### DOWNGRADED (feasible in 1.17.1, wrongly flagged as blockers): **B3, B4, B5, B6.**
Plus capability expansions the prior audit understated: visual rotate/scale transforms (1.14.0),
`@conic-gradient` (1.13.0) + `from`/`at`/radius on conic & radial (1.15.0/1.17.0), `oklch()`/`.to-oklch()`
(1.15.0), runtime GridLayout spans + `if`/`for` (1.15.0), `FlexboxLayout` wrap (draft), in-window
`DragArea`/`DropArea` DnD (1.17.0), `animate enabled` (1.17.0) and `direction`/alternate (1.9.0).

### Already-accurate "OK" claims re-confirmed:
- **O3** box-shadow → `drop-shadow-*`; `drop-shadow-spread` + `inner-shadow-*` are **Skia-only** — CONFIRMED
  verbatim by CHANGELOG 1.17.0 and `builtins.slint:232-265`.
- **O1** `color-mix` → `.mix()`, **O2** `@linear-gradient`, **O4** opacity/border/per-corner radius — CONFIRMED.

---

## Changelog evidence — capabilities added in recent 1.x that affect these items

- **1.17.0 (2026-06-24):** `drop-shadow-spread` + `inner-shadow-{color,blur,offset-x,offset-y,spread}`
  (Skia only); fixed per-corner radii for drop shadows; `@conic-gradient`/`@radial-gradient` `at <x> <y>`
  + optional radius (#11760); `animate` `enabled` bool (#9604); `DragArea`/`DropArea` + `data-transfer`
  in-window DnD; `Flickable` animated wheel scroll; `Tooltip` element; `PopupWindow` `is-open`.
- **1.16.0 (2026-04-16):** Fluent default style; `FontWeight` namespace; `StyledText`/`@markdown`;
  `ScaleRotateGestureHandler`; `KeyBinding`/`@keys`; system accent color.
- **1.15.0 (2026-02-04):** **GridLayout `row`/`col`/`colspan`/`rowspan` runtime-changeable + `if`/`for`;**
  `Colors.oklch()`/`.to-oklch()`; `@conic-gradient` `from <angle>`; two-way bindings to struct fields;
  Window safe-area props.
- **1.14.0 (2025-10-21):** **"rotation and scaling of all elements and their children"**
  (`transform-rotation`/`transform-scale-x/y`/`transform-origin`); GridLayout row/col/span readable from
  other bindings; `Math.sign()`; `LayoutAlignment.space-evenly`.
- **1.13.0 (2025-09-03):** `@conic-gradient` added; `Easing` namespace; `Timer.stop()/start()/restart()`;
  `let` locals; software-renderer radial gradients.
- **1.12.0 (2025-06-16):** `in-out` state transition; `Platform.style-name`/`Platform.os`; `Math.exp`/`Math.ln`.
- **1.11.0 (2025-04-23):** non-square radial gradient fix; `float.to-fixed()/to-precision()`;
  `string.to-lowercase()/to-uppercase()`.
- **1.9.0 (2024-12-18):** **Animations `direction` property** (#6260); multiple `PopupWindow`s;
  `PopupWindow.close-policy`; `font-metrics` property.
- **1.8.0 (2024-09-23):** `Timer` pseudo-element; `changed <property>` callbacks; `SwipeGestureHandler`.

## Definitive animation mechanism (1.17.1)

```slint
animate x, y {
    delay: 0ms;                 // duration before start
    duration: 250ms;            // duration
    iteration-count: 1;         // float; negative = infinite; fractional ok
    easing: ease-out-elastic;   // see curve list below
    direction: alternate;       // normal | reverse | alternate | alternate-reverse
    enabled: true;              // 1.17.0: false = jump to target instantly
}
```
- **Easing curves:** `linear`; `cubic-bezier(x1,y1,x2,y2)`; and 32 named — `ease`, `ease-in`, `ease-out`,
  `ease-in-out`, + `ease-{in,out,in-out}-{quad,cubic,quart,quint,expo,sine,back,circ,elastic,bounce}`.
  Reference curves via the `Easing` namespace (1.13.0).
- **Spring: NO dedicated spring easing.** Nearest native = `ease-*-elastic`, `ease-*-back`, or
  `cubic-bezier()` with control points >1 (overshoot). True spring physics must be hand-driven with
  `Timer` + `animation-tick()`. (The `physics_simulation.rs` spring damper is internal Flickable
  scroll physics, not exposed as an easing.)
- States wrap these via `in { animate * {} }` / `out {}` / `in-out {}`.

## Bottom line

The prior audit's **two real blockers (B1 backdrop-filter, B2 element blur) stand** — 1.17.1 has no
blur/backdrop/shader primitive. The other **four "blockers" (B3 transform, B4 grid auto-placement,
B5 FLIP drag/resize, B6 media queries) are DOWNGRADED to needs-fallback**: 1.14.0 added native visual
rotate/scale transforms, 1.15.0 made GridLayout spans runtime-bindable with `if`/`for` (and a draft
wrapping `FlexboxLayout` exists), and 1.17.0 added a first-class in-window drag-and-drop API. All 17
needs-fallback items are confirmed; none is worse than stated. The concepts are therefore **closer to
Slint-portable than the prior audit concluded** — the only hard missing capabilities are live blur effects.
