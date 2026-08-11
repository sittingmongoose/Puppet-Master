# Glass Effect — Final Web Implementation + Slint 1.17.1 Mapping

Status: **glass aligned to the PMConcept7 production reference and de-blurred for portability.**
Companions: `pmconcept7-reference.md` §1 (extraction of `Concepts/PMConcept7.html`),
`slint-1.17.1-verification.md` (items 1, 2, 4), `motion-to-slint-map.md` (correction note).

Scope note: only the **chosen concept** ports to Slint; U1/U2 stay web-only (user-confirmed), so the
shared `_shared/base.css` + `_shared/themes.css` glass alignment deliberately restyles U1–U9's browser
glass look to match production. Glass is visual-only — no layout/structure changes.

---

## 1. The one rule the whole system obeys

**One translucent slab, stepped-alpha plates, zero runtime blur.**

- The app shell is the ONE pane of glass (PMConcept7.html L860-892).
- Every surface *inside* the pane rides the slider-driven transparency steps
  (`--pm6-glass-step-1/2/3`) or the near-opaque reading plate (`--pm6-glass-plate`) —
  plain `rgba()` fills, never their own backdrop-filter (PMConcept7 L894-897).
- The wallpaper is pre-baked in spirit: static gradient sky + flat radial puffs with
  **transform-only** drift. No `filter: blur()`, no `backdrop-filter` anywhere on the glass path
  (PMConcept7 T16 removed runtime blur from production; the concepts now match).
- Deviation from PMConcept7, by design: the pane itself also carries **no** `backdrop-filter`
  (production keeps `blur(34px) saturate(160%)`). Slint 1.17.1 has no backdrop/blur primitive
  (`slint-1.17.1-verification.md` items 1–2), so the web prototype proves the glass reads as a
  coherent frosted pane from fills alone. Since the pane covers everything but the 5px sky ring,
  the removed blur was sampling an almost-fully-covered wallpaper — visually negligible.

## 2. Final web implementation (what changed)

### Tokens — `_shared/themes.css`

`[data-theme="glass-dark"]` (block ≈ L277-350): PMConcept7 L1623-1645 ported verbatim —
`--pm6-glass-pane-edge:.28`, `--pm6-glass-pane-k1/k2/k3:.73/.57/.67`,
`--pm6-glass-pane-shadow/.shadow2`, `--pm6-glass-pane-sheen/.sheen2`, `--pm6-glass-inset:5px`
(themes.css:335), `--pm6-glass-drop`, `--pm6-glass-floor`, `--pm6-glass-a-rgb/b-rgb/sat`,
`--pm6-glass-step-1/2/3 = rgba(255,255,255, α×.10/.16/.28)` (themes.css:336-338),
`--pm6-glass-plate = rgba(16,10,32, .35+α×.78)` (themes.css:339). Plus wallpaper tokens
`--pm6-glass-sky` (PMConcept7 minimal-mode gradient stack, L794-801) and
`--pm6-glass-puff-a/b/c` (pre-saturated depth-mode puff colors, L778-783) at themes.css:342-350.
Dark stays `tint 46,34,72 / α .60`.

`[data-theme="glass-light"]` (block ≈ L353-427): corrected to PMConcept7 — **tint
`248,244,255 → 246,240,255`, `--glass-alpha .80 → .55`** (themes.css:355-357) — then the
light *variant* tokens from PMConcept7 L1646-1668 ported verbatim: pane-edge `.75`,
k `.62/.36/.47`, shadows `rgba(93,63,133,.35/.22)`, sheen `.50/.25`, steps
`α×.25/.55/1.1` (themes.css:412-414), **bright** plate `rgba(255,255,255, .42+α×.87)`
(themes.css:415), light sky (L786-793) + light puffs (L772-777) at themes.css:418-426.

`[data-theme^="glass"] { --surface-alt: transparent }` retained (themes.css:555) so chrome bars
sit directly on the pane. All step/plate fills derive from `--glass-alpha`, so a transparency
slider (if added) moves the whole sheet, exactly like production.

### Rules — `_shared/base.css`

- **Wallpaper** (base.css:40-71): `.glass-bg` is now `contain:strict; overflow:hidden;
  pointer-events:none`; `::before` paints `var(--pm6-glass-sky)` (static 5-layer gradient stack);
  the three `<i class="gb-a/b/c">` orbs injected by `usage-chrome.js` (markup untouched) are now
  **flat radial-gradient ellipses** (`closest-side, color → transparent 75%` — soft falloff baked
  into the gradient, replacing `filter: blur(60px)`) drifting on `pm-float`, a **transform-only**
  72–100s `ease-in-out alternate` keyframe (`translate3d(var(--fx), var(--fy), 0)`), frozen by the
  global reduced-motion kill-switch.
- **The slab** (base.css:85-99): `[data-theme^="glass"] .app-shell` = `margin/height` for the 5px
  sky ring (`--pm6-glass-inset`), `border-radius:20px; overflow:hidden`, `1px` pane-edge border,
  `linear-gradient(165deg, tint×α×k1, …k2 40%, …k3)` fill, and the four-layer shadow stack
  (`0 40px 90px` + `0 6px 18px` drops, `inset 0 1.5px 0 var(--glass-edge)` highlight,
  `inset 0 0 0 1px rgba(255,255,255,.05)`). **No backdrop-filter.**
- **Sheen** (base.css:101-108): `.app-shell::after` = the 120deg sheen gradient
  (`--pm6-glass-pane-sheen → transparent 30% → 82% → sheen2`), `mix-blend-mode: screen`,
  `pointer-events:none`, `z-index:80` (below sprout menus at 220, above chrome).

### What now resolves for free (previously fallback-only)

`usage-shared.css:254` `.pm-sprout` popovers → real `--pm6-glass-plate` (near-opaque reading
plate, PMConcept7 L6650-6668 semantics); `usage-tabs.css:10` tab ink → real `--pm6-glass-step-3`;
`usage-context.css:66,94` More-Details tab/card → real step-3/step-1. No per-concept CSS and no
hardcoded per-card translucency: U3–U9 inherit the whole system from tokens.

## 3. Exact Slint 1.17.1 mapping

Ground truth: `slint-1.17.1-verification.md` — no backdrop-filter/element blur (items 1–2);
`@linear-gradient` / `@radial-gradient(circle [radius] [at x y])` available (item 4, **circle
only**); `drop-shadow-*` on all renderers, `inner-shadow-*`/`spread` Skia-only (item 3);
rotate/scale native, translate via `x`/`y` (item 12); animations with `iteration-count: -1`,
`direction: alternate` (item 6).

### 3a. Wallpaper (`.glass-bg`)

CSS stacks five gradients in one `background` — Slint allows **one brush per Rectangle**, so the
sky = five stacked full-bleed Rectangles in a `z` order matching the CSS list (first = topmost):

```slint
component Wallpaper inherits Rectangle {
    background: @linear-gradient(168deg, #3A2B58 0%, #2C2148 48%, #52325C 100%);  // bottom layer
    Rectangle { x:0; y:0; width: parent.width; height: parent.height;
        background: @radial-gradient(circle 38% at 15% 10%, #6E4FA3 0%, transparent 68%); }
    Rectangle { /* #46387E at 85% 8% */ }
    Rectangle { /* #B25E8E at 50% 102% */ }
    Rectangle { /* #D08256 at 98% 60% */ }
    Puff { /* gb-a */ }  Puff { /* gb-b */ }  Puff { /* gb-c */ }
}
```

- CSS `ellipse W% H% at x y` → Slint is circle-only: use
  `@radial-gradient(circle <radius> at <x> <y>, color 0%, transparent 75%)` and stretch the host
  Rectangle to W%×H% of the window (the circle fills the box, so the *element* provides the
  ellipse). The `transparent 75%` falloff **is** the pre-baked blur — no blur primitive needed.
- Puffs: one Rectangle each, `background: @radial-gradient(circle at 50% 50%, rgba(...) 0%, transparent 75%)`,
  `border-radius: width/2` optional. Drift = **animate x, y** (translate has no dedicated property):

```slint
component Puff inherits Rectangle {
    in property <length> drift-x;  in property <length> drift-y;
    in property <duration> dur;
    x: base-x;  y: base-y;
    animate x, y { duration: dur; iteration-count: -1; direction: alternate; easing: ease-in-out; }
    states [ drift when true: { x: base-x + drift-x; y: base-y + drift-y; } ]
}
// gb-a: dur 100s, drift (3%, 2%) · gb-b: 84s, (-4%, -2%) · gb-c: 72s, (5%, -2%)
```

- `contain: strict` / `pointer-events: none` → clip with a `clip: true` container; puffs are
  decorative, no `TouchArea` attached.

### 3b. The pane (`.app-shell`)

```slint
component GlassShell inherits Rectangle {
    in property <float> glass-alpha: 0.60;             // transparency slider (global)
    border-radius: 20px;
    border-width: 1px;
    border-color: rgba(255,255,255, 0.28);              // --pm6-glass-pane-edge
    clip: true;                                          // overflow: hidden
    background: @linear-gradient(165deg,
        rgba(46, 34, 72, glass-alpha * 0.73) 0%,        // k1
        rgba(46, 34, 72, glass-alpha * 0.57) 40%,       // k2
        rgba(46, 34, 72, glass-alpha * 0.67) 100%);     // k3
    drop-shadow-offset-y: 40px;  drop-shadow-blur: 90px;
    drop-shadow-color: rgba(10, 5, 25, 0.60);           // pane-shadow (primary)
    // pane-shadow2 (0 6px 18px) — second shadow unsupported: fold into the
    // primary color or pre-bake as a 9-slice underlay image.
    // inset top highlight (inset 0 1.5px 0 glass-edge):
    Rectangle { x: 0; y: 0; width: parent.width; height: 1.5px;
        background: rgba(255, 255, 255, 0.40); }         // --glass-edge
    // sheen overlay — plain gradient, NO blend mode (screen ≈ identity at these alphas):
    Rectangle { x: 0; y: 0; width: parent.width; height: parent.height;
        background: @linear-gradient(120deg,
            rgba(255,255,255,0.16) 0%, transparent 30%,
            transparent 82%, rgba(255,255,255,0.08) 100%); }
}
```

- Sky ring: window content = Wallpaper; place GlassShell at `x: 5px; y: 5px;
  width: parent.width - 10px; height: parent.height - 10px` (`--pm6-glass-inset`).
- Light variant swaps the token values (α .55, k .62/.36/.47, edge .75, shadows
  `rgba(93,63,133,*)`) — bind from a theme `global`, same structure.

### 3c. Interior steps + plates

Direct 1:1 — each is a Rectangle fill bound to the global alpha (precompute per-theme multipliers):

| Web token | Web value (α = --glass-alpha) | Slint fill |
|---|---|---|
| `--pm6-glass-step-1` | dark `255,255,255 @ α×.10` · light `α×.25` | `rgba(255,255,255, alpha * 0.10)` |
| `--pm6-glass-step-2` | dark `α×.16` · light `α×.55` | `rgba(255,255,255, alpha * 0.16)` |
| `--pm6-glass-step-3` | dark `α×.28` · light `α×1.1` (clamp ≤1) | `rgba(255,255,255, min(alpha * 0.28, 1.0))` |
| `--pm6-glass-plate` | dark `16,10,32 @ .35+α×.78` · light `255,255,255 @ .42+α×.87` | `rgba(16,10,32, 0.35 + alpha * 0.78)` |
| hairlines / edges | `--glass-hairline`, `--glass-edge` | `border-width: 1px` + `border-color`, or 1px separator Rectangles |
| `--pm6-glass-drop` (popovers) | `0 12px 30px rgba(10,5,25,.45)` | single `drop-shadow-*` (≤1 per element) |

### 3d. Reduced motion

Mirror the OS setting into a `global Glass { in-out property <bool> reduced; }` (no built-in,
verification item 14) and set puff animations `enabled: !reduced` — the puffs simply stop
drifting; the glass itself is static, so nothing else needs gating.

## 4. Legibility trade-offs (flagged)

- **glass-light α .80 → .55**: the pane and `--surface`/`--surface-elevated` fills become more
  translucent (`.55`/`.71`), letting the pastel sky show through — exactly the production look
  (PMConcept7 ships .55 with the same `#382E4E` ink). Verified legible in-browser on U5/U8
  (this session); body text on step-1 surfaces is the thinnest margin if a concept later places
  long prose on `--pm6-glass-step-1` — prefer `--pm6-glass-plate` for reading surfaces.
- `mix-blend-mode: screen` sheen has no Slint equivalent; at white .16/.08 (dark) the
  blend-vs-plain delta is sub-perceptual, so Slint drops it (noted in base.css:108).
- Second outer pane shadow (`0 6px 18px`) can't stack in Slint — folded into the primary
  drop-shadow color (minor depth loss on the slab's lower edge).
