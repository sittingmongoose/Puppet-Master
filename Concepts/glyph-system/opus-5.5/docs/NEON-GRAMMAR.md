# Neon grammar (pm7-glyphs-designer2, 2026-10-10; for pm7-glyphs to confirm)

Read from the 5.6 Pro set (`Concepts/chat-assistant-concepts/5.6 Pro/neon-icons.css`, `neon-icons.js`, the bar's
`activity-bar.css`) and DL-140/DL-146. **Source** marks a rule the set already has. **Proposed** marks a rule I am
adding for PMConcept7, which needs your confirmation.

## 1. Anatomy (source)
Every glyph is one `<svg class="nx">` on a 24-unit grid, built in three layers:
1. **Core halo** (`.nx-h`): one merged path holding every static part, stroked in the glyph's own ink at a fixed
   screen width (`vector-effect: non-scaling-stroke`). Because it is one path, halos never stack where strokes cross.
2. **Tubes** (`.nx-c`): the drawing itself, in round caps and joins, with no fill (only beads and dots take `nx-f`).
3. **Moving parts** (`.nx-p`): each carries its own halo copy, so the glow travels with the tube.

The soft tail of the glow is **not** in the SVG. It is a radial backlight on the HTML host (`.nx-st::before`), because
stepped stroke bands drew a plate shaped like the glyph. No `filter`, `color-mix()` or `stroke-dashoffset`, and no
scale anywhere.

## 2. Stroke weight at 12, 16 and 20 px (proposed, measured)
Painted px = `--nx-stroke-base` × size / 24, then × the tone factor. The source default of 1.8 is right at 20 px but
paints 0.9 px at 12, where the check almost vanishes at dpr 1. Evidence:
`/mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-glyphs-designer2-20261010/weight-ladder-dpr1-zoom4x.png`
(SHA-256 `954640ac872718c1844f82c823e00488c163f1f62e4880504e9ba7bda2834abd`).

| Rendered size | `--nx-stroke-base` | Painted | Verdict at dpr 1 |
|---|---|---|---|
| 10-11 px | 3.0 | 1.25-1.4 px | static (size gate); Orbit uses 2.9-3.4 |
| **12 px** | **2.6** | **1.30 px** | 1.8 is grey and broken; 3.0 clogs the gear and the bubble |
| 14 px | 2.3 | 1.34 px | the rail's chosen weight |
| **16 px** | **2.0** | **1.33 px** | 1.8 is thin; 2.4 clogs |
| **20 px** | **1.8** | **1.50 px** | 1.6 is thin; 2.0 is heavy |

Tone factor (`--nx-tone-k`, source): blocked 1.22, attention and working 1.17, changed 1, done .83, idle .78 (1 in the
status wrapper), paused 1. A context that renders an SVG at another size than it was drawn at sets `--nx-u: 24/size`
so that the halo copies inside moving parts keep their screen width.

## 3. Halo and backlight (source)
Core band: **3.6 px** of screen width on dark looks and **3.4 px** on light looks, centred on the tube. That puts about
**1.15 px** of bloom past each edge of a 12 px tube and about 1.0 px past a 20 px tube: the bloom is fixed in pixels
and does not scale with the glyph. The band's strength is `stroke-opacity`:

| State | Dark | Light |
|---|---|---|
| blocked / attention / working / changed | .24 / .20 / .20 / .12 | .08 / .08 / .08 / .07 |
| done, idle (quiet) | .10 | .06 |
| concept at rest | .17 | 0 (the ink alone reads as lit) |
| control on hover, concept swell on hover | .30 | 0 (the tube takes `--text` instead) |
| paused, skipped | 0 | 0 |

Backlight: `radial-gradient(closest-side, tone, transparent)` at 220 % of the mark, so a 12 px mark glows out to about
13 px from its centre. Its element opacity is blocked .086, attention .08 and changed .042 on dark looks, and .102,
.081 and .043 on light looks. Working and reviewing have none, and the quiet tones have none. Light looks keep the
band thin, because a halo of a dark ink on paper reads as a tinted sticker.

## 4. Roles: who is lit and who moves (source, DL-140)
| Role | At rest | On hover or focus | Loops |
|---|---|---|---|
| status | lit in its tone, with its backlight | unchanged | yes, its own rhythm |
| concept (names a thing) | lit and still (halo .17) | swells to .30 and plays its act once | no |
| control | unlit (halo hidden) | ignites: the halo fades in over 180 ms and flickers once over 300 ms, the tube takes the text ink, and the act plays once | no |
| brand | the provider's own drawing | none | no |

Colour is reserved for status. Concepts and controls take their host's ink. The one exception is the composer's wand
(DL-146).

## 5. Motion built from parts (source, plus the lead's PMG rule)
- A part's pose is declared, never drawn: `ax/ay` translate (units), `ar` rotate (degrees, about `o`), `ao` opacity at
  the pose, `cr` circling radius, `ac/ae` clip insets for a draw-on, and `ad` stagger (ms). `neon-icons.js` writes
  literal keyframes from the pose, using transform and opacity only, so they run on the compositor.
- **The rest pose is the finished, lit drawing.** One-shots run arrive (pose to rest), bounce (`b`: rest, pose, rest)
  or reveal (`ac`: clip). A one-shot never dims a part below .85, a loop never below .6, and a draw-on starts at least
  40 % drawn.
- **The motion is the glyph's verb**, unique to each icon: the goal arrow strikes the ring, the To-Do ticks check in
  one by one, the folder tab lifts, the hourglass tips. The static parts stay still, so the shape still reads while it
  moves.
- Loop shapes (`act`): strike, seq, fill, wave, swap, spin, hop, drop, ratchet, blink, calm, tip and tick2. Each is a
  fixed keyframe table, and the context supplies the period.
- Size gate: below 12 px nothing moves. At 12-14 px a part moves only if it travels at least 1.5 rendered px, which is
  **3 units at 12 px**, or if it is a reveal at least 1.5 px long. From 15 px up everything moves.
- PMG caps a glyph at **two moving parts**. The source has glyphs with three or four (todo, sparkles, more, chart,
  expand, wand). See question 2.

## 6. Timing ladder (source)
| ms | Use |
|---|---|
| 33 | PMConcept7's Retro tick (the rail) |
| 180 / 300 | halo fade-in on ignite / the ignite flicker (halo path only) |
| 240 | NieR's two-beat tube flicker |
| **440** | `--nx-d1`, the one-shot act; stagger 60-170 ms between parts, 360 ms at most |
| 520 | complete's check draw, blocked's shackle drop, the wand's sparkle |
| 1000-1100 | bespoke long acts (grill, the Fast bolt's strike on hover) |
| 1400 / 2200 | an urgent working loop (jump-bottom) / `ab-breathe` (opacity 1 to .48) |
| 2400 | needs-you: the "?" hops 3.4 units twice; the backlight breathes |
| 1900 / 2700 | blocked's hard double blink (`ab-alert`, steps) / failed's irregular stutter |
| 2800 / 3600 / 4800 | reviewing sweep / waiting-dep tip and hold / recovering ratchet |
| 5200 / 9000 | the Fast bolt's cycle / the working bead's orbit (the quietest live mark) |

Salience order, loudest first: needs-you, then blocked and failed, then reviewing, then working. A new loop slots into
this order and never out-moves needs-you.

## 7. One voice per look (source): the order and timing never change, only the easing
| Look | One-shot (`--nx-ease`) | Loop (`--nx-le`) | Spin |
|---|---|---|---|
| Basic | `cubic-bezier(.2,.75,.25,1)` | `(.45,0,.25,1)` | linear |
| Friendly (overshoots) | `(.34,1.56,.64,1)` | `(.34,1.4,.64,1)` | linear |
| Glass (glides) | `(.4,0,.1,1)` | `(.6,0,.25,1)` | linear |
| Retro (steps) | `steps(4)` | `steps(4)` | `steps(16)` |
| NieR | `steps(4)` | `steps(6)` (complete `steps(3)`) | `steps(12)` |

## 8. Reduced Motion (source)
All three routes (the media query, `html[data-motion="reduced"]` and `body.pm56-reduced`) stop every animation and
transition. What remains is the rest pose, which is the finished lit drawing, so ink, halo, weight and the static
backlight still carry each state. Act overlays (smoke, strike fills, glints) stay hidden. Hover still lights a control
(the halo snaps on and the ink brightens) but plays no act. In NieR, the inverted needs-you block, the working diamond
and the bar's underline still carry state.

## 9. Retro: phosphor, stepped (source for the motion; the rest is proposed)
- **Source:** the same drawing and the same halo tokens. Every act is `steps(4)` and spins are `steps(16)`.
- **Proposed, Retro Dark (a phosphor CRT):** the ink is the phosphor palette (`--accent-primary` #b8d066 for the lit
  default; tones from the Retro tables). Phosphor lights instantly and decays slowly, so **ignite has no fade**: the halo
  cuts on in one 33 ms tick, the tube shows the text ink for one tick (an over-bright strike) and then settles to its
  ink. On leave, the halo decays in two ticks (`transition: stroke-opacity 66ms steps(2)`). The core band narrows to
  3.0 px and the status backlight halves, so it reads as phosphor on glass rather than a sign on a wall. One-shots
  snap to the rail's clock: 396 ms in `steps(4)`, three ticks a step. Draw-ons then print in four chunks, matching the
  rail's line-by-line print.
- **Proposed, Retro Light (print on cream):** no halo (as on every light look), cobalt print ink, the same stepped
  motion, and the same instant cut on ignite, shown by ink alone.
- **Both:** on an inverse cell (Retro's one-tick inverse flash on a landed tab), the glyph takes the cell's paper ink for
  that tick, the same rule NieR's cursor bar uses. Caps stay round: square caps belong to NieR.

## 10. NieR: ink, no glow (source, PMConcept7 contract)
No halo and no backlight (`display: none`). The inks come from the NieR tables. Idle and paused are ink at .45 (.545
and .63 on NieR Light, for 3:1). Square caps and mitre joins with a mitre limit of 2, so sharp angles bevel. A draw-on
becomes a stepped opacity reveal from .4, because NieR animates no clip. Ignite is a 240 ms two-beat flicker of the tube
itself (`steps(1)`: .45, 1, .45, 1). Needs-you is an inverted ink block with a paper "?", and in lists, brackets lock
on for its two beats. Working is the diamond turning in six steps. Idle and pending become squares. Failed glitches
once (320 ms) instead of stuttering. On the cursor bar every glyph takes paper ink at its own alpha.

## 11. Ink and contrast
Glyph ink always goes through `--nx-ink` and never `color`. In PMConcept7 it comes from the per-look glyph ink tokens you
define (raw tones fail 3:1 in Friendly Light and Glass Light). Every lit and unlit glyph holds 3:1 against its field,
including hovered and selected rows. Quiet inks sit below every live tone in the same look (source 3E2: idle about
3.1:1, under the lowest live tone).

## 12. Drawing rules I will follow for new glyphs
24 grid with 2 units of margin (live area 3-21). Draw for 12 px first. Parallel strokes sit at least 5 units apart
centre to centre, which leaves 1.2 px clear at 12 px. Any join must survive NieR's mitre limit of 2, or accept the
bevel. Travel is at least 3 units for a glyph that lives at 12 px; otherwise use rotation or a reveal. Use transform and
opacity only, the rest pose is final, every glyph's motion is its own verb, and it holds 3:1 in every look. If the
source set already draws the concept, I map the item to it instead of redrawing.

## Questions for pm7-glyphs
1. Do you confirm the weight ladder (12: 2.6, 14: 2.3, 16: 2.0, 20: 1.8) as each context's `--nx-stroke-base`?
2. Should the moving-part cap stay at two, or allow three for a sequence (three ticks, three sparkles), as the source does?
3. Do you confirm the Retro phosphor rules in section 9 (instant cut on ignite, two-tick decay, 3.0 px band in Retro
   Dark, the 33 ms clock)? I will check them frame by frame on the P1000 before I send any family.
4. What are the names of the per-look glyph ink tokens, so my families consume them?
