# Opusicon (`Concepts/Opusicon/`)

Theme-matched variants of the Puppet Master logo (`Pm placeholder 3.svg`) for all **8 PMConcept7
themes**, in **4 icon forms**, with **8 loading animations** that work in any theme — plus a
self-contained download dashboard, a native Slint component, and a cross-platform icon packer.

Nothing outside this folder was touched. `PMConcept7.html` is a generated artifact
(`Concepts/pm7-tools/build_pm7.py`) and was not edited.

## Open this

```bash
open Concepts/Opusicon/index.html
```

It works by **double-clicking** — no server. Every asset is generated in-page, so there is no
`fetch()` anywhere (Chrome blocks `fetch()` of sibling files under `file://`, which silently breaks
download buttons that rely on it).

## What's here

```
Opusicon/
├── index.html          the dashboard — preview, compare, download
├── pm-core.js          THE generator: geometry, themes, motions, buildSVG()
├── pm-export.js        data-URI encoding, PNG rasterising, ZIP writer
├── static/             8 themes x 2 polarities x 3 tiers, + marks + lockups
├── animated/           8 motions x 8 themes (web)
├── mono/               alpha-mask masters (Slint colorize / tray)
├── parts/              decomposed rig parts
├── slint/pm-logo.slint native components — PmRig, PmLoader, PmTheme
└── tools/
    ├── emit.mjs        writes every SVG to disk
    └── make-icons.py   packs PNGs into .ico / .icns / hicolor / web
```

`pm-core.js` is loaded by **both** `index.html` and `tools/emit.mjs` (via `node:vm`), so the live
preview and the files on disk come from one function and cannot drift apart.

---

## The two findings that shaped this

### 1. Slint cannot animate SVG — at all

Slint renders SVG through **resvg**, which implements only the static SVG 1.1 subset: *"No
animations. There are no plans on implementing them either."* That covers SMIL **and** CSS
`@keyframes`. resvg also doesn't implement `transform-box`, which CSS-animated SVGs need for correct
transform origins.

So a CSS-animated loader in Slint renders as a **frozen first frame** — and because the frozen frame
is still a perfectly valid logo, the failure is *silent*. The loader just never moves.

That's why this ships two tracks:

| | web / dashboard | the Slint app |
|---|---|---|
| static mark | `static/*.svg` | `Path` in `slint/pm-logo.slint`, or `mono/*.svg` + `colorize` |
| loading | `animated/*.svg` (CSS keyframes) | `PmLoader` driven by `animation-tick()` |

**`Image.colorize` is the economy here.** It uses the image as an alpha mask and paints it in any
colour, so **one** monochrome master covers all 8 themes on the Slint side. The per-theme files exist
for the web and for raster export.

### 2. The source artwork doesn't survive at two of its three intended sizes

Measured feature widths against render size (source canvas is 43.2 units):

| feature | units | at 16px (tray) | at 24px (title bar) | survives at ≥ |
|---|---|---|---|---|
| string stem | 0.97 | **0.36px** | **0.54px** | 44.5px |
| bracket stem | ~1.15 | **0.43px** | **0.64px** | 37.6px |
| PM counter channel | 1.00 | **0.37px** | **0.56px** | 43.2px |
| control bar | 3.156 | 1.17px | 1.75px | 13.7px |

Everything except the bar is **sub-pixel** at title-bar and tray sizes. A recolour alone ships an
illegible smudge in exactly the two places the logo was first asked to go.

Weight alone doesn't fix it either — thickening the authored geometry at 16px still reads as *crossed
blades*, because the cross spans 69% of the canvas while the strings are stubs. What fixes it is
**proportion**: narrow the cross, lengthen the strings, so the silhouette becomes "a bar with things
hanging from it".

Hence three **optical tiers**, not one geometry scaled:

| tier | used at | geometry |
|---|---|---|
| `micro` | ≤ 24px — tray, small chrome | redraw: cross at 72% span, heavy strokes, symmetric |
| `small` | 25–63px — title bar, toolbars | redraw: cross at 86% span |
| `full` | ≥ 64px — app icon, splash | authored artwork, untouched, with PM and brackets |

The dashboard's **size ruler** builds each sample at its own tier so you can see the handoff.

---

## Geometry

Recovered by flattening the authored cubics, not by reading the path's outer extremes:

- Both bars: `|slope| 0.4432` (**23.9044°**), centre lines `(7.785, 7.600) → (36.190, 20.190)` and its
  mirror, length 31.07, round caps of radius 1.578 → perpendicular width **3.156**.
  *Check: left cap centre 7.785 − 1.578 = 6.207, and the measured bbox min-x is 6.210. Using the outer
  extremes predicts 5.82 and is wrong.*
- **Pivot (the crossing) = `(21.99, 13.895)`** = fraction `(0.50902, 0.32164)`. This is the
  `transform-origin` for every rotation, on both tracks.
- `str-l` hangs from the **counter** bar (dx −7.08 from the pivot); `str-r` hangs from the **main**
  bar (dx +7.35). A rigid ±7° tilt therefore raises one attach point by 0.863 units and lowers the
  other by 0.895 — **genuine opposition**, measured from the artwork. That is what the hero motion is
  built on, and why the strings look mechanically connected rather than decorative.

## Colour

Two polarities per theme, both downloadable:

- **Theme ground** — tile = `--surface`, mark = `--accent-primary`. Quiet; reads as part of the app.
- **Accent flood** — tile = `--accent-primary`, mark knocked out. Loud; strong in a Dock.

The mark colour is **chosen**, not hardcoded. Taking it mechanically from `--background` fails the
WCAG 1.4.11 non-text floor (3:1) on `glass-light` (2.66:1) and `friendly-light` (2.90:1). The
generator prefers the theme's own background, and if that can't clear 4.5:1 it deepens the tile
toward the theme's ink until a light knockout does — keeping the hue instead of reaching for black.
Only those two pastel light themes get an adjusted tile (`#437997`, `#8166C6`); everything else uses
its own tokens. Every card shows its measured ratio, and `tools/emit.mjs` fails if any pair regresses.

Opacity is **not** used as a motion channel below 0.78: `friendly-light` sits at 3.09:1 at *full*
opacity, so dimming it at all breaks the floor.

## The 8 motions

Decoupled from theme — any motion works in any theme, so all 64 combinations are previewable and
downloadable. All animate the **parts** of the rig, never the whole tile, and **all eight are portable
to Slint** (nothing depends on `stroke-dashoffset`, which Slint has no equivalent for).

Every motion **rests at its fullest frame at phase 0**. That is deliberate: a static rasteriser samples
t=0, so a cycle that starts empty would make the frozen frame in Slint a logo with pieces missing. Two
early designs had exactly that bug and were rewritten.

| motion | concept | Slint |
|---|---|---|
| Marionette Rig | cross tilts; each string rises/falls with the bar it hangs from | yes |
| String Pluck | bars still; strings pluck in sequence and settle | yes |
| Control-Bar Rock | slow rock with the strings trailing a beat behind | yes |
| Take-Up | one string reels in while the other pays out, tilting the puppet | yes |
| Pulse Weave | light travels along each bar through the crossing | yes |
| Suspend Drop | PM is lowered on its strings and settles | yes |
| Crossbar Scissor | the two bars scissor against each other; both letters bob together | yes |
| Cut Strings | strings pay out and reel back — **can show real progress** | yes |

Oscillations use `cubic-bezier(.37,0,.63,1)`, which is exact sine-in-out. `ease-in-out` leaves a
velocity mismatch at the loop wrap that reads as a faint stutter once per cycle.

Reduced motion (`prefers-reduced-motion` and PMConcept7's `[data-motion="reduced"]`) collapses each
to a still frame with one slow opacity breath, so the surface still reads as working.

## Slint

`slint/pm-logo.slint` draws the mark with `Path` — vector all the way down, no rasterisation, no
image cache, no DPI rounding. Verified against tag **v1.17.1**:

- `transform-rotation` / `transform-origin` are injected into *every* element, so a `Rectangle` of
  `Path`s rotates as one rigid body.
- **`rotation-origin-x` / `rotation-origin-y` are deprecated** — there's a compiler pass that warns
  and rewrites them. `transform-origin` takes a **Point struct**, and mixing the forms is an error.
- `animate` interpolates on property *change*; `animation-tick()` is the idiom for an always-on loop
  (it's what Slint's own `Spinner` and the weather demo's `BusyLayer` use).
- `animate` accepts only int/float/length/colour/brush/angle — **not** strings, bools or structs. So
  `Path.commands` and `transform-origin` can never be animated; string lengths are bound as floats on
  `LineTo` children instead.
- There is **no** `stroke-dash-array`/`stroke-dash-offset` in Slint, and no GIF/APNG/Lottie support.

### Two tray traps

1. `SystemTrayIcon` rasterises via `Image::to_rgba8()`, which renders at the SVG's **intrinsic**
   size. An SVG with only a `viewBox` becomes a 43×43 bitmap that AppKit then squeezes into an 18pt
   box. Every SVG here carries explicit `width`/`height`.
2. **Slint never calls `setTemplate:` on macOS.** The usual black+alpha "Template" convention does
   *not* work — a black glyph stays black on a dark menu bar. Ship both tints and swap on
   `Palette.color-scheme`. `Plans/FinalGUISpec.md:574` also requires the tray icon to turn accent
   while the orchestrator runs, which is a third, non-template asset.

## Building OS icons

The dashboard exports PNGs, then:

```bash
python3 tools/make-icons.py --png-dir <unzipped>/png --out build
```

Standard library only — no Pillow, ImageMagick or cairosvg (none are on a stock Mac). It writes a
Windows `.ico` (16–256, with 256 correctly encoded as the `w=0/h=0` sentinel), a macOS `.iconset`
plus `.icns` via the system `iconutil`, the Linux hicolor tree with a `.desktop` file, and the web
favicon/PWA set.

On macOS you can also rasterise from the CLI without the dashboard — `sips` reads SVG and honours the
declared size **because these files carry explicit `width`/`height`**:

```bash
sips -s format png static/pm-friendly-dark-ground-full.svg --out icon.png
```

## Known limits

- **The lockup wordmark is live `<text>`.** It renders in browsers, but resvg needs font resolution
  and the PMConcept7 display faces (Cal Sans, Quicksand, Orbitron, Rajdhani) won't be installed
  everywhere. Convert it to outlines before using it anywhere resvg renders, or use the PNG export.
  The dashboard badges this.
- **Maskable PWA icons need a further inset.** The mark's half-diagonal exceeds the 40%-radius safe
  circle, so a maskable variant should scale the foreground to ~76% of the canvas. Not generated yet.
- **macOS 26 (Tahoe)** prefers an Icon Composer `.icon` bundle; a full-bleed `.icns` gets a grey
  plate behind it. Ship both, same root name.
- The 22px Linux tray size isn't in the default export list; add it if you target GNOME/KDE trays.
- `index.html` cache-busts its two scripts (`?v=3`). If you edit `pm-core.js`, bump that number or the
  browser will keep serving the old generator — this bit me twice during development.

## Verified

- CRC-32 against its canonical vectors (`crc32("123456789") == 0xCBF43926`), and the ZIP round-trips
  through macOS `unzip -t`.
- 35 previews render with **0 broken images**; the 8 loaders report as live animations bound to the
  right elements.
- Rasterising one loader at phase 0 / 0.25 / 0.5 gives 1866 / 2521 / 1884 differing pixels out of
  16384 — the motion is real, and phase-sampling works for exporting a chosen frame.
- All 8 motions inspected as phase filmstrips and re-measured programmatically: each binds to the
  intended elements, and none collapses below 56% of its phase-0 extent.
- `.ico` and `.icns` re-parsed and confirmed; `.icns` is recognised by `file(1)`.
