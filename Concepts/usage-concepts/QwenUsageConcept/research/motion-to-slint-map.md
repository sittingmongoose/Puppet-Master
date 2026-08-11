# PM Motion → Slint 1.17.1 Mapping

Deterministic Slint equivalents (or documented fallbacks) for every CSS/JS motion technique used in
the `Concepts/usage-concepts/` prototypes. Slint claims below are verified against the Slint 1.17.1
docs (`docs.slint.dev`, version selector pinned to 1.17.1) and Slint source
(`github.com/slint-ui/slint`: `internal/core/animations.rs`, `internal/core/items.rs`,
`internal/compiler/typeregister.rs`). See `motion-source-ledger.json` (Slint entry) and
`motion-token-map.json` for per-token values.

## Capability ground truth (Slint 1.17.1, source-confirmed)

| Capability | Slint status |
|---|---|
| Property animation | YES — `animate <prop> { duration; delay; iteration-count; easing; direction; enabled }` |
| Easing | `linear` + named Penner set (…elastic/bounce) + `cubic-bezier(a,b,c,d)` (EasingCurve::CubicBezier). **NO spring.** |
| State-driven transitions | YES — `states [...]` with `in {} / out {} / in-out {}` blocks binding `animate` to state changes |
| Loops | `iteration-count: <0` = infinite, fractional OK; `direction: alternate`; `animation-tick()` for time-driven |
| Animatable transforms | `opacity`, `visible`, `translate`, `scale`, `rotation-angle` (+`*-origin-x/y`), `x/y/width/height`, `cache-rendering-hint` |
| `backdrop-filter` / live blur | **NO** — no `backdrop` symbol in core. |
| CSS `box-shadow` on a box | **NO** — Rectangle has no shadow; a separate `BoxShadow` primitive exists (`offset-x/offset-y/color/blur/spread`). |
| CSS `filter:` (blur/brightness) | **NO** general filter; brightness via color math, shadow via `BoxShadow`. |
| `@keyframes` (multi-step) | **NO** — use states + `animate`, `iteration-count`, or Timer/`animation-tick()` sequences. |
| `will-change` | **NO** — use `cache-rendering-hint: true` for raster caching. |
| `prefers-reduced-motion` | No CSS media query; read the OS setting into a global `bool` and gate `animate` (`enabled` / `duration`). |
| `PopupWindow` | YES — `.show()` / `.close()`, `close-on-click`; **no built-in open/close animation** (drive via states). |

## Technique-by-technique map

| # | CSS/JS technique in the prototype (where) | Slint 1.17.1 equivalent | Feasible? | Fallback / notes |
|---|---|---|---|---|
| 1 | `transition: <prop> <dur> <ease>` on color/background/border/opacity (everywhere, e.g. `usage-shared.css:76,174`, `base.css:97`) | `animate <prop> { duration: <dur>; easing: cubic-bezier(...); }` directly on the property, or a `states` `in/out` block keyed off `TouchArea.has-hover` / a bool | YES | Direct 1:1. Slint animates `background`/`border-color`/`opacity` natively. |
| 2 | `width` transition for meter fills (`.us-fill { transition: width .8s }`, `usage-shared.css:147`) and side-panel (`base.css:213,257`) | `animate width { duration: 800ms; easing: pm-ease-smooth; }` | YES | Animate `width` (or `preferred-width`). For a proportional fill, animate a `<float>` progress and bind `width: progress * track-width`. |
| 3 | `grid-template-rows` accordion transition (`base.css:656`) | `animate height` / `animate preferred-height` of the collapsible container | YES | Slint has no animatable grid-template; animate the container's `height`/`preferred-height` (combine with `clip: true`). |
| 4 | Entrance `@keyframes uwIn { opacity 0→1; translateY(8px)→0 }` (`usage-widgets.css:11`), `railPanelIn` (`base.css:264`) | No keyframes. Set the element's *target* state and `animate opacity, translate { duration: 220ms; easing: pm-ease-out; }` on appear; flip an `entered` bool once after mount | YES | For a one-shot entrance, initialize properties at the "from" value, then in a `Timer`(0ms)/`init` callback switch to the target so `animate` runs once. Do NOT re-run on reflow (see #9). |
| 5 | Infinite/loop `@keyframes`: `usSpin` (rotate, `usage-shared.css:81`), `usPulse`/`dotPulse`/`liveRail` (opacity/box-shadow pulse, `:131`, `base.css:331,694`), `pmShimmer` (translateX sweep, `base.css:706`) | `animate rotation-angle { duration: 1s; iteration-count: -1; easing: linear; }` for spinners; `animate opacity { duration: 1.8s; iteration-count: -1; direction: alternate; }` for pulses; `animate translate { …; direction: alternate; iteration-count: -1; }` for shimmer | YES | `iteration-count: -1` = infinite (confirmed). Use `direction: alternate` for back-and-forth. For complex multi-stop loops use `animation-tick()` to compute the value from the clock. **Reduced:** stop loops (set `enabled: false`) and show a static indicator. |
| 6 | New-row flash `@keyframes usFlash { background accent-soft → transparent }` (`usage-shared.css:180`) | Animate the row `background` (or an overlay Rectangle `opacity`) from highlight→transparent once, ~1000–1200ms pm-ease-out | YES | One-shot color/opacity animation (lower-risk channel per W3C). |
| 7 | `transform: translate3d/scale3d` + dynamic `transform-origin` for the sprout menu (`base.css:158-181`, `usage-shared.css:249-253`) | `translate` + `scale` + `scale-origin-x/y` on the popup root, animated | YES | Slint transforms are 2D (translate/scale/rotate) — sufficient for the sprout. Set `scale-origin-*` to the anchor corner (computed in Rust). |
| 8 | `transform: scale(.96/.97)` active-press (`base.css:350,598`) | `animate scale { duration: 120ms; }` keyed off `TouchArea.pressed` | YES | Direct. |
| 9 | **JS FLIP** for widget add/remove/resize/reorder: `capture()` `getBoundingClientRect` → invert with `transform: translate()` (no transition) → `requestAnimationFrame` → `transition: transform 220ms` → clear (`usage-widgets.js:57-66`, used by add/remove/setSize/endDrag) | **No DOM / no getBoundingClientRect / no layout-position readback.** Two deterministic options: **(a) Absolute-placement FLIP** — lay widgets out with explicit `x/y/width/height` computed in Rust (a grid model in Rust), capture before/after rects in Rust, and `animate x, y, width, height` between them (true FLIP parity). **(b) Layout-driven** — keep `GridLayout`, and on change animate each child via a per-item state; Slint will animate the geometry change if the property is `animate`d. | PARTIAL → feasible with (a) | This is **feasibility risk #2**. `GridLayout` does not publish child positions to `.slint`, so option (a) (Rust-owned grid geometry + animate x/y/w/h) is the clean, deterministic path and also gives you collision/order control. Critical: reflow must translate existing items only — it must NOT re-run the entrance `uwIn` (no page flash, no entrance replay). |
| 10 | **JS velocity spring** for tab ink (`springTo`, stiffness 500 / damping 35, semi-implicit Euler) and pointer-follow **magnet** hover (`usage-tabs.js:48-72, 115-155`) | **No native spring easing.** Options: **(a)** cubic-bezier overshoot/settle approximation (`pm-ease-spring` / `pm-ease-out`) driving `animate x, width`; **(b)** a real spring integrated in Rust via a `slint::Timer` (or `animation-tick()`) feeding the ink's `x`/`width` properties each tick — preserves velocity-aware retargeting. | PARTIAL → feasible | **Feasibility risk #3.** The ink slide is fine as a 250ms `pm-ease-out` `animate x, width`. The *magnet* (pointer-following translate) needs `PointerEvent` position tracking in Rust feeding a small `translate`; it is optional and dropped under reduced motion. |
| 11 | `backdrop-filter: blur(34px) saturate(160%)` shell glass + `blur(14px)` (`base.css:63-64,83,490`) | **NO equivalent.** Fallbacks: (1) sanctioned **shell-only** glass via a pre-rendered / pre-blurred background image or a semi-transparent tinted `Rectangle` (matches the project's F3-427 "glass blur is shell-only"); (2) approximate "frosted" with a translucent `Rectangle` + a subtle `@linear-gradient` + hairline border; (3) `cache-rendering-hint` if compositing a static blurred layer. | **NO** | **Feasibility risk #1.** No live backdrop blur in Slint. The prototype README already constrains this ("no backdrop-filter/blur inside cards … shell-only"). Do not put blur inside cards/popups; reserve the frosted look for the shell and fake it statically. |
| 12 | `box-shadow` / multi-shadow (`--elev-1/2/3`, hover shadows; `usage-widgets.css:10,13`) | A separate `BoxShadow` element (`offset-x`, `offset-y`, `color`, `blur`, `spread`) placed with/behind the surface; animate its `blur`/`offset-y`/`color` for hover elevation. | PARTIAL | No CSS-style multi-shadow stack. Keep to **one** `BoxShadow` per elevated surface (matches README "≤1 drop-shadow per element"). Pre-bake deep shadows (`--elev-3`) as 9-slice image assets if a richer look is needed. |
| 13 | `filter: brightness(1.05)` hover (`usage-widgets.css:8`), `filter: drop-shadow(...)` glow ring (`usage-context.css:3`) | brightness → lighten the `background` brush via color mixing (precomputable, F3-431); glow → a single `BoxShadow` (blur, low-alpha accent color) or an accent border. | PARTIAL | No `filter`. Prefer color/opacity changes (cheap, W3C lower-risk). |
| 14 | `color-mix(in srgb, …)` tints (pervasive) | Slint color mixing via `Colors.mix()` / rgba arithmetic; precompute per-theme token values (F3-431). | YES | Not motion per se, but used by hover/state tints that animate. |
| 15 | JS number tween for counters (`animateCounters`, `usage-data.js:414-421`, ease-out-cubic ~1000ms) | **Cannot tween text.** Tween a `<float>` property with `animate` (≤800ms pm-ease-smooth) and format it in a `Text { text: format(...) }` binding; OR step the value with a `slint::Timer`; `animation-tick()` is available for clock-driven values. | PARTIAL → feasible | The animation target must be a numeric property, not the string. |
| 16 | `will-change: transform/opacity/translate` (perf hint, `usage-tabs.css:3,8`, `base.css:163,637`) | **No equivalent.** Use `cache-rendering-hint: true` on complex/static subtrees that animate as a unit. | N/A | Drop `will-change`; Slint's renderer manages layering. |
| 17 | Reduced motion: `@media (prefers-reduced-motion: reduce)` global kill (`usage-shared.css:285`) + `html[data-reduced-motion="1"]` + selective per-element rules that **preserve final state** (`.us-fill { width: var(--wf) !important }`, tab ink `snap()`, sprout `transform:none`) (`usage-shared.css:205-212,256`, `usage-tabs.js:3-6,51`) | No media query. Read the OS reduce-motion setting into a global `property <bool> reduced` (Rust reads the platform setting; also expose an in-app toggle as the prototype does). Then per animation: `animate <prop> { enabled: !reduced; … }` (enabled:false → instant jump, confirmed) or `duration: reduced ? 0ms : <token>`. Keep the **selective** behavior: drop transform/scale/position, keep color/opacity and final values so state is never hidden. | YES | The `enabled: false → instant` semantics (Slint docs) is exactly the hook. The prototype's state-preserving reductions (meter jumps to final width, ink snaps, display still toggles) map directly and must be kept (W3C 2.3.3 + MDN). |
| 18 | Directional tab crossfade `pmTabIn 300ms` / `pmTabOut 150ms` with `--pm-dir` (`usage-tabs.css:14-17`, `usage-tabs.js:73-89`) | Two panels: animate outgoing `opacity`→0 (120ms) and incoming `opacity`→1 (200ms), optionally with a ±12px `translate` keyed to a `direction` int property. | YES | Slint has no shared "crossfade" primitive; do it with two opacity animations. |
| 19 | Popup placement/collision + corner origin (`place()`, `usage-widgets.js:25-36`) | Compute popup `x/y` (above if no room below) and `scale-origin-*` (anchor corner) in Rust; the `PopupWindow` itself just renders at that geometry. | YES | Slint `PopupWindow` gives `close-on-click` + `show()/close()`; geometry/origin is yours to compute (mirrors `place()`). |

## Top 3 Slint feasibility risks (ranked)

1. **`backdrop-filter` / live blur (glass).** No equivalent in Slint core (no `backdrop` symbol). The
   prototype's shell glass (`blur(34px) saturate(160%)`, `blur(14px)`) cannot be reproduced live.
   *Mitigation:* confine the frosted look to the shell as a static/pre-blurred layer or translucent
   tint (`Rectangle` + gradient + hairline), per the project's F3-427 "shell-only glass"; never blur
   inside cards/popups. *(Sources: Slint `internal/core/items.rs`/`graphics.rs`; project README.)*

2. **JS FLIP for grid reorder/resize.** No DOM rect readback and `GridLayout` does not expose child
   geometry, so the prototype's `capture(getBoundingClientRect)→invert→play` cannot be copied
   verbatim. *Mitigation:* own the grid geometry in Rust (absolute `x/y/width/height` per widget),
   compute before/after rects in Rust, and `animate x, y, width, height` — deterministic FLIP parity
   that also guarantees no page-flash and **no entrance-animation replay** during reflow.
   *(Sources: Slint animation/states docs; `usage-widgets.js`; Simons & Levin on continuity.)*

3. **Springs (and keyframe loops).** Slint easing has **no spring** variant (EasingCurve = Linear,
   CubicBezier, Elastic/Bounce only); there are also **no `@keyframes`**. *Mitigation:* approximate
   settles with `cubic-bezier` overshoot (`pm-ease-spring`) for the common case; drive genuinely
   velocity-aware springs (tab ink/magnet) from Rust via `Timer`/`animation-tick()`; build loops with
   `iteration-count: -1` + `direction: alternate` or `animation-tick()`. *(Sources: Slint
   `internal/core/animations.rs` EasingCurve enum; Motion/react-spring spring models.)*

### Secondary risks (manageable)
- **Shadows:** no CSS `box-shadow` stack; use a single `BoxShadow` primitive per surface or pre-baked
  9-slice assets.
- **Counters:** text can't tween — animate a numeric property and format, or step with a Timer.
- **Filters:** no `filter:`; do brightness/glow via color mixing and a single `BoxShadow`.

## Recommended Slint implementation pattern (ties it together)

```slint
// Global motion gate read from the OS reduce-motion setting (+ in-app toggle).
global Motion {
    in-out property <bool> reduced: false;          // set from Rust platform setting
    out property <duration> popup-open:  reduced ? 120ms : 220ms;
    out property <duration> reflow:      reduced ? 0ms   : 240ms;
    // ... one duration per semantic token (motion-token-map.json)
}

component Widget inherits Rectangle {
    in-out property <length> tx;  in-out property <length> ty;   // Rust-owned grid position (FLIP)
    x: tx; y: ty;
    animate x, y, width, height {                  // widget-reflow / -drop / free-resize settle
        duration: Motion.reflow;
        easing: cubic-bezier(0.45, 0, 0.4, 1);
        enabled: !Motion.reduced || /* keep essential */ true;
    }
    animate opacity, scale {                        // widget-pickup / hover
        duration: 120ms; easing: cubic-bezier(0.22, 1, 0.36, 1);
    }
}
```

This realizes the token map deterministically: state-driven `animate` blocks (so in-flight retargets
are clean — P7), Rust-owned geometry for FLIP (risk #2), `cubic-bezier` easing throughout (all
Slint-feasible), and a single `Motion.reduced` gate implementing the state-preserving reduced-motion
contract (P10).

## Correction — row 11 / risk #1 (glass): RESOLVED by design (2026-07-30)

Row 11 and risk #1 described the glass shell as `backdrop-filter: blur(34px) saturate(160%)` +
`.glass-bg` orbs with `filter: blur(60px)` (`base.css:63-64,50`). **Both are gone from the glass
path.** The glass alignment to PMConcept7 (`glass-slint-mapping.md`, `pmconcept7-reference.md` §1)
removed every runtime blur the portability audit flagged:

- `.glass-bg` is now a static gradient sky (`--pm6-glass-sky`) + flat radial puffs drifting on the
  **transform-only** `pm-float` keyframe (maps to `animate x, y { iteration-count: -1; direction:
  alternate; }` — already covered by rows 1/5; no new mechanism).
- `[data-theme^="glass"] .app-shell` is a self-sufficient gradient slab (PMConcept7 pane k1/k2/k3,
  no backdrop-filter), so the frosted-pane look no longer depends on sampling content behind it.
- The only browser blur left in `_shared` is friendly-theme chrome `blur(14px)` on
  `.title-bar`/`.status-bar` (base.css, friendly overrides) — outside the glass/portable path and
  still subject to row 11's fallback if a friendly concept is ever ported.

Row 11's fallback table remains valid for any future blur use; risk #1 is downgraded from
"feasibility risk" to "resolved by the token system" — the full per-token Slint mapping (pane,
steps, plate, sheen, wallpaper, shadows) lives in `glass-slint-mapping.md` §3.
