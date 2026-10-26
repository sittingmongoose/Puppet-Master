# Pip: Puppet Master logo concept (Opus 5.5)

A new mark for Puppet Master: **Pip**, a small agent hanging from a marionette control. It covers
the top-left logo in PMConcept7, the app icon, the tray icon, the loading animation and status
states, in all eight PMConcept7 themes plus NieR light and dark. A second, more conservative
direction (**PM monogram**, the reference mark redrawn) is behind the Direction switch.

Open `index.html` (double-click works; the "Inside PMConcept7" preview needs it served over http,
which the Concept Hub does). Nothing outside this folder is read or changed except that the live
preview loads `../../PMConcept7.html` in a frame and swaps its title-bar text at runtime.

## The idea

- **The control is the user.** The crossed marionette bar is whoever runs the show; the strings
  say Puppet Master directs the work.
- **The head is a pair of braces.** `{` and `}` drawn as one shape; the brace points read as ears.
- **The face is the status.** Idle, working, done, needs you, error, paused. Tray and notification
  icons change expression instead of carrying a colored badge.
- **It survives 16 px.** Hand-placed sprites at tray size, a heavier vector cut for 19 to 40
  device pixels (the 40 px title bar at 1x), full detail above that.
- **The strings are real.** Each string hangs from a screw eye on the underside of a stick,
  5 units in from its lower tip (the eye's top tucks under the stick), and ends in a matching eye
  on Pip's head. Sticks are fully opaque, the back one shaded with a solid colour, so no string
  ever shows through a bar. NieR uses square nodes instead of eyes. Loaders are a small rig: the control rocks, Pip hangs
  from it, and both strings are solved again for every sampled frame, so they never come loose.
  Retro redraws them as pixel lines in every frame. The PM monogram's three strings use the same
  eyes and the same solver.

## Themes (v0.2)

Every colour is PMConcept7's computed token for that theme, sampled from the running page.

| Family | Pip |
|---|---|
| Friendly | soft vinyl toy: shaded head, a corner highlight, catchlights, peach cheeks |
| Glass | Liquid Glass, matching PMConcept7's current Glass (neutral glass, blue accent): a clear blue lens with a rim lit from above and a bright base; on the app tile it refracts the Ribbons wallpaper behind it. No highlight band across the brow. |
| Basic | flat, one accent, no cheeks |
| Retro | pixel sprites (16, 24, 32 px grids) in PMConcept7's olive/lime and cream/green; 8-frame swing |
| NieR | a YoRHa unit: hairline line art like PMConcept7's own Pod, a blindfold band whose tails fly past the ear, square nodes where lines end, a diamond pin; idle shows no eyes and other states light up on the band. Tile: graph paper, target brackets, a node-ended rule and a P-01 unit code. Static only. |

## Static and animated

| Use | Variant |
|---|---|
| PMConcept7 top-left (title bar) | static mark, 24 px, beside the theme's wordmark; mark only when squeezed |
| App icon (dock, Start, launcher) | static tile per theme; plain mark at 24 px and below |
| Tray / menu bar | static template (macOS) or color (Windows) mark; Working is a four-frame flip |
| Notifications, chat avatar | static moods |
| Loading (splash, chat Working row, buttons, panels) | animated loader: Swing (default), Think, Hop |
| NieR | static everywhere; NieR keeps its own loader |

Motion follows each theme's own personality: Friendly springs (1.8 s), Glass glides (2.6 s),
Basic eases (1.7 s), Retro flips eight pixel frames (1.2 s). Reduced motion (OS setting,
PMConcept7's `data-motion="reduced"`, or the Hub's flag) removes all travel and keeps an opacity
signal: the control breathes and Pip blinks.

## Files

```
index.html, styles.css, app.js   the gallery (themes, mocks, live PMConcept7 swap, downloads)
pm-logo.js                       the generator: every SVG on the page and in every download
fonts.css                        Latin subsets of the fonts PMConcept7 already embeds
wall-ribbons-*.webp              PMConcept7's Glass wallpaper (copied unchanged), for the Glass gallery
in-pmconcept7.webp               a 2x capture of the real PMConcept7 top bar with Pip swapped in
tools/build_standalone.py        builds the single shareable HTML file
concept-hub-bridge.js            Concept Hub theme and reduced-motion bridge (starter copy)
concept-hub.json                 Hub registration
```

`pm-logo.js` has no DOM dependency, so a build script (Node) or a later Slint pipeline can call
the same code:

```js
PMLogo.svg({
  mark: 'pip' | 'mono',
  theme: 'friendly-dark' | ... | 'nier-dark',
  form: 'glyph' | 'tile' | 'tray',     // tray = one ink (`ink`), for macOS templates
  px: 24, dpr: 1,                      // picks the tier: micro (<= 18 device px), small (<= 40), full
  mood: 'idle' | 'happy' | 'alert' | 'error' | 'sleep' | 'think',
  motion: null | 'swing' | 'think' | 'hop',
  reduced: false
})
```

Every animated file keeps the static pose as its base markup, so a renderer that ignores CSS
(a tray image, Slint's SVG loader) still shows the finished mark.

## Share it

`python3 tools/build_standalone.py puppet-master-pip-logo.html` writes one self-contained file
(about 640 KB) with the fonts, styles, wallpapers, generator and gallery inlined. It opens by
double-click anywhere, makes no network requests, and keeps every control and download. The live
PMConcept7 frame cannot travel with it, so it shows `in-pmconcept7.webp` instead.

## Downloads (generated in the page)

Per theme: mark, tile, loader and tray-template SVGs, a 1024 PNG. App icon files: `.ico`
(16 to 256), `.icns` (Apple icon grid with shadow), a PNG set. A full SVG pack with a manifest.

## Not done yet

- No Slint component; the motion table above is the spec for one.
- Colors are taken from PMConcept7's theme tokens; a final pick would lock them in `Plans/`.
