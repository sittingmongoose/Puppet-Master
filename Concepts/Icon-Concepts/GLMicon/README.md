# Puppet Master — Icon Lab (GLMicon)

The complete icon system for Puppet Master, portability-tested for **Rust + Slint 1.17.1** across
**macOS, Windows, Linux, and web**. Theme-matched static marks, browser-animated loaders, three
tray glyph variants, and ready-to-ship app-icon bundles.

Nothing outside this folder was touched. `PMConcept7.html` was read only to extract theme tokens.

## TL;DR — what to use where

| Use case | Take from | Notes |
|---|---|---|
| App header logo (any theme) | `static/pm-<theme>.svg` | Drop into Slint `@image-url(...)`. Renders identically on all targets. |
| Loading state in **Slint** | `static/pm-<theme>.svg` + animate the `Image` element | Slint can't play SVG-internal animation (see below). |
| Loading state in **browser/web** | `animated/pm-<theme>-loading.svg` | Self-contained; animates via CSS keyframes. |
| macOS app icon | `build/<theme>/app-icon/mac/PM-<theme>.icns` | 10 variants incl. @2x. |
| Windows app icon | `build/<theme>/app-icon/windows/PM-<theme>.ico` | 7 sizes, 256 PNG-compressed. |
| Linux app icon | `build/<theme>/app-icon/linux/hicolor/` | 8 PNG sizes + `scalable/` SVG. |
| Web/PWA icons | `build/<theme>/app-icon/web/` | 192/512 any+maskable, favicon, apple-touch, manifest. |
| macOS tray | `build/<theme>/tray/<glyph>/mac/tray-template-*.png` | Black+alpha template; set `isTemplate = true`. |
| Windows/Linux tray | `build/<theme>/tray/<glyph>/{windows,linux}/tray-color-*.png` | Accent color fill. |

## CRITICAL portability note (read before wiring up Slint)

**Slint cannot play animations embedded inside an SVG.** Slint rasterizes SVGs through `resvg`,
which renders exactly one static frame and caches it — by design ("no animations, no plans to
implement them"). This is true on **desktop AND the wasm/web target** (Slint-WASM rasterizes the
SVG inside the binary; it never hands the SVG to the browser's SVG renderer).

Consequences:
- The **8 static SVGs** are the portable truth. Use them directly.
- The **8 animated SVGs** play in browsers (and in this dashboard). Their frozen `t=0` frame is
  authored to be a *complete logo*, so if you point Slint at one it degrades gracefully to a clean
  static mark — but it will not move.
- For real loading motion in Slint, **animate the `Image` element**, not the SVG:
  ```slint
  Image {
      source: @image-url("pm-" + active-theme + ".svg");   // any of the 8 static marks
      animate transform-rotation { duration: 1200ms; iteration-count: -1; easing: linear; }
  }
  ```
  This makes the motion swappable across themes by variable — the look lives in the SVG, the
  motion lives in the component. (Needs FemtoVG/Skia renderer, the defaults on desktop + web; the
  software renderer can't rotate images.)

## What's here

```
GLMicon/
├── index.html              ← open this. The full gallery + tray comparison + bundle index.
├── README.md               ← this file
├── build_icons.py          ← regenerate ALL bundles from the source SVGs (re-run any time)
│
├── static/                 ← 8 static theme variants (the portable source of truth)
│   └── pm-<theme>.svg
├── animated/               ← 8 browser-animated loaders (one distinct motion per theme)
│   └── pm-<theme>-loading.svg
│
├── tray/source/            ← 3 tray glyph source SVGs
│   ├── glyph-pm-monogram.svg        Bold PM, no strings — most legible at 16px
│   ├── glyph-puppet-string.svg      Marionette head + control bar + string — on-brand
│   └── glyph-simplified-mark.svg    Bold PM + thickened strings — faithful compromise
│
└── build/                  ← GENERATED. 288 files. Do not hand-edit; rerun build_icons.py.
    └── <theme>/
        ├── app-icon/
        │   ├── mac/PM-<theme>.icns
        │   ├── windows/PM-<theme>.ico
        │   ├── linux/hicolor/{16..512}x../apps/pm-<theme>.png + scalable/pm-<theme>.svg
        │   └── web/  (icon-192/512, maskable, favicon.ico, apple-touch-icon, manifest)
        └── tray/<glyph>/{mac,windows,linux}/...
```

## The 8 animated loaders (each a different motion)

| Theme | Motion | Theme | Motion |
|---|---|---|---|
| retro-dark | String Pluck | glass-dark | Control-Bar Tilt |
| retro-light | Draw-On Reveal | glass-light | Orbit Ring |
| basic-light | Breathing Scale | friendly-dark | Spring Bounce |
| basic-dark | Shimmer Sweep | friendly-light | Equalizer Strings |

All loop seamlessly. All leave a complete logo at `t=0` (so resvg/Slint shows a clean static frame).

## How the recolor works

The source mark has two colors. Per theme: the square → theme `--accent-primary`; the PM+strings
→ a high-contrast tone; corner radius → family-matched (retro=0, basic=4, glass/friendly=14).
All values verbatim from `PMConcept7.html`.

## Tray glyph guidance

The full PM+puppet-strings mark is **illegible at 16px** (the strings are sub-pixel), and macOS
tray icons **must** be monochrome template images (the OS reads the alpha channel only and
auto-tints for light/dark menubar). Three simplified glyphs are provided; compare them on the
dashboard's tray section:

- **PM Monogram** — most reliable at 16×16. Drops the puppet motif.
- **Simplified Mark** — best compromise; keeps PM + bold strings.
- **Puppet + String** — expressive, but loses detail at 16px; better at 22px+ (Linux).

There is **no single tray icon that works across all platforms** — macOS needs the monochrome
template, Windows/Linux want full color. The build generates both per glyph per theme.

## Regenerating bundles

Requirements: `resvg` (SVG→PNG, same engine Slint uses), `iconutil` (macOS, for .icns), `Pillow`
(PNG→ICO). Install:
```sh
brew install resvg
python3 -m pip install --user Pillow
# iconutil ships with macOS
```

Then:
```sh
python3 build_icons.py                  # all 8 themes
python3 build_icons.py --theme friendly-dark   # one theme
```

This rebuilds everything under `build/` from `static/` + `tray/source/`. Re-run whenever the source
art changes.

## Verification done

- Static SVGs: confirmed identical rendering under resvg vs. the originals (Slint will match).
- Animated SVGs: all 8 confirmed to render a complete logo at the static `t=0` frame (resvg).
- `.icns`: valid macOS icon, all 10 variants present (8 themes).
- `.ico`: 7 size entries each (16/24/32/48/64/128/256); favicon.ico has 16/32/48 (8 themes).
- Maskable icons: corners fully opaque (correct for adaptive-icon cropping).
- macOS tray templates: strictly black + alpha (no white leak from the puppet glyph's eyes/smile —
  they punch through as transparent holes, as the OS expects).
- `git status`: only `Concepts/GLMicon/` is new; `PMConcept7.html` unchanged.
