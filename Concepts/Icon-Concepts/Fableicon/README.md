# Fableicon — PM icon theme pack

Theme-matched variants and loading animations of the PuppetMaster logo, one per
PMConcept7 theme, plus a dashboard for previewing and downloading everything.

> This folder is illustrative concept work (same status as `Concepts/PMConcept7.html`);
> the canonical product spec stays in `Plans/**`. Nothing outside `Concepts/Fableicon/`
> is read or written by this pipeline except the vendored source logo copy.

## View

Open `index.html` by double-clicking it — it is fully self-contained (no server, no
CDN, no web fonts, works over `file://`). Chrome is recommended for the multi-file
download buttons (it asks once to allow multiple downloads).

## What's here

```
index.html      dashboard: 8 static cards, 8 animated cards, Mix Lab (any motion x
                any palette), platform exports (.ico/.icns/PNG sets/tray/Slint)
generate.py     stdlib-only generator; sole author of everything below
manifest.json   generated metadata (deterministic, no timestamps)
source/         pm-logo-source.svg - pristine vendored copy of the logo
icons/static/   pm-<theme>.svg            8 theme recolors (literal hex fills)
icons/animated/ pm-<theme>-loading.svg    8 standalone-animating loading SVGs
icons/template/ pm-tray-Template.svg      black marks on transparent (macOS template)
                pm-tray-white.svg         white twin for dark taskbars
slint/          pm_loading_<motion>.slint 7 native Slint loading components
slint/layers/   pm-layer-*.svg            white layer SVGs the components colorize
```

## Regenerate / verify

```
python3 generate.py          # rebuild all 32 generated files + index.html data region
python3 generate.py --check  # drift gate: exit 1 if any generated artifact was hand-edited
```

`index.html` is hand-authored EXCEPT the block between the `FABLEICON:DATA` markers,
which the generator owns. To change colors or motions, edit the `PALETTES` /
`ANIMS` / `anim_css` tables in `generate.py` and re-run it. To swap the logo,
replace `source/pm-logo-source.svg` and re-run (the parser fails loudly if the
artwork's paths don't match the expected shapes).

## The 8 theme variants

Contrast baseline: the original logo is 3.47:1 (marks on tile); six of eight
variants beat it — friendly-light (3.09:1) and glass-light (3.53:1 at the gradient
top, dipping toward 3.0:1 at the bottom) trade a little contrast for theme
fidelity while staying at the 3.0:1 WCAG graphics minimum. Tile corner radius follows the theme's radius
personality (retro 0, basic 3, glass 10, friendly 8 on the 43.2-unit canvas).

| Theme | Tile | Marks | Strings | Treatment |
|---|---|---|---|---|
| retro-dark | #1A1A1A, rx 0 | #00FF41 (12.75:1) | #FF1493 | inset lime border |
| retro-light | #0047AB, rx 0 | #F5F0E8 (7.44:1) | #F5F0E8 | hard #1A1A1A offset shadow |
| basic-light | #0056B3, rx 3 | #FFFFFF (7.04:1) | #FFFFFF | flat |
| basic-dark | #2D2D2D, rx 3 | #64B5F6 (6.22:1) | #64B5F6 | white hairline |
| glass-dark | #2E2344→#241B36 gradient, rx 10 | #B79CFF (6.4:1) | #E58BC8 | glass edge gradient |
| glass-light | #F6F0FF→#E9DCF2 gradient, rx 10 | #8B6ED9 (3.53:1) | #C167B4 | bright white rim |
| friendly-dark | #322E3A, rx 8 | #C3B1E4 (6.76:1) | #6FC6E8 | hairline |
| friendly-light | #3F9CC7, rx 8 | #FFFFFF (3.09:1) | #FFD166 (decorative) | flat |

The P glyph's keyline always takes the tile color (on glass it samples the tile
gradient via `userSpaceOnUse`), preserving the original's knockout trick. The tray
template turns that keyline into actual transparency via a mask, and thickens the
strings 0.97→1.6 units so they survive 16-18 px rendering.

## The 8 loading motions

Every animated SVG animates standalone in a browser and freezes to the pristine
finished logo under `prefers-reduced-motion: reduce` — all motion CSS lives inside
an `(prefers-reduced-motion: no-preference)` media query and the base markup IS the
rest pose (it is byte-wise the static variant plus a stylesheet). A second
kill-path honors PM7's `[data-motion="reduced"]` attribute when embedded inline.

| Motion | File pairing | Feel | Slint port |
|---|---|---|---|
| Crossbar Spin | friendly-dark | bar rotates about its crossing, rest dims — the default loader | native |
| Shimmer Sweep | glass-dark | diagonal highlight sweep, artwork static — skeleton contexts | native rebuild |
| Bar Draw | retro-dark | bar redraws tip-to-tip as a traveling stroke | web-only |
| Typing Wave | retro-light | { P M } dip in sequence, typing-dots rhythm | native |
| String Draw-In | basic-light | puppet assembles then resets — splash/boot at 128 px | native |
| String Pulse | glass-light | accent pulses flow down the strings | native redesign (sliding dot) |
| Control-Bar Seesaw | basic-dark | bar rocks +/-5°, letters ride the strings | native |
| Marionette Bob | friendly-light | letters bob out of phase — ambient/idle more than loading | native |

Timing and easing adopt the theme family's motion personality (retro snap ×0.85,
basic smooth, glass ease-out ×1.25, friendly spring); continuous spins stay linear.
The theme↔motion pairing above only decides the 8 on-disk files — the dashboard's
Mix Lab composes and downloads any motion in any palette.

## Platform packaging (Slint 1.17.1 app, macOS / Linux / Windows)

Slint renders SVG via resvg: **static only — CSS-in-SVG animation is ignored.** Use
the static SVGs freely as in-app images (`@image-url`); use the `.slint` components
for loading states; use the animated SVGs on the web/docs side.

- **Windows**: dashboard exports a multi-size `.ico` (16-256, PNG-in-ICO). Embed via
  a `.rc`/winres resource; the same `.ico` serves the notification-area tray icon.
- **macOS**: dashboard exports `.icns` (16-1024 including @2x entries) for the app
  bundle. For the menu bar use `pmTemplate.png` + `pmTemplate@2x.png` (black+alpha;
  the capital-T `Template` suffix makes AppKit auto-adapt to light/dark menubars).
- **Linux**: hicolor PNG set (16-512) for `hicolor/<size>x<size>/apps/` plus the
  scalable SVG for `hicolor/scalable/apps/`; tray uses the PNG or `pm-tray-white`
  on dark panels.
- **Slint components** (`slint/`): copy the `.slint` file plus `slint/layers/` into
  your project; each exposes `size`, `tile-color`, `mark-color`, `string-color`,
  `tile-radius` and a `period`, with friendly-dark defaults. Motion is driven by
  `animation-tick()`; layers are white SVGs tinted with `Image.colorize`, strings
  are native rectangles (height-animatable). Bar Draw is web-only (dash-draw has no
  honest Slint equivalent); Shimmer Sweep and String Pulse are native redesigns,
  noted in their headers. Components are written against Slint 1.17 docs but have
  not been compiled here — treat them as strong starting points and compile-check
  them in your project.

## Conventions honored

- No emoji anywhere (project rule F3-417) — all dashboard glyphs are inline SVGs;
  gate: `python3 ../pm6-build/checks/check_no_emoji.py <file>`.
- Reduced motion: standalone media query + `[data-motion="reduced"]` second path.
- File naming matches the sibling `GLMicon` exploration (`pm-<theme>.svg` /
  `pm-<theme>-loading.svg`) for side-by-side comparison.
