# Liquid Glass for Puppet Master's Glass look: what to borrow and what not to

pm7-liquid-glass (Opus 5.5), 2026-10-11. Step 1 of `BRIEF-liquid-glass.md`. Sources are listed at the end.

## What Apple shipped

Liquid Glass came in iOS 26 and macOS 26 (WWDC 2025). iOS 27 and macOS 27 "Golden Gate" (WWDC, 8 June 2026; out 14
September 2026) kept it and fixed what people complained about.

**The material (2025, still true).**
- **Lensing.** It bends and concentrates the light behind it instead of scattering it, so the edge of a control shows
  the content behind it pulled and magnified.
- **Light.** It catches light along its edges with bright highlights, and lights up from inside when you press it. The
  glow starts under the finger and spreads to nearby glass.
- **Shadows.** Its shadow deepens over text and softens over plain backgrounds.
- **Thickness by size.** Big glass looks thicker, with deeper shadows, more lensing and softer scatter.
- **Appearing.** It materialises by ramping the lensing up rather than fading in. Menus pop open from the button like
  a bubble.
- **Stretch.** It is gel-like: it stretches with a drag and morphs from one control to the next.
- **Layers.** Glass is a separate layer of controls and navigation that floats above the content. Content is never
  glass, and glass never sits on glass. Things drawn on glass use fills and vibrancy so they read as part of it.
- **Variants.** Regular adapts to what is behind it and is used almost everywhere. Clear is permanently see-through,
  needs a dimming layer, and only suits media.
- **Tint.** Tint marks the primary action only: "when every element is tinted, nothing stands out." Colour belongs to
  the content.
- **Shapes.** They are concentric. Each inner corner is the outer corner minus the padding, so radii nest the way the
  window's do. There are fixed shapes, capsules and concentric shapes. Pinched or flared corners are mistakes.
- **Scroll edges.** Content dissolves softly under floating bars. A harder, more opaque edge is used under pinned
  column headers. There is one edge effect per view, and only where something floats.
- **Window focus.** An inactive window's glass recedes.
- **Accessibility.** Reduce Transparency makes the glass frostier. Increase Contrast makes it mostly black or white
  with a contrasting border. Reduce Motion turns off the stretch.

**What 27 changed (answers to the readability complaints).**
- Less transparency by default, "more uniform refraction and improved contrast".
- A new Settings slider sets the glass "from ultraclear to fully tinted".
- On the Mac, one uniform toolbar across the top with a frosted look, so its buttons stand out from the content below.
- Sidebars run edge to edge and full height again, no longer inset and floating. Content still scrolls visibly behind
  them.
- Window corners are tighter and the same in every app.
- Coloured sidebar icons return, in the active window only.
- The active window stands out more clearly.
- Menus carry far fewer icons.

## Where Puppet Master starts

- **Glass today is not glass.** Every Glass surface is a dark lavender plate (`#241B36`, light `#E4CDE4`) on an
  **opaque** app shell, so the wallpaper never shows through. That is why the rail's header and tab plates read as
  solid (RAIL-5). Canon (F3-427) says one translucent slab with a 34 px blur over the baked wallpaper.
- **The palette is purple everywhere:** tinted glass, a lavender accent and lavender text. Apple's glass is neutral
  and takes its colour from what is behind it.
- **There are pills, and the radii don't nest:** the activity bar is a capsule, the page tabs and title-bar buttons
  are 999 px capsules, and radii run 11–22 px with no relation to each other.
- **Canon limits I keep:**
  - one shell blur plus the floating chat's blur, and interior glass made of plain fills (F3-427);
  - a closed blur budget, no SVG filters and colours precomputed (F3-431);
  - wallpaper modes mesh, depth and minimal, baked (F3-428);
  - control corners of 6 px with 3 px inside, in Glass (DL-184 / F3-648, from no-pills);
  - no pills, no coloured side bars and no emoji (DL-184).
- **Canon says Skia draws backdrop blur, masks and gradients natively (F3-582).** The CPU raster draws frosted surfaces
  solid.

## Borrow

1. **Real glass again.** The shell becomes one translucent slab over a newly baked wallpaper, as F3-427 already says.
   You see the light through it.
2. **Neutral glass, colour from behind.** The glass is clear-grey in dark and pearl-white in light. Colour comes from
   the wallpaper and the content. One accent, a clear blue, marks primary actions and the chosen tab only. Status
   colour lives in the approved neon glyphs.
3. **Two layers.** Controls and navigation are "liquid": the title bar, tab strips, toolbars, segmented controls, the
   activity bar, menus and the composer. Content cards are calm frosted plates. Nothing glass sits inside a glass
   card; a card's inner parts are fills.
4. **Light on the edges, sized by surface.** Every glass surface gets a lens rim:
   - a bright specular hairline along the top;
   - a softer return highlight at the bottom;
   - a luminous inner falloff;
   - a contact hairline outside.

   Small controls get a thin rim, large slabs a deep one with richer shadow.
5. **The pointer is the light.** Over the control layer a specular highlight follows the cursor across the glass.
   Pressing lights the control from the press point and the glow spills onto its group. Cards keep the hover thread's
   magnet and glow (DR-072), restyled as the same edge light.
6. **The lens.** The chosen tab, segment or rail icon sits under a brighter glass lens with 6 px corners, not a
   capsule. The lens shows the wallpaper behind it slightly magnified and brighter. It is drawn from the baked image,
   not a blur, so it costs nothing, Skia can draw it and the CPU path keeps it. It slides between tabs with a liquid
   stretch (the leading edge goes first, then one soft wobble). The rail's Glass tabs already stretch; this extends
   that to every tab strip.
7. **Concentric shapes.**
   - The window has one tighter radius (16 px, after macOS 27).
   - Slabs and sidebars nest inside it at radius minus inset.
   - Cards are 12 px; controls keep canon's 6 px with 3 px inside.
   - No pinched or flared corners, and no capsules.
8. **The macOS 27 layout.**
   - One uniform frosted toolbar across the top.
   - A sidebar (activity bar plus rail panel) that runs edge to edge and full height, with the panel's header and tab
     plates frosted (RAIL-5).
   - The chosen activity icon in colour, in the active window only.
9. **Soft scroll edges.** Content dissolves under the Usage toolbar and under the rail panel's header. There is a hard
   edge only under pinned column headers (the Ledger table). This is a gradient mask, not a blur.
10. **Bubble menus.** Menus and popovers grow out of the control that opened it and settle with a small overshoot.
    Their content arrives a beat later.
11. **Window focus.** When Puppet Master loses focus the rims dim and the accent greys a little, and it comes back on
    focus.
12. **A clarity slider (from 27):** Clear to Tinted in Settings › Appearance › Glass. It moves the canon k-factors
    within a safe range, never below the contrast floor. *Decision card: it changes F3-427's fixed numbers.*
13. **Accessibility.**
    - Reduce Transparency: the reading-plate frost everywhere.
    - Increase Contrast: black or white text and a 1 px contrasting edge.
    - Reduced Motion: no stretch, wobble or bubble, only 120 ms fades. The light stays.

## Don't borrow

1. **Capsules.** Apple's tab bars, buttons, sliders and toolbars are capsules, and DL-184 bans pills. Use 6 px
   lozenges and joined cells (no-pills NP-CHOICE).
2. **True refraction of whatever is behind.** It needs an SVG displacement filter or a per-control backdrop blur. F3-431
   bans both, it only works in Chromium, and it is expensive. The rims, the pointer light and the baked-wallpaper lens
   carry the look instead.
3. **The Clear variant on reading surfaces.** Puppet Master is dense with text, so Regular behaviour only. Frost must
   never cost legibility.
4. **Glass on glass.** No frosted card inside a frosted card. Inner parts are fills.
5. **Floating, shrinking iOS bars.** Desktop chrome stays put, and nothing hides on scroll.
6. **Live light/dark flipping of small controls per frame.** It needs per-frame sampling of what is behind. The look
   chooses light or dark, and shadows come in precomputed tiers.
7. **Device-motion lighting.** A desktop has none, so the pointer is the light.
8. **Tinting everything, or tint casts per zone.** Those were retired once already.
9. **New fonts.** Inter stays (Jared: "you can keep the fonts").
10. **The Planning Wizard and the Orchestrator.** Both are being redesigned later.

## Readability rule

Text reaches 4.5:1 and glyphs 3:1, measured over the busiest pixel of the baked wallpaper behind each glass tier, at
the clearest clarity-slider setting. Glass Light's success green and warning amber are re-picked to clear 4.5:1
(RAIL-10). If a frost step fails, it gets denser; the text never gets lighter.

## The CPU path (Nas1, Skia CPU raster)

The wallpaper is known and baked. On the CPU path the slab paints the pre-blurred wallpaper directly as its own
background instead of blurring live, so a still frame looks the same as the GPU's. The depth mode's moving puffs and
parallax freeze. The pointer light, the press glow and the lens stay, because each repaints one small control. The
rim light sweep turns off. The page chooses the CPU path from the WebGL renderer name and a measured frame time when
it boots.

## Sources

- Apple, "Meet Liquid Glass" (WWDC25 session 219): https://developer.apple.com/videos/play/wwdc2025/219/
- Apple, "Get to know the new design system" (WWDC25 session 356): https://developer.apple.com/videos/play/wwdc2025/356/
- Apple HIG, Materials: https://developer.apple.com/design/human-interface-guidelines/materials
- 9to5Mac, macOS 27 Golden Gate changes (9 June 2026): https://9to5mac.com/2026/06/09/macos-27-golden-gate-includes-these-changes-that-tahoe-critics-will-appreciate/
- Cult of Mac, five biggest Liquid Glass changes in iOS 27 and macOS 27: https://www.cultofmac.com/news/liquid-glass-changes-ios-27-macos-27
- Dr. Logic, WWDC 2026 Liquid Glass: https://drlogic.com/article/wwdc-2026-liquid-glass-and-a-rare-apple-concession/
- MacRumors, macOS Golden Gate announced: https://www.macrumors.com/2026/06/08/apple-announces-macos-golden-gate/
- Wikipedia, Liquid Glass: https://en.wikipedia.org/wiki/Liquid_Glass
