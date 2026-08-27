# PMConcept7 - Notes

## What this file is

`Concepts/PMConcept7.html` began as the refactored, cleaned, runtime-lighter derivative of `Concepts/PMConcept6.html`, produced for one purpose: a Slint-porting agent should be able to read it without being confused by dead code, iteration debris, or HTML-only implementation artifacts. Through T20 it was functionally equivalent and visually identical to PMConcept6 with exactly one approved exception (glass wallpaper pre-bake, below), plus the rev-4 chat/page-switch work that lives upstream in parts.

That visual-identity contract no longer holds. PMConcept7 has since taken deliberate product-surface evolution of its own -- the T20 model-first Home Workspace and, from 2026-08-20, the Prism Usage workspace and the retro-dark palette retune. Read the re-baseline section below first: as of 2026-08-27 PMConcept7 is also its own pipeline base.

## Re-baseline onto the hand-edited Prism Usage build — 2026-08-27

`Concepts/PMConcept7.html` is now the 2026-08-20 version
(sha256 `9dcde2a8862de0cdd28a0d540cb4976396ea0556e6ff15a5c9c8fc14bd121090`,
4,101,102 bytes, up from 3,619,880). It replaced the previous artifact
(`213a3ee9…`) and simultaneously became the pipeline's pinned base.

**Why the base moved.** That version was hand-edited directly into the HTML
rather than generated. No `build_pm7.py` produced it and no transform source
for it has ever existed — not in this repo, not in any codex worktree, not
anywhere on disk. Its own header still claims "T01-T23" while its CSS carries
wave comments through T21-T24 and T29-T32.2 and style blocks
`pm7-t23-adjustments`, `pm7-t24-usage-readability-and-fit`,
`pm7-t29-usage-final`, `pm7-t31-usage-final`, `pm7-t32-final`. Since that work
cannot be re-derived, it was frozen into `base/PM7-base.html` and `TRANSFORMS`
was emptied; T01-T20 are retired-into-base. See `pm7-tools/README.md`
("Re-baseline") for the full rationale.

Leaving the pipeline as it was would have been actively dangerous: `BASE_SHA`
still pointed at PMConcept6 and `TRANSFORMS` still ended at T20, so the next
build would have regenerated the old artifact and destroyed every hand-authored
wave.

**What the new version actually changes** (vs the previous PMConcept7):

1. **Prism Usage workspace.** Document sections 14 and 15 change from
   `usage-grid-css` / `usage-page-js` to `usage-prism-css` / `usage-prism-js`.
   The whole `pm7u-*` component family (~1,085 references) is new: a rail +
   board shell, 12 instrument/summary/list/chart cards with
   `data-kind`/`data-shape`/`data-density`/`data-rows` axes, meters, stat
   stacks, and mini bar charts. Card content follows panel size.
2. **Retro-dark palette retune** — `--background`/`--surface` move from
   `#1A1A1A` to `#10120e`, with the rest of the ramp adjusted to match.
3. **Font additions** — IBM Plex Mono and Poppins join the preload/noscript
   Google Fonts stylesheet.
4. Block census grows from 32/13/19 to 43/22/21 (total/style/script).

**`--h` is dead CSS, not a defect.** The `var(--x)-used-implies-defined` gate
flags `--h` as used-but-never-defined in rules like
`.pm7u-mini-bars i { height: max(18px, var(--h)) !important }`. Those rules are
vestigial: they target `i` children, and the live renderer emits
`<span class="pm7u-barcol" style="--pm7u-bar-height:NN%">` wrapping
`<span class="pm7u-barfill">`, whose height comes from
`max(5px, var(--pm7u-bar-height, 0%))` — a defined variable with a fallback.
Measured in the browser: 0 `<i>` elements inside `.pm7u-mini-bars`, 120
`.pm7u-barcol` elements. Left in place deliberately; removing it is a base
edit for a future transform.

**Charts are row-gated by design.** On the default board no mini chart is
visible, and that is intended, not a regression. The winning rule is
`.pm7u-card[data-kind="instrument"]:is([data-rows="1"],[data-rows="2"],[data-rows="3"]) .pm7u-mini-signal { display:none !important }`
("At three rows an instrument cannot show four facts, two meters, a footer,
and a complete chart"), and summary cards at `data-density="compact"` hide
their `pm7u-tier-standard` subtree by the density ladder. Every default card
sits at 2-3 rows. Grow one to 5 rows and the chart appears correctly: the
mini-signal computes to `display:grid` at 94px, and all 12 bars take real
heights (13.0px-46.8px) tracking their `--pm7u-bar-height` values
(25%, 36%, 32%, 51%, ...), each with its value label.

**Verification.** Identity build reproduces the artifact byte-for-byte (`cmp`
clean, `base_pin_ok: true`, block census 43/22/21) with all four static gates
PASS. Browser pass over `file://` (Chromium via playwright-core; headless
Chromium hangs on http in this sandbox): zero console and page errors on boot,
on the Usage page, on Home, and across all eight themes
(friendly/retro/basic/glass x dark/light); Prism shell renders at 1611x999
with 12/12 cards laid out and a 55-item rail; the T20 Home Workspace is intact
(split editors, tabs, terminal, dashboard widgets). The PM6-vs-PM7 pixel-parity
matrix was deliberately NOT run — the new version abandons the "visually
identical to PM6" contract by design.

## Previous Home Workspace implementation — 2026-08-15 (rev 21, Wave 8: kebabs above-centre, floating-chat Dock back, snap-while-dragging, real home scroll kill)

The user rejected all four wave-7 items; each re-diagnosis found the wave-7
fix had missed the real mechanism.

1. **Kebabs above-centre.** The dots' ink centre sits at button-local
   top+10, so wave-7's editor top:10 left the ink 3px BELOW the tab-label
   line. Now editor `top: 6px` (ink 1px above the label line) and dashboard
   `top: 2px` (ink 3px above the title line); the grip's hit-triangle
   concession is confined to glyph-free padding (comment documents the
   geometry).
2. **Floating-chat "Dock back".** The retired T20 kebab's one exclusive row
   was Dock Back while floating -- and the base chat menu always renders its
   DOCKED variant (T20 floats #chatPanel itself), so a floated chat showed a
   useless "Pop out window" and no way back but the grip. The chat branch of
   attachSurfaceControls now injects an idempotent `Dock back` row
   (`[data-pm-home-chat-row]`, base pm6-chat-more-item styling) into the
   base menu, shown only while floating; "Pop out window" hides while
   floating. Dispatch rides wireActions' capture listener WITHOUT stopping
   propagation, so the base delegated handler still closes the menu with the
   portal animation. Round-trip verified; exactly one injected row survives
   chat innerHTML rebuild churn.
3. **Snap-while-dragging (the real "behind tab visible" fix).** The plate
   was already opaque in all 8 themes; the hole was the GRAB-SPRING:
   grabbing a non-active tab flipped lastActive and EDSHAPE SPRUNG the
   plate across (~12 frames) while the carried tab painted nothing -- and
   sub-0.5px moves fed the spring-preservation guard, holding the hole open
   for slow drags. EDSHAPE sync() now forces animate=false (and bypasses
   the guard) whenever the strip contains `.tab.dragging` -- per the
   reference canon, drag is 1:1 with NO independent easing. Verified: 0.00px
   worst plate-vs-tab lag over 2,615 samples of a deliberately slow drag;
   selection springs still travel (18 intermediates). Glass themes gain a
   drag-scoped frost (`opacity: .92` on the plate while dragging): faint
   unreadable ghost, steady state fully opaque, no backdrop blur (T16 count
   pin stays 134; a comment mentioning the property name by its literal
   spelling tripped the pin once during this wave -- the count is a raw
   substring count, comments included).
4. **Real home scroll kill.** Wave-7's `overflow-x: clip; overflow-y: auto`
   COMPUTES to hidden (CSS Overflow 3 s3.1) -- hosts stayed scroll
   containers. Wave 8 removes the overflow at its three sources instead:
   (a) empty docks get `padding: 0` (the pm6-bottom-scroll stamp's 4px
   floored a 0px grid track at 8px); (b) PM_EDGE layoutBands hides all four
   frost bands for zero-extent scrollports (the empty right dock parked a
   30px band past the grid edge); (c) home_main joins the row docks in
   suppressing the LAST visible sibling's divider -- it was pairless
   (beginResize found no partner; diluted single-basis fallback) and its
   16x56 grab-glow overhung the host by ~11px. Belt: `overflow: clip` BOTH
   axes on #pm-home-workspace, .pm-home-host-grid and
   #panel-dashboard.pm-home-owned (real clip -- both axes -- destroys the
   scroll containers). Scrollbars: the wave-7 scrollbar-color line (which
   defeated the opt-in list's transparent idle ink) is gone, and hosts get
   ID-anchored `scrollbar-width: none` + zero-width webkit bars (beats the
   10px pm6-bottom-scroll opt-in by specificity on every engine; on Safari
   16/17 only the webkit rules matter). Deliberate exception, documented in
   the media block: below 1320px home_main returns to `overflow-x: auto` so
   the min-width floors trade crush for (invisible-bar) scroll instead of
   stranding content. Verified: zero scrollable overflow on every home box,
   programmatic scrollLeft pinned at 0, wheel storms move nothing, dead-dock
   bands display:none, home_main resizers == visible-1.

Artifact 3,619,880 bytes sha256
`213a3ee9946d58ea17c0aa9b824a5c8d496db1fe8484a77444ea41c5797d0b63`;
base `3d82a850dad0e412e3abafe1b3f0717e34071425152efd93d3c49fa6e85408c3`;
receipt `8da264423e5d95b389c92c184f8ef8d398e93d43997dee9d90e6286978ab5963`.

## Previous Home Workspace implementation — 2026-08-14 (rev 20, Wave 7: kebab seats, single chat menu, opaque drag plate, home scroll lock)

Four watched-and-verified polish items on the rev-19 build:

1. **Per-kind kebab seats.** The surface kebab kept its wave-3 geometry
   (top 20px) after the strip-height reduction and sat below both header
   lines. Per-kind offsets in the T20 style: editor surfaces `top: 10px`
   (centred against the 35px strip), dashboard `top: 5px; right: 13px`
   against its 31px header -- the extra right shift clears the grip's
   clip-path hit triangle (the grip steals grip-local x >= y in its 18x18
   corner box, so a kebab raised into that band must slide left of the
   diagonal). `.pm6-dash-actions` margin-right 34px keeps Add-widget clear.
   NOTE: the selector must be `data-pm-home-kind="editor_panel"` -- the
   first cut used `"editor"` and silently matched nothing.
2. **Chat has ONE options menu again.** attachSurfaceControls now skips
   (and removes, on re-render) the T20 kebab for chat surfaces: the base
   chat header menu is the single "more options" (Duplicate thread /
   Archive thread / Pop out window / Close chat -- richer than the kebab's
   row set). Pop Out verified still routing through the T20 guard: chat
   lands in the float host, `#floatingChat` never displays, exactly one
   chat in the DOM. The only kebab-exclusive row lost is Dock Back while
   floating; grip-dragging into a host covers it.
3. **Dragged tabs cover what they pass.** Under `.ed-shape-on` the tabs
   paint no background -- the only opaque surface is the travelling
   silhouette, which sat at z 0 UNDER every label (z 1), so a passed tab's
   text showed through the carried tab. While a drag is live
   (`:has(.tab.dragging)`) the shape lifts to z 39 -- above neighbour
   labels, below the carried label (z 40) -- and `.tab.dragging` goes to
   opacity 1: the fused plate genuinely occludes crossed tabs (watched at
   3x: the neighbour's label emerges only past the plate edge).
4. **Home screen scroll lock.** The silhouette's flare box overhangs pane
   edges ~12px, which under the hosts' `overflow: auto` made every host a
   wheel target: sideways wheel shifted the whole workspace and scrollbars
   could paint. Hosts are now `overflow-x: clip` + `overflow-y: auto` +
   `overscroll-behavior: none`. CASCADE LESSON: the single-class
   `.pm-home-host` rule silently LOST -- the scroll-frost enrolment stamps
   `pm6-bottom-scroll` on every host at runtime and that base
   `overflow: auto` rule sits later in the assembled cascade; the shipping
   rule is `.pm-home-host[data-pm-home-host]` (0,2,0). Wheel probe after:
   zero scrollLeft drift anywhere in the workspace, zero scrollbar
   gutters, vertical scrolling intact.

Artifact 3,612,010 bytes sha256
`8ab406695b40014e575e6d55f4048063931689528ab497f750deae11b86a5e7e`;
base `33d5ed89d02327f37d566639bda39a8f97a5a586c5b3404373d2dfddac9cfb30`;
receipt `92f0ef8ce57336418cbc33ee73cebff73d3d30cbb1bdae8fdeb964efd4b0b588`.

## Previous Home Workspace implementation — 2026-08-14 (rev 19, Wave 6: bezier silhouette + retro bake-off)

The silhouette is now ONE JS-composed `clip-path: path(...)` per frame
(EDSHAPE.edShapePath): superellipse-approximating crown cubics whose handle
length morphs with each side's progress, descending through an ogee --
concave flare (shoulder token x p) blending into a convex neck foot (canvas
token x p) landing tangent on the canvas line. Safari and Chromium render
the SAME soft character; border-radius, corner-shape, and the masked
shoulder pseudos are gone. Derived from all FIVE reference clips (three
Grajeda iterations incl. the original explainer/demo pair, plus
doriancottin's cubic-bezier iteration). Base repinned
(`BASE_SHA` = `23ca64d374dfa88227e4fe62ec9a37296356a8b220c09d3baf16425151b81fd0`); artifact 3,611,620 bytes, sha256
`89e287e86693fb8f624f8aa104f491c442f390407a965d8479e8cb0d2d362a3d`; build report `f5abaf0bc48ea90d984ba2e84394c15b9a1b803c070ec2b0c6c6d0367cb035dd`.

**Second same-day follow-up (user feedback):** ogee bow direction corrected
-- long handles at the fixed ends with short handles at the inflection, so
the curve tucks INTO the wall and spills DOWN onto the canvas (the
symmetric handles bowed outward-up near the wall). Retro tune: phosphor
slowed further (dither 240ms, afterglow 650ms), the CRT outgoing
collapse-to-line removed (it read as the old tab blacking out), and the
DOS block caret removed.

**Third same-day follow-up (user feedback + decision):** the tab-side
silhouette is now the reference-exact SINGLE CONCAVE QUARTER-ARC (vertical
tangent at the wall, horizontal on the canvas line, kappa cubic, radius =
shoulder token x progress) -- the two ogee attempts (convex foot under the
cutout) are retired; the convex canvas radius belongs to the strip-end
caps alone, exactly the explainer HUD model. And the retro bake-off is
RESOLVED: all three concepts ship, rotating per selection click and per
reorder gesture via a shuffle bag (no immediate repeats) -- pane gates
removed, effects now cover all editor strips AND the dashboard strip in
retro themes; steady state hands back to the standard retro ring
(phosphor gained a solid-hold fade, CRT a scanline-hold fade). Artifact
3608004 bytes sha256 `bc39c5ff793ed403ab72aba7bde1b3bf0c6750b45ce2d25139d1ff0423773b28`;
base `6d508b573d4c9290b1711daaf48ed95f4791f7b2256e08e172002dc9bacd573d`;
receipt `61726e9cb7eccf996a5af2ecaffd07080526fecc821a782aebacbe5a0a3d1670`.

**Fourth same-day follow-up (user feedback):** the PANEL curves too --
the canvas surface's own top corners now round via real animated
border-radius (calc(--ed-lp/rp x --ed-canvas-rx-max) on .editor-area),
joining the tab's cutout at the edge (flush = both flat = one continuous
surface). The old masked wedge caps painted rail-coloured overlays at the
strip ends and read as nothing at panel scale -- removed. Cutout radii
enlarged for legibility: shoulder 14 default / 16 friendly / 8 retro,
canvas 16 / 18 / 10. Artifact 3606988 bytes sha256
`8c38d9d36e5a86fc68c84e62ec7c10bf0040b29f2e2ab0df85ac2c18549de6a8`;
base `b00382808440ecfee46a8ccddabc171cf0d74145784a64d185b55c062701ea77`;
receipt `bc1d584e0b93adbaba3555636560def63e59d07db61521c79778272b0ac43db3`.

**Fifth same-day follow-up (user feedback):** the canvas-corner notch now
REVEALS a visibly darker backdrop -- the shape-on editor pane's background
is --ed-cap-bg (the rail-over-canvas composite), because a rounded corner
that exposes a same-tone backdrop reads as no corner at all. Strips
shortened: editor 40 -> 35px, dashboard 36 -> 31px (tokens
--ed-strip-h / --pm6-editor-tabs-h / --pm6-dash-head-h; T20 resizer-col
top 44 -> 39). Dashboard tabs confirmed in the retro rotation (they were
already wired; verified live). Artifact 3607387 bytes sha256
`6310699c962ccd9a221634a21e8c393de5175ab284d3764f3b7d312d0c6a77ad`;
base `0d2b3b5d62ad5e68635ff041244665eb5b6aaf3efc4c0d50d11744892d12294d`;
receipt `565d0c4d578bf7c51aa30a7647c907589411c03b909465f785ea67feb22d929b`.

**Sixth same-day follow-up (user feedback, watched properly this time):**
two real defects found by actually watching. (1) The canvas corner
border-radius rounded a corner HIDDEN under the translucent rail (the
canvas slides beneath the strip for scroll-frost, so its true box corner
is invisible) -- the masked wedge caps are RESTORED as the only
frost-preserving way to curve the VISIBLE emergence line, now filled with
the solid rail tone (real contrast) at 18/20px x 16px; the area
border-radius is removed. (2) Dashboard retro effects were dead because
the pill neutralization's !important beats CSS animations (the DOS blink
showed as an empty box: its non-important color applied while its
background lost) -- effect-classed tabs now escape the important rule via
:not([class*=pm-retro]) and get a normal-weight twin, so the fills paint.
Artifact 3608918 bytes sha256
`cea1f664bedf554f73c6bccaf98fa1320fa294570c6e0543e61a8ca1bdc3aaa2`;
base `3d1c8b814a7b9dd9704930786ef83868076aaec7d97360c4124ae3e5ff043cd4`;
receipt `db40c1d05fa6e1813294362ee2e710c6c8b2cc254ddc4f817b6e136802dd21d7`.

**Seventh same-day follow-up (user feedback):** the dashboard CRT fill was
still dead after the important-exemption -- a SPECIFICITY TIE (0,5,0)
between the effect rules and the normal-weight neutralization twin, which
sits later in the assembled cascade and won the tie for plain background
declarations (phosphor survived only via its keyframes). All fourteen
retro effect selectors now carry .ed-shape-on (0,6,0) and outrank the
twin. Watched verification: phosphor block, DOS full inversion, and the
CRT scanline wipe all paint on dashboard tabs.
Artifact 3609086 bytes sha256
`074b4460be4c41327bca04760dee94a85665c8512fc2487bcdfc6bbefb356024`;
base `56ce4721bc745bc996ccd696875e2501c2a90bcd7244e4310991b13d46698159`;
receipt `28ba8acb300b1f9a45cb4e347f651ee98ec7730bdb0652fab5a59946256ddec2`.

**Same-day follow-up (user feedback):** the first ogee cut had two real
geometry defects -- no height clamp (the wall segment inverted when flare +
neck exceeded the room below the crown: the reported "hump") and handle
lengths scaled to the theme token instead of the segment (control polygons
doubled back on short chords). The ogee now clamps to fit, puts the
inflection at the natural corner meet (L-flare, H-neck), and sizes handles
at 0.55 x their own radius. Also: retro themes SNAP the silhouette between
tabs (no spring slide -- the bake-off flourishes are the motion there), and
all three bake-off concepts run ~2.3x slower so they read at real frame
rates (phosphor dither 160ms + 450ms afterglow; CRT wipe 300ms/6 steps,
collapse 220ms; DOS blink 600ms, caret 1.8s).

Fixes in this wave (all live-reproduced first):
1. **Asymmetric morph**: target() no longer measures against the first/last
   laid tab's painted rects (dragging the DOM-first tab right froze lp at 0,
   then popped 0->1 on re-slot; FLIP transforms wobbled the track). The new
   contact model matches the explainer canon: per-side gap to the NEAREST
   contact -- static strip content box or the adjacent tab's LAYOUT edge
   (offsetLeft: transform-free) -- while the caps key off the box edges.
   MORPH window restored to the canonical 20px; radii ratio to 10:8
   (canvas:shoulder) per theme.
2. **Glass/basic morph invisible**: the crown radius never animated (static
   border-radius) and glass-dark's rail composited to ~1 sRGB level of its
   plate. The path IS the morph now (visible in every theme), and glass-dark
   deepens `--ed-rail-solid` (measured 16-level channel delta after).
3. **Glass bevel desync**: the 3-edge inset box-shadow (padding-box,
   progress-blind, lines through the shoulder joint) is replaced by a 1px
   `--glass-edge` crown strip clipped by the same path -- the sheen follows
   the morph exactly.
4. **Retro tab-motion bake-off** (user to pick a winner): retro themes only,
   pane-gated via `data-retro-motion` -- pane 1 "phosphor" (block highlight
   materializes in 2 dithered steps + decaying afterglow; 8px-quantized
   drag), pane 2 "crt" (scanline wipe-in, collapse-to-line out, drop roll),
   pane 3 "dos" (double inversion blink + block caret; dashed drag
   wireframe; quantized). Panel 3 is T20-generated and lazily stamped on
   first retro click. Pane 4 + dashboard strip = control.
   Reduced-motion drops all of it; EDSHAPE untouched by the effects layer.

Verified: morph symmetric in both directions from both end tabs (8-9
distinct progress values, max jump 0.2), fusion lag 0px in 100% of drag
samples, glass-dark contrast 16 levels, selection travel 19 intermediates
zero overshoot, matrix 32/32 + 72/72 (see also the per-theme sweep and
bake-off film strips in the session evidence).

## Previous Home Workspace implementation — 2026-08-14 (rev 18, Wave 5: reference fusion)

Recalibrated against Kevin Grajeda's actual reference clips (downloaded and
studied frame-by-frame at 60fps -- both posts, the newest iteration being
canonical). The defining property of the reference is that tab and canvas
are ONE fused surface that never separates during ANY gesture. Base repinned
(`BASE_SHA` = `cfa539dcd039972a9d4dc1f2b6ff8feea7be16dae90c3a0c0684404637022d63`); artifact 3,589,786 bytes, sha256
`37389e854c7facfcff52d08703172b35426d54ca0d8bf5ec1a95eb1c0acad55a`; build report `57cd04dad1596cd46f6b87828fed72ad541c4cdf16da5e3fbcdb3b8bf2e92d94`.

**Measured physics (per-frame icon tracking of the reference at 60fps):**
the released tab returns to its slot in ~150ms as a ~65%-per-frame
exponential decay with ZERO overshoot; the displaced neighbour stays put
(occluded under the riding tab) until the crossing, then slides ~250ms with
a fast-start ease-out; tracking is strictly 1:1 with the pointer and the
dragged tab rides ABOVE its neighbours. Applied: settle -> 160ms
`cubic-bezier(.17,.84,.29,.99)` (was an overshooting 200ms bounce),
neighbour FLIP -> 250ms, EDSHAPE DAMP 42 -> 46 (critically damped).
Verified in-build: settle decays 56 -> 31.6 -> 5.5 -> 0.3 -> 0 with zero
overshoot and 0px shape lag through the whole settle.

Three deltas closed, each measured before/after with a per-frame
shape-vs-tab lag probe:
1. **Activate on grab** (part 25): grabbing ANY tab makes it live at the 4px
   drag threshold; EDSHAPE's lastActive change turns the next sync into a
   spring, so the connected surface RUSHES to your hand (~12 frames), then
   snap-follows the painted box at 0px lag for the whole glide (was: shape
   parked on the old active tab, median 69px behind). Content render stays
   deferred to release; a cancelled gesture re-renders so class and content
   agree.
2. **The silhouette rides the settle** (part 25): a per-frame snap-sync rAF
   loop replaces the free-running settle spring, which diverged from the
   tab's own 200ms bounce by up to 79px mid-flight. Tab and canvas now
   arrive as one shape (0px lag through grab, ride, and settle).
3. **Corner character** (10x + 29x): MORPH 20 -> 26 (softer approach), and a
   Chromium-only progressive layer morphs the crown corners' SHAPE with the
   same edge-distance progress that drives the radii:
   `corner-top-left/right-shape: superellipse(calc(1 + 0.6 * var(--ed-lp/rp)))`
   -- plain arc at contact, full squircle in the open, exactly the newest
   reference iteration (superellipse 1.0 -> 1.6 by % distance). Static
   squircle remains the fallback; Safari keeps elliptical arcs.

## Previous Home Workspace implementation — 2026-08-13 (rev 17, Wave 4)

Three user-reported defects, each live-reproduced before the fix and
re-verified after. Base repinned
(`BASE_SHA` = `77fadeea6bff73649c8f4c58ffe7e28044401afd4a511b3ce78d5d8a450384dd`); artifact 3,586,691 bytes, sha256
`f8aacc9f6580055855c44e4a03634feaa7310c309c0dbb385015cbd5bec71c6d`; build report `ca3ec50962c92738a439309613078dcce1f1a0d7335224ed0f3cbfb5cd0beff0`.

**Split Pane flipped the center editor to the browser (T20):** clicking the
base browser tab commits `domain_ref.browser_active=true`, but clicking a
file tab only cleared the RUNTIME projection pointer -- and
`restoreOwnerRefs` runs on EVERY commit, so the next commit (the split)
resurrected the browser from the stale flag, without moving the tab
highlight (`mountActiveBrowser` bypasses the base strip manager).
`deactivateBrowserProjection()` now clears the committed flag from both the
code-tab click path and `renderFileIntoPanel`; `mountActiveBrowser` enforces
a single-active tab and un-hides a chip-collapsed browser tab when it
legitimately mounts.

**Violent shake dragging into the bottom terminal (T20):** a hit-test
starvation loop -- adopting the dock opened its track, the FLIP-marked
terminal and drop-active dock were both SKIPPED by the elementsFromPoint
walk, resolution fell through to home_main, the track collapsed, re-exposing
the terminal, re-adopting at a 4-6 frame period with 120px boundary jumps.
Frame-count hysteresis cannot damp geometry that is stable for >2 frames per
state. `dropHostAt` no longer reads painted geometry AT ALL: `buildDockLatch`
freezes per-dock entry/exit bands at pickup (entry = committed rect union
the 28px edge strip; exit = the anticipated opened track + 44px slack), and
everything outside the bands is home_main by construction. Measured after:
exactly 1 host transition + 1 track opening per approach, drop lands.

**Reorder animations invisible (base part 25):** three WebKit killers --
sparse dragover cadence, the native opaque drag snapshot riding the cursor
(an opacity:0 custom drag image is "not renderable" to Safari), and macOS
reduce-motion gating -- plus one self-inflicted: re-slotting the captured
tab is a DOM remove+insert, which releases pointer capture; a tab-scoped
lostpointercapture cancelled the gesture on the FIRST re-slot (the exact
trap the workspace grip comments document). Reorder is now pointer-capture
(HTML5 DnD retired): gesture-scoped WINDOW listeners (T07 pin untouched),
4px threshold, unclamped 1:1 translateX glide with soft rubber-band at the
strip edges, cached transform-free midpoint re-slotting, neighbor FLIP 220ms
`cubic-bezier(.22,1,.36,1)`, 200ms low-bounce settle on release, and the
model re-render deferred to settle-end so it cannot tear the animating tab
out of the DOM. `.tab.dragging` rides at .92 opacity, z 40. The silhouette
snap-syncs per move and springs to the final slot on release.

## Previous Home Workspace implementation — 2026-08-13 (rev 16, Tweak Wave 3)

Thirteen fixes, every one live-confirmed before and after, plus a two-fix
follow-up (below). Base repinned
(`BASE_SHA` = `5142446d25336588d09c9641e3ef638c64f23490d44937e1b181e4ccab1341d4`); artifact 3,578,248 bytes, sha256
`aacbaaf1e56b5b9a1981e94a224cd7caea3fea386e1fd217fdd409adb465cc59`; build report `4e96ab9286b3d0e1c24934e78e6fa6ca0de7ddce471bd42e76b93596dcdfad51`.

**Follow-up (same day):** the first fitter cut used
`scrollWidth > clientWidth - paddingRight`, which is ALWAYS true for a
non-overflowing strip (scrollWidth === clientWidth by definition), so every
tab collapsed into the chip. All three fitters now call
`edStripContentOverflows()` -- the rightmost in-flow child edge (skipping
the actions cluster, the silhouette shape, and display:none children)
measured against the content-box limit minus the padding-right reserve.
And `restoreOwnerRefs` gained an any-live-workgroup pass: when NO terminal
section holds a live workgroup id (a persisted-null layout), section 1
reseeds from `PRISTINE_TERMINAL_SECTION` and the persisted domain_ref CSVs
are healed in the same commit.

**Base:** overflow chip pinned immediately left of the actions cluster via a
positional re-seat guard in every fitter (zero mutations in steady state --
no observer ping-pong) and a per-strip childList MutationObserver closes the
add-path refit hole (the strip's border box never changes when tabs overflow,
so the ResizeObserver alone was blind). Tab drag-reorder ANIMATED inside the
existing HTML5 DnD: transparent 1x1 drag image, dragged tab at 0.4 opacity
tracking the pointer via clamped translateX (layout stays at the insertion
slot so midpoint math and the silhouette snap stay truthful), neighbors FLIP
140ms with transform-inclusive capture (interrupt-safe), reduced-motion
instant. Actions reserve = distance from cluster left edge to strip right
edge + 8 (covers the pinned offset; kills chip underlap). Minimap fixed by
ONE property: padding-top -> margin-top (the border box becomes the visible
band, so both offsetHeight-based JS implementations became correct with zero
JS edits); native code-pane scrollbars fully suppressed (removed from the
02 opt-in lists). Theme tokens: retro hard lime-mixed outline + square
inactive rings, basic 2px accent-blue crown + 9px radius, glass 3-edge
bevel + rail alpha 84.

**T20:** terminal empty-note truth-gated (`data-pm-term-empty` attribute +
`restoreOwnerRefs` repairs paneless pristine workgroup refs instead of
dropping the section record -- the note could previously appear after
collapse/expand because a stale div was only removed in the has-workgroup
branch). Kebab redesigned: vertical dots, 16x20, absolutely positioned at
the surface's right edge below the grip -- uniform across all surfaces,
which also removed the mystery "..." strip at the terminal's bottom edge
(it was this very kebab falling through the optionsHost selector list to
`element.appendChild`, i.e. the last flex child of #bottomPanel). Vertical
padding split into `--pm-home-pad-y`/`--pm-home-gap-y` (2px) with 4px sides.
Drag robustness: FLIPping surfaces carry `data-pm-home-flip` and are skipped
by dropHostAt's surface-hit branch (inline transform is EMPTY mid-flight, so
a style check cannot detect FLIP), 2-frame target hysteresis, auto-scroll
re-applies only on real movement; placeholder previews the dragged surface's
PROPORTIONAL projected width (verified 290 preview vs 289 landed); T20 move
and workgroup gestures now set `body.pm-resizing` and fire `PM_DRAGEND` so
PM_EDGE parks its blur bands during drags.


**User-reported follow-up (same wave):** (1) Safari cancels HTML5 drags whose
drag-image node is detached -- the transparent ghost canvas is now appended
off-screen, plus a `-webkit-user-drag: element` hint on armed tabs; (2) the
paneless-workgroup repair generalized: ANY live workgroup ref with an empty
pane CSV reconstitutes a minimal pane (tp-repair-N) instead of nulling --
corrupted persisted layouts never show the empty block over a live terminal;
(3) the overflow fitters now fit against the CONTENT box (clientWidth
includes the padding reserve, so the chip could legally rest inside the
kebab lane without registering as overflow) and the reserve floors at 44px;
(4) retro's hard outline moved from the travelling shape to the ACTIVE tab
(3-edge inset ring, snaps on arrival) -- a bordered shape sliding through
the inter-tab gaps read as a stray bright bar mid-spring.

## Previous implementation — 2026-08-13 (rev 15, Tweak Wave 2)

Sixteen user-reported tweaks, every one reproduced live before implementation
and re-verified live after. Base repinned (`BASE_SHA` = `b15eb20f9e4176ea7f40be24c651db85f4d57dfeb8dd1ce6a1b67ac3764aebd4`,
byte-identical to `Concepts/PMConcept6.html`); artifact 3,552,293 bytes,
sha256 `393b1016ca980b6f8f16eb38441fdbe885df2db8b2a1433e712f3bb4953c8f08`; build report sha256 `7288ce758395f810675c30022abedbb8d9c1d5c94e933570ed840818a0187c3b`.

**Base wave:** pane close X removed (the kebab's model-aware Close Panel is
the single close affordance); app status bar removed (frozen `.pm6-status-*`
dead-list selectors preserved for T01); search input ellipsizes; silhouette
REDESIGNED — 40px strip (36px dashboard), near-full-height tab, 13px squircle
crown, 12px shoulders, JS writes contact PROGRESS (`--ed-lp/--ed-rp`) and CSS
derives radii per theme (friendly 16px mint / glass 14px plate + edge
highlight / retro 6px + lime), corner caps render the canvas-corner morph at
the VISIBLE rail boundary, tabs flush at the panel's left edge; the DASHBOARD
tab strip adopted the same system (EDSHAPE enrolls `.dashboard-tabs`; part 25's
inline tab styling removed — inline styles beat every stylesheet); editor
scrollbar excluded from the frosted band via scrollbar-track margin; actions
cluster truly centred (the silhouette z-rule no longer flips it to
`position: relative`, which turned `top: 50% + translateY(-50%)` into a +9px
shove).

**T20 wave:** kebab menus lose the Placement hint; grip is a small LINES-ONLY
glyph at each surface's top-RIGHT corner (18px hit triangle, z 140, in-glyph
focus ring); dock_right spans the full workspace height (chat full-height);
row docks gained pair-width dividers AND a full-width track handle driving a
new persisted `size.cross_basis_px` (HOST-MAX semantics: the track write
fans out to every visible surface in the host, and the gesture starts from
the host max, or a taller sibling pins the track and the drag looks dead);
Collapse/Expand Bottom Terminal toggles with a runtime relabel (authored
markup label unchanged for the build gate); panels 3/4 render real buffers
(post-mount hydration — the old seed rendered against a DETACHED shell and
was memoised blank; panel 4 seeds `src/routes/auth.rs`); spacing 4px + no
page gutter under Home; New Section reseeds the vacated source section in
the same commit (both sections usable) and reset reconstitutes a live
workgroup; drag previews project the TARGET geometry (fair share of the
destination host; full width + track for docks).

**Post-inspection integration fixes (the re-verification pass caught both):**
(1) the dock track write initially only touched the dragged surface while
`syncHostGeometry` takes max() over the host — a taller sibling pinned the
track; (2) moving the grip to the panel's top corner put POINTERDOWN inside
the workspace's 28px top edge band, so pickup itself opened a dock preview
whose full-width expansion then captured every later `elementsFromPoint`
hit-test (self-sustaining preview). Fixed with a pickup-rect guard (pointer
inside the source rect resolves to the source placement) and by excluding
drop-active hosts from the bare-host fallback. Lesson: any preview that
EXPANDS geometry must never participate in its own target resolution. A second
harness cycle added (W2-D6) the floating corner handle seeded its width from
the stale docked basis_px instead of floating_bounds.width (a shrink drag
grew the float), and (W2-D7) `contain: layout paint` + the 20px chat radius
clipped the top-right grip out of hit-testing -- fixed by seeding from the
live float width and notching only that corner to var(--radius-sm).

## Previous implementation — 2026-08-13 (rev 14, Workspace Repair + Tab Morph)

Assemble-then-repin wave plus a T20 movement/resize overhaul. Base re-pinned:
`BASE_SHA` = `7f0ff4e5e9a7a54928ef7aaeb48e9d13f096c315e2bd12702f64a04ed89e6f25`
(byte-identical to `Concepts/PMConcept6.html`). The generated artifact measures
3,537,228 bytes with sha256
`92e3da8cd1f5561b07c3f1b4a443e71f3007667b2b80be37fba3b33f845051ec`; the
checked-in build report sha256 is
`804ee7940b3861d070a0bf10f997c0a564ae5358590ee1887ce68d3da0b16b5a`.

**Base wave (parts):** notification stack re-centered BETWEEN page tabs and
search (two auto margins on `.notify-slot`; deliberate revert of the rev-13
right-cluster placement — the density engine now counts the search wrap's
padding and every child's non-auto margins). Tab drag-reorder persists on all
four panes (pane 1 via `S.files.openTabs`; panes 2-4 via strip-owned order
lists that every fitter reasserts, mirrored to the overlay's `buffer_ids`
through a `pm6:ed-tab-order` CustomEvent). Overflow chip + menu joined the
portal-menu family (values-only restyle; sprout-in via double-rAF `.is-open`).
EDSHAPE lifecycle rehardened: chrome only after a successful measure, the
shape layer mounts as the strip's LAST child, `paint()` refuses degenerate
widths, and the three fitters are mutation-free in steady state (chip reused
via display toggles; label writes guarded) — this also broke the fitter/
chromeWatch childList observer ping-pong. Scroll-under frost restored:
`--ed-rail-bg` split into opaque `--ed-rail-solid` + a 72%-alpha plate the
part-06 backdrop blur shows through; the silhouette shoulders became MASKED
cutouts (radial-gradient mask, `rgb(0,0,0)` stops — check_css bans raw hex)
so the frosted rail shows through the concave curve; active tab + canvas keep
the shared opaque fill.

**T20 wave:** drag rebuilt — change-gated preview (draft/registry/FLIP run only
when the resolved (host, slot) target changes; per-event work is clone-follow
only, coalesced to one hit-test per rAF), transform-subtracted `layoutRect`
midlines (a mid-FLIP `getBoundingClientRect` flapped the resolved index every
frame — the "placeholder never follows the pointer" defect), placeholder
carries the PICKUP-TIME footprint and a flex `order` matching its slot
(surfaces render by `order: slot_index`, so DOM position alone places
nothing), empty dock targets open their grid track to the incoming footprint,
window-exit no longer floats (floating is explicit-only: Pop Out rows on
editor panels/chat/dashboard, keyboard F; boot demotes persisted floats to
`last_docked_host` with a `storage.boot_demote_floating` receipt). Resize
rebuilt — home_main dividers do adjacent-PAIR px transfer with every sibling's
basis frozen to measured px at gesture start (the single-basis write was
diluted across every sibling's flex-grow: a 200px drag moved ~133px and
dragged the far dashboard along), effective minimums degrade to the host's
fair share, commit passes `skip_render` (no settle flash), floating surfaces
gained a bottom-right both-axis corner handle, dock bands unified in
`HOST_BANDS`. No-dead-space invariant: `normalizeMainRowBases` re-sums visible
bases to the host width at render/boot/window-resize, and any stray drop
placeholder outside a gesture is swept at render (a stranded one was an
unclaimable void — the user's Safari screenshot). Grip is now a 28px
folded-corner TRIANGLE filling each surface's top-left corner (clip-path
hit-testing lets the empty half fall through; in-glyph focus ring because
outlines are clipped; mounted on the SURFACE, not any head row — the base
comment about slot 0 of `.editor-tabs` belonging to the grip is now moot, the
strip's slot 0 is simply its first tab). The base chat overlay/detached modes
are retired via a T20-anchored guard on `applyLayout` (anchor
`    LAYOUT = mode;`): all non-docked chat routes to
`PM_HOME_WORKSPACE.popOutChat()` — in-canvas float, no scrim, no two-chat
desync. Top-bar menu gained row 4, `Reset Layout` (dual-surface with the
Settings row; both commit `cmd.workspace_layout.reset`; the top-bar row also
hides `#floatingChat` and reloads after a fade — PM_DEMO keeps no persistent
state, so reload is the only honest demo reset). Boot renders once (250ms/1s
catch-ups deleted; chromeWatch owns late PM6 rebuilds). Motion: staggered
16ms FLIP reflow wave, pickup lift + shadow bloom, low-bounce drop settle
with clone pre-seating (element seated at the placeholder before commit so
the post-commit render is geometrically idempotent), corner-origin float
sprout, pre-reload reset fade; all `reducedMotion()`-gated.

**Post-verification fix round (same wave):** the adversarial harness run
caught four defects the hands-on pass missed, all fixed and re-shipped:
(D1) the fitter's second scheduled pass landed a snap-sync after `lastActive`
was consumed and CANCELLED the in-flight selection spring one frame in — the
snap branch now preserves a spring whose target box is unchanged (<0.5px);
(D2) the full-cover float layer sat in every `elementsFromPoint` stack, so a
drop into an inter-surface gap — or onto the previewed slot itself — resolved
to `floating` and silently undocked; `dropHostAt` now skips the floating host
entirely; (D3) host caps were pointer-only — the keyboard step now announces
"<dock> is full." and stays, and `normalizeLayout` spills beyond-cap surfaces
to `home_main` (`host_capacity_spill:<id>` warning); (D4) a dock's full-width
row resize handle covered the grip corner — grip z-index raised to 110 (the
triangle clip returns everything right of the hypotenuse to the handle). Also
`applySurfaceFlex` floors at 80px instead of re-clamping to 220 — minimum
POLICY lives in the resize/normalize layers (fair-share degradation), and the
two systems used to disagree. A second verification cycle then caught (D5):
a pointer drag begun on a FOCUSED grip cancelled instantly — hiding the
dragged surface blurs the grip, and the init-time capture-phase window blur
listener treated that element blur as a window blur; it now returns early
unless `event.target === window`. Final verification: 27/27 matrix checks,
72/72 captures, frame-step spring 3/3 themes (first-step ratio 0.144,
26-28 moving frames, keyboard identical, reduced-motion snaps), pixel-sample
24/24 join crops seam-free, scroll-under 8/8 themes.

**Measurement notes (rev 14):** the placeholder-order defect was invisible to
DOM-position assertions — the draft, DOM index, and commit were all correct
while the RENDERED position was wrong (flex `order` overrides DOM order).
Assert rendered geometry, never insertion index. And when probing the spring,
sample the inline var each rAF and compare consecutive values — a filtered
probe that dropped equal frames misread a healthy 14-frame spring as a
one-frame teleport.

## Previous implementation — 2026-08-12 (rev 13, Direct-Manipulation repair)

The active lineage is the assertion-guarded `T20_home_workspace` transform in
`Concepts/pm7-tools/build_pm7.py`, sourced from
`Concepts/pm7-tools/home_workspace_source.py`, over a base re-pinned from the
`Concepts/pm6-build` parts pipeline. `BASE_SHA` (and the raw base sha — they are
the same bytes now) was `45645380dd94a29259961c3ca571f162b4ffc0ca6a4bf0968d68cadc67482401`
(an earlier revision of this entry mis-recorded it as `77192126…`), matching
the then-current `Concepts/PMConcept6.html`.
The generated artifact measures 3,502,307 bytes with sha256
`bf3d5a406853ae3173514ca39e05d3c3399018193338da4161d08f79cefacbc2`.
The checked-in build report sha256 is
`804ee7940b3861d070a0bf10f997c0a564ae5358590ee1887ce68d3da0b16b5a`.
T20 owns the four-panel Home model, six hosts, Pointer Events move/resize
transactions, terminal workgroup identity, project/workspace persistence,
safe recovery, inline-SVG controls, and the web/native floating boundary.
This entry is the current implementation record; the rev 12 and earlier ship
entries below are historical lineage.

**Rev 13 (Jared, 2026-08-12): the Home layer was fighting the shell it sits on.**
Ten reported defects — and the PM6 features behind nine of them were never
missing. The editor tab overflow fitter, tab drag-reorder, the terminal collapse
button and handler, the resizer controller, chat panel CSS and the dashboard
widget engine are all still byte-identical in PM7. **What broke them was the
projection layer on top.** Four mechanisms, worth keeping because they are the
failure modes of any "model-first layer over an existing shell":

1. **It reparented the shell, then overrode its layout wholesale.**
   `mountWorkspace()` moves `#editorPane1/2`, `#dashboardView`, `#bottomPanel` and
   `#chatPanel` into a new host grid, and `.pm-home-surface` then forced
   `flex` / `width` / `height` / `min-*` / `overflow` with `!important` on every one
   of them. That single rule caused four separate reports: chat lost its
   `width: 550px; flex: none`, the dashboard's `@container` scroller lost its
   context, and `overflow: hidden` clipped ~3.5px off every 9px resizer grab strip
   plus its entire grab-glow. Sizing is host-scoped now and the blanket wall is gone.
2. **Flex properties on grid items.** `home_main` was `display: grid` while the
   surfaces sized with `flex: 1 1 var(--pm-home-basis)`. Flex is ignored on grid
   items, so **every resize on the homescreen committed a new basis, bumped the
   layout revision and persisted — while moving zero pixels.** `home_main` is a flex
   row now. And the main-axis size is written INLINE with `important`, because a
   stylesheet rule cannot win here: PM6 blocks that load after `pm6-css-dashboard`
   set `.editor-pane { flex: 1 }`, which flattens the basis to `1 1 0%`. Caught by
   reading computed `flex`, not by reading the model.
3. **It mounted its own controls where the host chrome already was.** The grip was a
   26x7 unlabeled pill at top-CENTRE, appended last, at `z-index: 18` — under chat's
   own `z-index: 25` header. That is the whole of "you can't grab the move button".
   Grips are now the first item of each surface's own head row (top-left, 18x18,
   inline-SVG, grab cursor), and a `MutationObserver` re-seats them, because the chat
   engine rebuilds `#chatPanel` with `innerHTML` and the tab renderers rebuild
   `.editor-tabs` — both destroy anything mounted inside them.
4. **It hijacked shell clicks in the capture phase.** `stopImmediatePropagation()` on
   `#collapseBottom` killed PM6's working handler (so the `.collapsed` class never
   applied) and wrote `aria-expanded` from the PRE-mutation value. The chat toggle had
   the same shape; it reconciles on the bubble phase AFTER PM6's own handler now, so
   the model follows the DOM instead of fighting it.

Also in this rev: the centre-screen drop-target rail is deleted. It was
`inset: 10px; place-content: center; z-index: 50`, so its six buttons sat over the
middle of the canvas and `dropHostAt` checked them FIRST — that is the "it pops up a
window and you select where it goes" report, and it is also why positional drops were
impossible. Movement is u11-prism's vocabulary now: a lifted clone tracking the pointer
1:1, a real in-flow placeholder carrying the surface's footprint, and neighbours
FLIPing from their pre-move rects. **Pointer capture loss is no longer a cancellation
vector** — live reflow re-parents nodes, which drops capture, so the old
`lostpointercapture -> finishDrag(false)` binding would have cancelled every drag on its
first frame. Keyboard movement (Enter to pick up, arrows to move, F to float, Enter to
drop, Escape to cancel, announced through a polite live region) is net-new and
load-bearing, because the per-surface Move/Dock menu rows are retired.

Editor tabs: the `+N more` fitter was hard-coded to `#editorPane1`/`#editorPane2`, so
panels 3/4 never had one, and the strip's right reserve was a hard-coded 28px that the
injected 22px options button overflowed — the chip slid underneath it. The reserve is
measured now and a generic per-strip fitter covers every strip. Tab drag-reorder was a
**one-shot pass over static markup** (a pre-existing PM6 bug PM7 inherited):
`renderEditorTabs()` rebuilds pane 1's tabs with `createElement` and never re-armed
`draggable`, and the drop reordered the DOM only, so the next render snapped it back. It
is delegated now and writes the order back to the model. `Open in Panel` never opened
anything: panels 3/4 got a debug string written into `.editor-code`, and panels 1/2
called `switchEditorPane*Tab`, which only activates an ALREADY-open tab. It routes
through the canonical open path now.

New: the contact-aware active-tab silhouette (F3-505). The active tab and the code canvas
are one surface — same fill, no bottom border, concave shoulders — and the corner geometry
is a pure function of contact, recomputed in the same frame as the position. Only the
horizontal radius animates, so a corner flattens sideways instead of shrinking into a
dimple. The contact reference is the **tab track** (first/last laid-out tab), not the rail
box: the rail's leading grip and trailing actions cluster are chrome the tab cannot travel
across, so measured against the rail box the flush state is unreachable and the morph
never demonstrates.

Two packet lines could not be settled by assertions and needed real measurement,
and both paid for themselves:

- **Frame-stepping caught a teleport.** Recording every rAF tick of a
  click-to-select showed `firstStep == totalTravel` in all four sampled themes:
  the silhouette was jumping the whole distance in one frame. Selecting a tab
  re-renders the strip, and that re-render's own snap-sync landed BEFORE the
  animated one, leaving the spring with nothing left to travel. A selection
  change now always springs; layout-driven syncs (resize, fonts, theme, drag
  frames) still snap. With that fixed: 54-75 frames of travel, worst
  corner-vs-position drift 0.0003px, zero one-frame pops, zero degenerate frames.
- **Pixel-sampling needed three discriminators before it meant anything.** The
  naive "any pixel darker than the rail" test failed on 15 of 24 crops, and every
  one was the measurement, not the UI: tab labels sit flush to the join (the
  strip is bottom-aligned) so glyph ink is inside the band; an ordinary step or
  a shoulder's arc is darker than one side and equal to the other, which is
  correct and not a seam; and retro ships a periodic phosphor grid in BOTH axes
  that repeats every 3 CSS px whether or not there is a join. The test that
  actually means something is: a local minimum (darker than both flanks) that is
  thin (recovers within ~2 CSS px) and unique (a join seam happens once; texture
  repeats). Under that definition all 24 crops -- 8 themes x flush-left,
  interior, flush-right, at 4x device scale -- are clean.

**The lesson worth more than any of the fixes: this harness asserted commands, not
pixels.** `shared_resizers_...` asserted one `resize_surface` command per drag;
`file_manager_open_in_panel_...` asserted a global `window.PM_HOME_LAST_OPEN_FILE`. Both
passed green the entire time resize moved nothing and Open in Panel opened nothing. Every
fixture covering a visible outcome now asserts that outcome — rendered geometry, a rendered
buffer, a transform-free layout position changing mid-drag. **A green harness that cannot
see the screen is worse than no harness, because it converts a regression into a receipt.**

Verification: 58/58 functional checks against the built artifact (all geometry- or
content-based: live neighbour reflow, resize deltas, collapse round-trip, all four
open-in-panel targets, keyboard move across hosts, tab reorder surviving a re-render,
overflow chips in panels 1 and 3, silhouette flush/independent-corner states, widget drag
and grid-snap resize), 4/4 static build gates, PM6 assemble g2 + g3 9/9.

Carry-over: `Concepts/pm6-build/checks/check_js.py` pinned `NODE` to the macOS path
`/usr/local/bin/node`, which failed the JS gate on this machine (and was patched in a
staged copy during rev 8 on Windows for the same reason). It resolves `PM6_NODE` then
`shutil.which("node")` now, falling back to the old literal, so macOS is unaffected.

- Shipped: 2026-08-04 (rev 12, Frost completion). Size 3,325,596 bytes (file sha256 `37daeedf43b2402773128713e120e819e577269c70c63a1a63ece89f7b4c132e`; build-report text sha256 `bf5919b91c9d87ca88b9c2f497c6e936abe8db74ea8aed95aebb23f471393458`). Base pin `27a5d1da059608df2ebd248120f57f616721bca1245fc606f4885b5ac25ff4d2`. Build report: scratch outdir (see rev 11/12 entry).
- Prior ship: 2026-08-04 (rev 10, Frost correction). Size 3,322,368 bytes (file sha256 `c9cb48d208a0d567bc38ee021d6cb94f2fdf9d7d5481326a659924884786be90`; build-report text sha256 `32c496d80e926a1bbbdc81a17c184453437375333233db51336bf903d1a28607`). Base pin `a48440f0cd5888735cf39711aaf1dcbc465530199b46e7a02a4e7ee94522d00d`. Build report: scratch outdir (see rev 10 entry).
- Prior ship: 2026-08-03 (rev 9, Scroll + Density wave). Size 3,311,141 bytes (file sha256 `d25f1f55066a966cda31cea8b3ae45e303224ce70e781ae0591498fa429d482a`; build-report text sha256 `bb21e2c2f501c939c219299b2d06087bcf2e30f9c312860d156fa23efa062098`). Base pin `7d7c528c18f4a4a9f55fe635e51b767ff080d3f2e18c686420e42972afd8f0cc`. Build report: scratch outdir (see rev 9 entry).
- Prior ship: 2026-08-03 (rev 8, Grab-Glow refit). Size 3,248,534 bytes (file sha256 `41d6599be55379d4062bb9f9aca5776c458f1fa464c0c3c8c89004fd7b2b44d5`; build-report text sha256 `7c3d7b3d0c5b5916039da35912580ddf746e43a4ad8d8a2e6a2763248b611c78`). Base pin `44cf6c29e7ff477c8e4788bd9ced5fb0ecd5a3789150bd5425c5dfbb1ae2255a`. Build report: scratch outdir (see rev 8 entry).
- Prior ship: 2026-08-02 (rev 7, Edge-Glow wave). Size 3,250,862 bytes. sha256 `935926338d31b3057f9375a5dbed9bc45299cff68531d854d63fdafab540abce`. Base pin `3a14ff6d86f66584c4543a4cd4acbddff1c562758823877158b7856481c83a56`. Build report: scratch outdir (see rev 7 entry).
- Prior ship: 2026-07-22 (rev 5, worktree click fix). Size 2,614,289 bytes. sha256 `8ea7680f7814165bd1bc2fd0d6e64a814922d14abc41651c3eaed708e87abfba`. Build report: `Concepts/pm7-tools/build_report.json`.
- Prior ships: rev 4 six-workstream lineage rebuild sha256 `bc13e037d3e2d87d402ad50f791e3766cbadb93f82b48521b320e01edc813f08`; rev 3 hand-promotion (backup `PMConcept7.html.bak-pre-pm8-merge`); rev 2 2026-07-16 chat footer float fix sha256 `a6a3cafe93bedf68dd337bee32554035cd9f13fc646573cc9134c5ded5af5c20`.
- Base (rev 5): `Concepts/PMConcept6.html` assembled 2026-07-22 after worktree-sprout wiring in parts 25 + 29x-chat, sha256 `c66f838df3a05f0b43e2f7b31098f56d1406477452fb75f3d7f0f8ae3a25f9ab`. Pinned as `pm7-tools/base/PM7-base.html` (prior pin backed up at `PM7-base.html.bak-pre-wt-fix-*`).
- Rev 2 change (Jared, 2026-07-16): the chat stream footer reserve switched from scrollport shrink (margin-bottom) to a content inset (padding-bottom) in pm6-build parts 09/29x-chat, so the message stream extends behind the floating footer pill and the area around the pill is see-through live stream.
- **Rev 6 (Jared, 2026-08-02):** Motion Wave — expert-level motion overhaul of the activity-bar rail + all nine side panels. Governance: all work in `pm7-tools/base/PM7-base.html` + rebuild (snapshot `PM7-base.html.bak-pre-motion-wave`); BASE_SHA re-pinned each stage, final pin `26fb95105bcbd208a31b92f4e5a71eac4f9a31835ea585a6295e11a0c02a21fa`; 4 build gates green throughout. Workstreams:
  1. Left rail chrome — sliding FLIP hover indicator, drag spring-lag ghost + animated More tray.
  2. Panel lifecycle — enter/exit overshoot/settle + interrupt-safe `PMPANEL` orchestrator; direction-aware pane stagger + per-row cascades; WAAPI ink stretch.
  3. Trees/accordions/disclosures — cascades + chevron overshoot + per-theme `--acc-ease`.
  4. Menus — sprout + context menus unified to one overshoot sprout system (click-point origin, item cascade, animated exits); FLIP reorders; value flashes; chip pops.
  5. Per-theme motion personalities via new tokens `--ease-settle/--ease-pop/--pm-travel/--pm-stagger/--pm-row-step/--ab-hover-scale/--ab-press-scale/--acc-ease` on all 8 theme blocks; full reduced-motion contract on 3 paths.
  Verification: 7 integration agents (prototyped then integrated) + 6 parallel browser batteries + 2 fix waves (FIX1: tray hover fill-mode / `.sh-fp` toast / reason resolver verbatim / pulse reduced-kill; FIX2: `fm-ctx` close-on-pick / data-demo-arg reason / collapse-all label settle / md quick-actions); ~700 checks, evidence in `Concepts/motion-wave/evidence/`.
  Carry-overs (not wave defects): `[data-reduced-motion="1"]` parity gap in legacy dashboard/project entrance kill rules (dashboard scope, filed by V6 R1); glass-theme `fm-ctx` ~6px off cursor (pre-existing backdrop-filter containing-block quirk, menu fully usable); PMConcept8 lockstep note retired (PM8 was a test artifact, per Jared 2026-08-01).
- **Rev 7 (Jared, 2026-08-02):** Edge-Glow wave — five user-requested systems, all routed through parts + base mirror + rebuild (snapshot `PM7-base.html.bak-pre-edge-glow-wave`), assemble g3 green, 4 build gates green:
  1. Resizer overhaul (parts 24/25 + 09/06/03): Pointer Events + `setPointerCapture` (releasing over the editor iframe/canvases no longer strands the drag), delta-based drag math (no grab-jump, zero hysteresis — width is a pure function of pointer position), clamp-to-edge instead of silent no-op guards, container-relative max (the hard 480px cap is gone), drift-free terminal splits (total captured once per drag, 80/40 floors now always satisfiable), dblclick reset on every resizer, 9px centered grab zones + `touch-action: none`.
  2. Diamond grab-glow on all border resizers incl. terminals: rhombus core + radial halo (`clip-path` + gradient, theme-matched via `--accent-primary(-rgb)`), compositor-only opacity/transform, easeOutQuint 220ms in / 150ms out, breathing pulse on hover, scale 1.08 while dragging; reduced-motion = opacity-only, no pulse.
  3. Theme selector (parts 01/05/11/24/29x-panels/29-settings + sidecar): title-bar trigger is a morphing SVG icon — sun (manual light), moon (manual dark), continuous sun-to-moon morph loop (auto). Menu = Light/Dark/Auto segmented control + four family rows (Friendly/Glass/Retro/Basic) with dual swatches; the eight `-dark/-light` entries are gone. State = `pm.themeFamily` + `pm.themeMode` (+ resolved `pm.theme` kept); Auto follows OS `prefers-color-scheme` live via matchMedia; pre-paint boot resolves before first paint (no FOUC, legacy slug migrates). Settings gain `general.visual.theme-mode` (818 settings now). Plans updated + governance-sealed (FinalGUISpec selector contract + ThemePresentationMode, settings_inventory, cmd.theme.set_mode, Wiring_Matrix).
  4. Edge dissolve (10x-global CSS + `window.PM_EDGE` in globals JS): scroll-aware mask ramps (26px vertical / 22px horizontal, residual alpha .14 — slightly softer than the reference) on every enrolled scroller, vertical and horizontal; two-layer backdrop defocus bands on flagship panes; sticky-thead tops and chat-stream top skipped; glass themes get fade-only (one-backdrop budget); single passive capture listener + rAF, no per-scroller timers.
  5. Frosted scroll-under headers: chat (ResizeObserver-measured `--pm-chat-head-h`, overlap cascade, sticky plan-tracker repointed), terminal dock bar, dashboard, wizard thread head, orchestrator inspector/feed heads — `backdrop-filter: blur(11px) saturate(140%)` over a 72% surface plate with hairline; glass themes fall back to a translucent plate (no nested backdrop-filter). Editor tabs are frost-only without overlap (gutter scrollTop-sync + minimap ratio math take correctness over the effect); bottom tabs deliberately skipped (panes swap, nothing scrolls under).
  Mid-wave fix (found in live browser testing): the short-window responsive overrides (`09 bento @media (max-aspect-ratio:4/3),(max-height:800px)`, global range D) used `!important` width/height that silently disabled ALL resizers below 800px viewport height — the original "gets stuck / can't shrink back" root cause on laptops. Resizer writes now use `setProperty(..., 'important')` deltas and one stale `!important` was dropped.
  Verification: harness smoke 0 console errors + 35/35 capture shots clean (upstream harness bug noted: `smoke.mjs` clicks the reload-backed Reset button inside `page.evaluate` — patched copy used, repo script untouched); live Playwright battery covered resizer hysteresis/shrink-back/reset, short-window resizing, release-over-content capture, glow states + retro recolor, auto-mode OS flips, edge class toggles, frost computed values, glass fallbacks. Evidence shots: `Concepts/pm7-verify-shots/`.
  Carry-overs: glass frosted-header plate alpha resolves to ~53% (`--surface` is rgba in glass) — raise the mix if content reads too clear behind it; `smoke.mjs` reload-click bug; T16 backdrop-filter budget assertion re-pinned 27→69 (frost + band layers; glass nested-filter ban still enforced by CSS fallbacks); `pm6-build` working copy re-baselined to `7e5b8e28…` (g0 IDENTICAL).
- **Rev 11/12 (Jared, 2026-08-04):** Frost completion — the scroll-under finished on every surface it was asked for, the edge dissolve pulled off the editor, and one measurement lesson worth more than any of the fixes. assemble g3 9/9, 17/17 transforms, T16 budget re-pinned 131 -> 134.
  1. **THE PIXEL TEST LIED, AND I BELIEVED IT.** I reported the editor scroll-under as broken on a 0.00 pixel delta. The effect was working the whole time; the *sample region* was wrong. `.editor-tabs` has `padding-bottom: 0`, so the strip I sampled (`chrome.bottom - 10`) landed squarely on the **opaque tab pills**, and opaque children never change when content scrolls behind them. The reading was a correct measurement of a meaningless region. **A pixel test is only as good as the region it samples; sampling over opaque children proves nothing.** The harness now computes a plate-only band from the chrome's rect minus its children's rects, and for stacked chrome takes the trailing edge of the *last* row (see item 6). Re-measured honestly, all five surfaces pass — editor 4.71 vs a 48.71 open-content control, rail 4.14 vs 48.77, browser 32.31 vs 36.64, topic map 3.50 vs 41.00, plan preview 13.83 vs 6.54. The same class of error bit three more times this rev (an empty scroller-padding strip, a banner region no content ever passes under, a `.browser-toolbar` row vetoed by one full-height child) — every "0.00" was the sampler, never the CSS.
  2. **Rail scroll-under: measure the gap, not the head.** Rev 10 keyed two `PM_FROST` entries on panel *shape* (banner-only vs banner+segtab). That was still a guess: `#panel-files` stacks four rows (banner, segmented tabs, toolbar, filter) and lifting by the banner height alone buried the tab strip under the scroller, swallowing clicks. `PM_FROST` gained a third mode, `gap: true`, which measures host-top to **the last visible preceding sibling's bottom** — whatever the chrome stack happens to be. One entry now covers all nine panels, and every chrome row is plated so nothing shows through between them. Measured 123px on `#panel-files`.
  3. **The dead box at the bottom of the rail was mine.** Measured against the pre-rev-8 artifact side by side: `deadGap: 0` with 7 panel children there, `deadGap: 30` with 8 here. The extra child was a `.pm-edge-band` computing `position: relative` rather than `absolute` — so it laid out **in flow** at the end of the panel's flex column and ate 30px under `.sh-foot` that would not scroll away. The `.sh-scroll` `bandTargets` entry was removed: the rail's frost is the chrome plate above the scroller, and it never needed a band. Verified 0px gap and 0 in-flow bands across all five panels that have a footer.
  4. **Editor: plate yes, edge dissolve no.** `.editor-code` was enrolled in PM_EDGE on all four sides, which is what produced the left/right/bottom blurs. Removed from the JS `CONFIG.bothAxes`, from its `bandTargets` entry, and from the CSS mask `:is()` mirror — all three lists, or the mask stays. The frosted tab bar is a **separate mechanism** (plate + lift) and is untouched. Verified `enrolled=false`, `mask=none`, zero edge classes, zero bands, tab plate still `blur(11px) saturate(1.4)`.
  5. **Plan preview: a sticky child cannot escape its own card.** The plate was `.pm6-wiz-doc::before` with `position: sticky`, and **sticky is clamped by its containing block** — the card's content box, which starts `var(--xl)` down. That is exactly where the user saw it ("one blur, where the title used to be"), and why content reaching the card's true top never frosted. Moved out of the scroller: `.pm6-wiz-preview` becomes the positioning context and carries an absolutely-positioned `::after` overlay pinned just below the measured column head, with `.pm6-wiz-doc { padding-top: 0 }` so copy reaches the real top edge. Verified `position: absolute`, plate top 29px against a 28px measured head, card `padding-top: 0`.
  6. **Topic-map sliver: a plate and a mask cannot both own an edge.** Rev 10 set `bandTargets` `top: false` on the newly-plated scrollers, which removed the blur band but left the Stage-A **mask** still dissolving that edge — a faded-but-unblurred strip peeking out from under the plate. Any scroller with a plate above it must also be in `PM_EDGE.CONFIG.skipTop`: `.pm6-wiz-doc`, `.pm6-wiz-topic-list`, `.sh-scroll`, `.browser-viewport` (the contract the chat streams already used).
  Verification: 8-theme sweep clean — plates frost on friendly/retro/basic, fall back to opaque with no nested `backdrop-filter` on both glass variants, no editor edge dissolve anywhere, zero sideways page scroll, no rail row clipped. Functional: rail segmented tabs and the file-manager toolbar both hit-test through the lifted scroller, gutter line numbers 0px delta at two scroll positions, context submenus still un-clipped. Corrected pixel test on all five surfaces (numbers at item 1), with the rail exercised at a viewport short enough to actually overflow. Live 60s desktop recording of all five surfaces plus glass: `scratchpad/videos/rev12.mp4`.
  Harness notes worth keeping: gdigrab `-i title=` returns **black** for GPU-composited Chrome, so a window recording has to be a desktop-region grab of a fronted window — and fronting by title substring grabbed the user's own Chrome (they had a tab named "Puppet Master"), so the page stamps a unique `document.title` marker first. The planning-wizard workspace is reachable only through Continue -> Mix both -> **one discovery answer** (the PRD approval is gated on `readiness !== 'blocked'`) -> Approve PRD -> Start discovery -> wait out the timed theater -> `[data-demo-action="wizard.enter_workspace"]`; `scratchpad/wizlib.mjs` encodes it.
  Carry-over: the glass frosted-plate alpha resolves to ~0.53 (0.88 x a translucent `--surface`), which is the app-wide convention for all ~19 plated surfaces, not a frost regression — but with `backdrop-filter: none` under glass the plate is doing the work alone. Raise the mix if it reads too clear.
- **Rev 10 (Jared, 2026-08-04):** Frost correction — rev 9's frosted scroll-under sweep went from 7 sites to 18 and five of those were wrong. Root cause, worth keeping: the pattern was applied everywhere it *structurally* fit (an element sitting above a scroller) rather than everywhere it *visually* belonged. **A caption row and a floating pill both satisfy that structural test and neither is chrome.** assemble g3 9/9, 17/17 transforms, T16 budget re-pinned 127 -> 118.
  1. **Wizard plan preview un-pinned.** `.pm6-wiz-doc-h` had been given `position: sticky` + a plate; the rule was also unscoped, so it pinned the title in the expanded overlay too. Reverted to `static` — the title is part of the document, not chrome above it, and scrolls with the copy it names. The overlay's sticky-offset compensation went with it.
  2. **Topic map plate reverted, then the real bug fixed.** The plate's re-padding was destructive, but removing it was NOT sufficient and the first attempt shipped still broken. `.pm6-wiz-topic-card` is a flex item of a column list and **never set `flex`**, so it defaulted to `flex-shrink: 1`: whenever the cards did not fit, the list squeezed them instead of scrolling, and because the card is `overflow:hidden` around a 2-line `-webkit-line-clamp` subtitle, the clamped line was sliced mid-glyph — which read as a stray rule drawn across the lower half of every box. `flex: none` on the card is the fix. The padding only made a pre-existing bug reachable.
  3. **Source Control / GitHub Actions pills.** Not a rev-9 regression at all: both carried an **inline `style` in the markup** forcing `--text-secondary` on a `--text-primary 10%` wash, which outranks `.sh-bstatus`'s own rule. Verified byte-identical in the pre-rev-8 artifact. Per Jared they should be green like Testing/Agents, so the inline override was removed and the base `--graph-passed` now applies (`#6FDABC` on friendly-dark; a themed green on all 8).
  4. **Browser controls no longer bleed into the dashboard.** `.browser-tab-content` is a direct child of `.editor-pane`, which has **no `overflow: hidden`**, and it set `min-height: 0` but not `min-width: 0` — so it kept `min-width: auto` and held `.browser-toolbar`'s nowrap min-content width, overflowing the pane. `min-width: 0` added there, on `.browser-address-bar` (so the bar absorbs the squeeze) and on `.editor-area`.
  5. **Editor tab frost was invisible for a real reason.** `[data-theme^="friendly"] .editor-tabs { background: transparent }` ships *after* the frost recipe at equal specificity, so it silently cancelled the 72% plate and left a `backdrop-filter` with nothing to tint. Plate restored in the theme rule; the documented no-overlap decision (gutter scrollTop-sync + minimap ratio math) is unchanged.
  6. **Rail frost rolled out** from the `#panel-run` prototype to all 8 (not `#panel-files` — five stacked bars of variable height), with one `PM_FROST` entry whose `:is()` host list measures each panel independently.
  7. **Edge dissolve: two knobs, not one.** The mask's residual alpha went `.45 -> .58` (the lighter wash Jared asked for) while the defocus band went `1.6 -> 1.2 -> 2.4px` — at 1.2 the frosted-glass layer was invisible. The wash is the fade; the band is the frost. **Do not collapse them into one value.**
  8. **Three scrollers were enrolled for the mask but had no band**, so they faded without ever frosting — which is why the effect looked missing: `.sh-scroll` (all nine rail panels, and it was not enrolled at all — added to both the JS `CONFIG.vertical` and the CSS `:is()` mirror), `.pm6-wiz-topic-list`, and `.browser-viewport`. All three now have `bandTargets` entries.
  Verification: 8-theme sweep green — edge alpha `.58` identical on all eight; glass falls back to an opaque plate with no nested blur; editor tab plate non-transparent on all eight; Source Control pill a themed green on all eight. Live probes: `.editor-code` mask on with 3/4 bands active at `blur(2.4px)`; `.pm6-wiz-doc` `pm-edge-t` + band-on at scrollTop 200 with the title `static`; rail panels enrolled with bands built (they show the effect once content overflows — the file tree currently fits at `scrollHeight == clientHeight == 710`).
  9. **Frost strength, second pass.** Still "too faint to notice" on the editor, browser, file manager and wizard. Three knobs raised together: band `blur(2.4px)` -> `blur(4.5px) saturate(125%)` (the saturate is what makes it read as GLASS rather than a smudge — same trick as the frosted headers, scaled down), `BAND` depth `30 -> 44px` (at 30 it terminated *inside* the 36px mask ramp and was hidden by it), and the per-side feather `55% -> 68%`. The mask's residual alpha stayed at the lighter `.58`.
  10. **Rail frost without the mask — a containing-block trap.** Enrolling `.sh-scroll` for the mask immediately broke the file-manager context menu: `.fm-ctx` is `position: fixed`, and **a `mask-image` on an ancestor makes that ancestor a containing block for fixed descendants**, so the menu re-parented into a box with `overflow-x: hidden` and the "Open with" / "Copy path" submenus were clipped. This is the same hazard the panel chain already documents by keeping `overflow: visible` "so sprout menus escape" — and the same reason `contain:` is banned there. Fix: `.sh-scroll` stays in the JS `CONFIG.vertical` (so it gets edge classes and Stage-B bands) but is **deliberately absent from the CSS `:is()` mask mirror**. The two lists diverge on purpose here and the JS carries a comment saying why. The band is an absolutely-positioned SIBLING, so it delivers the frost without touching containing blocks. Verified: `mask=none`, `enrolled=true`, 2 bands, submenu 196px wide un-clipped, `fixed containing block = none (viewport)`.
  11. **Glass notification pill.** `.rs-card` is an 8% accent tint over `--surface-elevated`; under glass that token is translucent over a light wallpaper gradient, so in glass-light the pill nearly vanished. Glass now gets a double-coat opaque backing plus a 20% tint and a 34% tinted hairline (the near-solid trick already used for glass sprout menus — no `backdrop-filter`, so the one-blur-per-pane budget is untouched). Confirmed 2 gradient layers on both glass themes and **0 on non-glass**, so nothing else moved.
  13. **Edge band strengthening REVERTED — wrong knob.** Item 9 raised the band to blur(4.5px)/saturate/44px/68% chasing "the frosted-as-it-scrolls effect is too faint". That complaint was about the **scroll-under** (content visibly passing behind the chrome above it), which is the header plate + lift mechanism — NOT the edge band, which is a defocus at a scroller's own boundary. Band restored to `blur(2.4px)`, BAND 30, feather 55%. **The two are different effects; check which one is meant before turning a dial.**
  14. **File-manager context submenus un-clipped (pre-existing, not a rev-9 regression).** The menu is `<div class="fm-ctx pm-ctx-menu">` — it carries BOTH classes, and `.pm-ctx-menu` sets `overflow-y: auto; max-height: 70vh`. Per CSS overflow, a computed `visible` on one axis paired with a non-visible value on the other **becomes `auto`**, so `overflow-x` silently became `auto` and clipped the absolutely-positioned `.fm-ctx-sub` flyouts ("Open with…", "Copy path") at the parent menu's right edge. A menu that hosts flyout submenus cannot also be a scroll container: `.fm-ctx.pm-ctx-menu { max-height: none; overflow: visible; }`. Other `.pm-ctx-menu` users keep their cap. Verified with a real right-click + hover: submenu 196px wide extending to x=526 past a menu ending at x=340, fully on screen, all five entries rendered. (An earlier theory — that the mask I put on `.sh-scroll` re-parented the fixed menu — was wrong as the cause, though removing that mask remains correct on its own merits and is documented at item 10.)
  15. **Real scroll-under on four surfaces** (the effect that was actually being asked for all along — content passing BEHIND a frosted plate, not the edge band):
      - **Browser** — `.browser-toolbar` gets the plate, `.browser-viewport` lifts by a static `--pm6-browser-tb-h: 32px` (the toolbar declares `height: 32px`, nothing themed moves it). Verified viewport top 89 vs toolbar bottom 121.
      - **Left rail** — the trap that bit twice: chrome above `.sh-scroll` is **one row in three panels and two in five**. Verified against markup: banner only in `#panel-run`/`#panel-testing`/`#panel-agents`; banner + `.pm-segtab` in `#panel-search`/`#panel-source`/`#panel-git`/`#panel-docker`/`#panel-artifacts` (an earlier bash check wrongly reported Search as banner-only — re-verified with a proper parser). Solved with **two plain `PM_FROST` entries keyed on panel SHAPE**, not one clever selector: banner-only panels measure `.sh-banner`; segtab panels measure `.pm-segtab` with `stack: true` (host-top -> head-bottom, observing preceding siblings). Both rows carry the plate so nothing shows through the gap. Measured 81px where a tab strip exists, 42px where not. **Tab strips verified clickable with real mouse clicks** — `elementFromPoint` returns the tab and clicking switches panes.
      - **File editor** — the previously documented "impossible" case. The old note claimed scroll-under would desync the gutter and skew the minimap. Resolved by lifting **`.editor-gutter` and `.editor-code` together**: they are siblings in the `.editor-area` flex row, so an equal `margin-top: calc(-1 * var(--pm6-editor-tabs-h))` plus an equal `padding-top` preserves the real invariant — line N sits at `padding-top + N*18px` in both boxes. The minimap is the third sibling and is deliberately NOT lifted; its ratios use `clientHeight` and `scrollHeight`, which both grow by the same lift, so `viewRatio` is unchanged. Tab height is measured (`--pm6-editor-tabs-h`) because friendly turns the tabs into top-rounded folder tabs. **Verified line-number alignment: 0px delta at scrollTop 0 AND at 240.**
      - **Planning wizard** — nothing sits above the copy except the doc card's own `var(--xl)` top inset (the title scrolls away by design), so the plate is a `position: sticky` `.pm6-wiz-doc::before` covering that inset, with negative margins so it occupies existing padding rather than adding height (`margin-bottom` cancels the flex column gap). A pseudo-element rather than a real node because the doc body is rebuilt with `innerHTML`; inside the card rather than on the `.pm6-wiz-col-head` caption because the caption sits outside the card's rounded border, and frosting a bare caption row was already tried on the topic map and reverted. `pointer-events: none`.
      T16 budget 119 -> 131.
  Second-pass sweep (all 8 themes): edge alpha `.58` uniform; band active at 44px with `blur(4.5px) saturate(1.25)`; editor tab plate opaque everywhere; Source Control pill a themed green everywhere; glass notify pill opaque with hairline on both glass variants.
  Carry-overs: the topic-map `flex: none` fix is **not visually confirmed** — the topic map sits behind wizard demo progression past the PRD builder and was not reachable by scripted clicks; Jared to eyeball. Browser-view frost likewise unconfirmed live (the tab was not reachable in the harness) though the `bandTargets` entry is in place. Rail frost is real but latent until a panel overflows.
- **Rev 9 (Jared, 2026-08-03):** Scroll + Density wave — seven user-reported items, routed through parts + base mirror + rebuild (snapshot `PM7-base.html.bak-pre-glow-refit` still covers the rev-8 boundary), assemble g3 green 9/9, 17/17 transforms ok, 4 build gates green. Delivered as five workstreams, sequenced by file overlap:
  1. **Left-panel drag lag.** Root cause was five observers each doing a full forced-layout pass per drag frame; the worst was the cozy-shelves `ResizeObserver`, whose fit ladder adds `.pill-fit-measure` and (before this rev) laid out all nine inactive `.side-panel-view`s, then forced ~72 sync layouts — an estimated 150-300 forced layouts per frame. Fix: a `pm-resizing` body class plus a `window.PM_ON_DRAGEND` registry, both owned by the `resizeController()` IIFE every resizer already funnels through (`endDrag` is reached from pointerup/pointercancel/lostpointercapture AND window blur, so the flag cannot get stuck). Five consumers now idle for the drag and flush exactly once on release: PM8 magnet `tick()`, the cozy-shelves RO (`wtier()` also debounced to write only on a real band change), `PM_EDGE.relayoutAll()` (it is O(all ~60 enrolled), not O(dirty)), the editor/dash refit RO, and `trackGlow`'s rect (hoisted into pointerdown). `--pm-glow-pos` also stopped feeding `top`/`left` — a layout property written every pointermove — and became a px offset driving `translate`. `.pill-fit-measure` was narrowed to the active view, guarded by a `getClientRects()` check in `fitOne` so a zero-box pill is left alone rather than mis-fitted.
  2. **Terminal off the edge dissolve.** `.terminal-pane-body` was in `bothAxes` AND in `bandTargets` with all four sides true — the heaviest treatment in the app. All five terminal selectors removed from both mirrored lists (JS `CONFIG` + the CSS `:is()` mirror; machine-diffed to exact set equality afterwards, 73 selectors each). `.pm6-bottom-*` stay enrolled: those are the debug/output panes, not the terminal.
  3. **Side-panel padding.** The `[data-wtier="min"]` overrides were already a ship-tested `--lg`->`--md` / `--md`->`--sm` demotion covering exactly the right rules; promoted to all widths and the 12 now-redundant min rules deleted. Three traps found in the process: `.sh-banner`, `.pm-segtab` and `.sh-foot` each exist TWICE (merged layers, later copy wins) so both copies had to move together; `.pm-segtab.flat` (0-2-0) would have re-widened under 250px; and `[data-wtier="min"] .sh-accb` is NOT a no-op — it deliberately flattens five component-level `.sh-accb` overrides in Source Control, Search and the lane cards, so it was kept.
  4. **Edge dissolve retune + one band everywhere.** Alpha `.14 -> .45`, depth `26/22px -> 36/30px`, and the 2-stop linear ramps replaced with a quadratic ease-out sampled at quarters (`.45/.69/.86/.97/1`) as `calc()` fractions of the same depth token. Stop ORDER is load-bearing: the alpha-1 stop must be last at the `--pm-*-s` position or the no-op case (`o=1, s=0px`) stops rendering opaque. Stage B collapsed from two stacked blur layers to a single `::before` at `blur(1.6px)` with a 55% feather, and `[data-theme^="glass"] .pm-edge-band { display: none }` deleted — so glass matches every other theme by construction, the one-backdrop-filter glass budget is still honoured, cost halves everywhere, and the irreducible Slint-port surface halves (Slint 1.17.1 has no `backdrop-filter` analogue at all).
  5. **One scrollbar everywhere ("the Puppet Master standard").** The auto-hiding thin bar existed but was wired to exactly 4 selectors while ~25 panes had none and 3 rolled their own. Opt-in list 62 -> 87 selectors. Auto-hide made universal WITHOUT a third copy of the list: WebKit reveals via `:is(.pm6-sb-active, :hover)::-webkit-scrollbar-thumb` (a scrollbar pseudo belongs to the matched element, so a hovered ancestor cannot light up nested bars) and Firefox via a new non-inherited `@property --pm6-sb-ink` hook that only opted-in panes read. New `--pm6-sb-size` token. Fixed: `.editor-code.pm6-ctx-host` (bespoke 12px bar with a visible track), `.sh-scroll` (WebKit-only — invisible in Firefox, all 9 side panels), `.sh-wtchips` (Firefox-only — the exact inverse bug), and the live cascade contradiction that killed the terminal's bar. The context-detail scrollport was an UNCLASSED inline div, which is why that page had no bar at all; it got `.cdp-scroll`. Chrome strips (`.page-tabs`, `.editor-tabs`, `.activity-bar`, ...) deliberately stay barless.
  6. **Code pane horizontal bar + vertical reclaim.** `.editor-code` opted in; `.editor-gutter` bottom padding grew by `--pm6-sb-size` so scrollTop-synced line numbers stay aligned. Net vertical is POSITIVE: the editor reclaims 16px (`.primary-content` bottom gutter + code padding) and spends 10 on the bar; the dashboard reclaims 12px. `.page-projects` gained its own `padding-bottom` since it is the page's own scroller.
  7. **`.s4-rail` horizontal wheel.** Two causes, both fixed: `PM_HWHEEL`'s guard tested VERTICAL overflow and the rail's reserved 10px bar made `scrollHeight - clientHeight > 2`, so it bailed; and `scroll-snap-type: x proximity` at a 248px card pitch snapped a 120px wheel notch straight back. Guard rewritten to test horizontal overflow with a bar-thickness-independent formulation, plus a `.pm-hwheel-nosnap` class applied for the duration of wheel scrolling.
  8. **Frosted scroll-under sweep.** 7 sites -> 18. New generic `PM_FROST` module (registry + ResizeObserver + `page.changed` re-seed, modelled on the chat header's `--pm-chat-head-h`) because several headers are theme-variable in height. Added: orchestrator page shell and widgets, usage page, both settings modals, settings inspector drawer, wizard doc overlay and topic map, chat thread sidebar, plus Projects and the wizard doc preview restructured to `position: sticky` first. `#panel-run` is a deliberate one-panel prototype for the left rail — `.sh-banner` is an inset floating pill, not a full-bleed bar, so it needs eyes before rolling out to the other eight (extending it is a one-line selector widening). Four sites frosted in earlier waves (`.pm6-dash-scroll`, `.pm6-orch-pc-feed`, `.pm6-orch-inspector-body`, `.pm6-wiz-thread-body`) had never been added to `PM_EDGE.skipTop`; fixed here, and their top bands turned off.
  Notable defect found during verification and fixed: the chat thread list sets `padding` INLINE from its JS template, which outranks any stylesheet rule — so the new `margin-top` lift applied while the compensating `padding-top` was silently dropped, burying the first thread row 26px under the frosted title. The padding-top now rides `--pm6-chat-sidehead-h` in the same inline style, matching what `.pm6-chat-stream` already does. A sweep confirmed no other frosted scroller has inline padding.
  Verification: live Playwright run against the built artifact, recorded end to end (`scratchpad/pm7-rev9-verification.mp4`, 7 captioned scenes) — 16/17 in-run checks, the only failure being a `/favicon.ico` 404 from the local static server, not a page error. Measured: panel width tracks the drag handle in exact 20px steps 240->440 with the flag set during and cleared after; terminal enrolled=false, bands=0, `scrollbar-width: thin`; edge alpha `.45` on friendly/glass/retro/basic alike and `::after` backdrop-filter `none`; standard bar on content panes with `editor-tabs`/`activity-bar` still `none`; reveal-then-auto-hide confirmed; code pane `scrollWidth 641 > clientWidth 278` with gutter padding `4px 0 14px`; settings rail `scrollLeft 1 -> 744`.
  Build-tooling adaptations (both documented, both re-pinned deliberately): `dead_selectors.py` dropped `.terminal-output::-webkit-scrollbar` (T01 could no longer find it — the rule was deleted upstream when the terminal got the standard bar), and T16's backdrop-filter budget re-pinned 69 -> 127. That budget is a base-drift tripwire, not a perf budget; the glass one-blur-per-pane rule is still enforced by the per-site `backdrop-filter: none` fallbacks. Note the count must be measured AFTER T01 runs, not on the base.
  Carry-overs: the left-rail frost is a one-panel prototype pending review; `#panel-files` needs its own measurement design (five stacked bars of variable height); orchestrator shell frost is theme-gated by construction (under friendly/glass both chrome rows are inset floating pills, so the lift collapses to 0 rather than letting content slide through the side gutters); glass now carries one backdrop-filter band per active edge where it previously had none, so `glass-depth` is worth an FPS profile with the dashboard and orchestrator open — documented fallback is to restore the glass `display: none`.
- **Rev 8 (Jared, 2026-08-03):** Grab-Glow refit — six user-reported defects in the rev-7 resizer work, routed through parts + base mirror + rebuild (snapshot `PM7-base.html.bak-pre-glow-refit`), assemble g3 green (9/9 checks), 17/17 transforms ok, 4 build gates green:
  1. **Glow follows the pointer** (parts 09 + 25). New `--pm-glow-pos` custom property drives `top` on `.resizer-col::before/::after` and `left` on `.resizer-row`; written per-`pointermove` by a `trackGlow()` helper inside `registerResizer`, so it tracks on plain hover as well as during a captured drag and clamps to 0–100% (the glow pins to the bar end instead of sliding off). Deliberately element-level, never document-level: a third document `pointermove` would break the T07 listener merge — T07 still reports "runtime listener count == 1". CSS-side default `--pm-glow-pos: 50%` on both base rules keeps the `var(--x)-used-implies-defined` gate satisfied.
  2. **Bigger, orientation-correct glow.** Core 8x18 → 16x46 (col) / 46x16 (row); halo 20x34 → 46x180 (col) / 180x46 (row). Both orientations previously shared one tall-and-thin size, so every `.resizer-row` glow was rotated 90 degrees wrong.
  3. **No more full-bar fill.** `.resizer-col:hover/.resizing { background-color: var(--accent-primary) }` (and the row twin) deleted — that was the "entire border lights up" report. The halo is now two stacked radial gradients: a long thin streak along the bar axis (the lit border, falling off with distance from the grab point) over a soft bloom at the point itself.
  4. **Organic shape.** `clip-path: polygon(...)` dropped entirely; silhouette now comes from an asymmetric `border-radius` quartet plus gradient falloff, morphed by a new 7s `pm7GlowDrift` keyframe. Transform stays owned by the hover/resizing states so animation and state never fight. Glass override in part 03 re-mirrored to the two-layer structure — a single `closest-side` gradient would have collapsed to a round blob on the new 46x180 box.
  5. **Terminals.** `#terminalResizer::after` (the pre-rev-7 44x3 pill) deleted: it was an ID-specificity rule silently hijacking the shared `.resizer-row` halo, so the dock bar rendered a bare core with no halo, breath or drag scale — the "only one grab point" report. Its full-bar hover fill went too. Terminal split resizers in part 06 switched from the `background:` shorthand to `background-color:` so the shorthand can no longer reset `background-image`.
  6. **Layout.** `.editor-view` margin/padding-right `var(--md)` → `var(--xs)` (~20px of chrome between editor pane 2 and the dashboard → ~4px measured); the now-duplicate pair in the part-09 short-window block dropped. `.dashboard-view` `min-width: 0` → `280px`, and a new `refitEditorDashSplit()` (`window.PM_REFIT_SPLIT`) clamps the editor's dragged `width` against that floor — a drag pins `.editor-view` at `flex:none !important`, so the docked chat's width used to land entirely on the dashboard and crush it out of sight. The refit is called from the activity-bar Chat toggle, the chat close button, `applyLayout()`, the chat resizer, and one `ResizeObserver` on the editor/dash row; `dataset.pmUserW` records the user's intent so the split restores when the space returns. Also replaced the chat resizer's hardcoded 520px floor with the panel's resolved `min-width` — below 2200px viewport it exceeded `--chat-panel-w` and snapped the panel 40–140px wider on the first pointermove.
  Verification: live Playwright run against the built artifact, recorded end-to-end as one clip (`scratchpad/pm7-rev8-resizer-verification.mp4`, 35s, 8 captioned scenes) — 17/17 in-run checks plus 5 reduced-motion/theme checks, 0 console errors. Measured: glow position tracks 12/35/62/88% exactly; bar `background-color` `rgba(0,0,0,0)` and `background-image` `none` at all times; dock halo 180x46 gradient (not the 3px pill); both terminal split bars track independently; gutter 4px; dashboard 332→280px (not 0) with the editor giving up 366px when the chat opens, and 971px restored on close; chat drags 416→360px with a 2px first-move delta. Glow recolours per family (friendly `rgba(111,198,232,.85)`, glass `.92`, retro `rgba(0,255,65,.85)`, basic `rgba(0,86,179,.85)`); both reduced-motion paths kill breath + drift while keeping the pointer anchoring and the opacity fade.
  Carry-overs: `#bottomPanel > .pane-header-drag` is a separate 40x6 pill handle sitting at `top:-8px` over the same strip as `#terminalResizer` — untouched, but it is a second affordance in the same place. Build tooling is macOS-authored (`check_js.py` pins `NODE = "/usr/local/bin/node"`); this rev was built on Windows from a local stage with that one line patched in the staged copy only — the repo script is unchanged, so a Mac rebuild is unaffected.
- **Rev 5 (Jared, 2026-07-22):** Worktree button click was dead — CSS sprout (`.is-open`) vs JS still toggling `.active`. Fixed in parts 25 + 29x-chat, then assemble g3 + `build_pm7.py --allow-new-base`.
- **Rev 4 (Jared, 2026-07-22):** True lineage rebuild of the six ChatGuiUpdates2 workstreams (page-tab ink, sprout popouts, effort bounce, header menus, Chats rail, boot flash). Recipe that was run:
  1. Backport PM8 deltas into `pm6-build/parts` (01 head, 05 shell, 09 bento, 10x chat/global CSS, 11 shell-open ink, 29x chat/chat-data/globals JS). Part backups under `parts/_bak_pre_pm8_backport_*`.
  2. `cd Concepts/pm6-build && python3 assemble.py --gate g3` → `Concepts/PMConcept6.html`.
  3. Adopt as `pm7-tools/base/PM7-base.html`, update `BASE_SHA`, drop 4 drifted dead selectors from `dead_selectors.py`, adapt T05 (already upstream) + T16 backdrop-filter substring budget 24→25 (page-tabs CSS comment).
  4. `python3 Concepts/pm7-tools/build_pm7.py --allow-new-base --outdir /tmp/pm7-rebuild --out Concepts/PMConcept7.html`.
  Keep `PMConcept7.html` / `PMConcept8.html` / Open Design preview lockstep after each rebuild.
- **NEVER hand-edit PMConcept7.html** for routine work. It is a pure build artifact of `Concepts/pm7-tools/build_pm7.py`. Edit parts (or transforms), then rebuild. `Concepts/pm6-build/` is PMConcept6's parts pipeline; PM7 transform work must not hand-patch assembled PM6 either.
- Canonical spec ground truth is `Plans/**` (5,597 PlanUnits as of the four 2026-07-16 governance seals). This file is illustrative source lineage only.

## Transform ledger (build_pm7.py, in order)

| Transform | Delta (bytes) | Outcome |
|---|---:|---|
| T01 dead_css_selectors | -37,179 | 262 frozen dead selectors removed on the 2026-07-22 base (241 rules deleted, 15 spliced, 3 orphaned keyframes; 4 chat-mini/newthread-mini selectors dropped from the freeze list — absent after Chats rail cleanup). |
| T02 shimmer_guard | -128 | Vestigial `.gl-shimmer-overlay` guard removed. |
| T03 pm_sheen_killer | -158 | Redundant `.pm-sheen::before` neutralizer removed; the live `.pm-sheen` hover-lift stays. |
| T04 breadcrumb_stub | -270 | `setBreadcrumb()` no-op stub + call sites removed (breadcrumb strip is retired in Plans per F3-057/F-042). |
| T05 chat_suggestions_field | 0 | SKIP on rev-4 base — `suggestions: null` already removed upstream in pm6 parts; transform no-ops when absent. |
| T06 terminal_dead_interval | -86 | A 1 Hz interval incrementing a never-read counter deleted. The 250ms PM_DEMO master clock is intentionally untouched. |
| T07 merge_pointermove | +1,026 | The two document-level pointermove listeners (jiggle + parallax) merged into one dispatcher (`window.PM7_PMOVE`); parallax gated to glass themes per event. |
| T08 cooldown_dom_gating | +1,412 | Dashboard/usage 1s cooldown state keeps its exact schedule; only hidden-page DOM text writes are skipped, with flush on page activation. |
| T09 terminal_feed_gating | +1,122 | Ambient terminal feed appends to session state always; live DOM appends skipped while the bottom panel/tab is hidden; reveal rebuilds from state. |
| T10 snapshot_handler_gating | +1,295 | Only the dashboard `usage.tick` handler page-gated (measured hot); snapshot state replayed on activation. Event-semantic handlers (gates, alerts) untouched. |
| T11 settings_data_defer | +975 | The 341,509-byte `PM_SETTINGS_DATA` literal moved to an inert `application/json` block with a lazy self-replacing accessor: 341 KB off the JS parse/eval path at load. |
| T12 chat_data_defer | 0 | SKIPPED with evidence: first chat-data read is coincident with first paint (measured -1..+4 ms across 6 runs). |
| T13 demo_files_defer | 0 | SKIPPED with evidence: the block is executable code mutating engine-shared state with multiple read paths; no safe deferral chokepoint. |
| T14 page_init_defer | 0 | SKIPPED with evidence: all three candidate pages fail the safety audit (projects needs live subscriptions; wizard boot registers a cross-page toast; usage accumulates ledger rows it would otherwise drop). |
| T15 static_colormix_precompute | 0 | SKIPPED: only 2 of 449 `color-mix()` sites are var-free; below the yield threshold. Precomputation of the rest is the Slint build's job per F3-431. |
| T16 glass_wallpaper_prebake | +172,686 | THE ONE APPROVED VISUAL CHANGE (Jared, 2026-07-16). Glass wallpapers pre-baked to WebP data URIs (mesh dark/light; depth base + alpha billow layers dark/light; minimal needs none - it was already static). Runtime wallpaper `filter: blur/saturate` and the `pm-sky-drift` animation removed. Float shapes stay live (pre-saturated colors, `pm-float` animation intact); pointer parallax stays live on the baked layers. 176,858 bytes of images, under the 180 KB cap (tier-5 encode: 1120x630 at q=0.5 - validated visually by the pixel matrix). The shell's single `backdrop-filter: blur(34px) saturate(160%)` is unchanged. This file now DEMONSTRATES the exact "one blur over a pre-blurred known wallpaper" technique that Plans mandates for Slint (F3-427/F3-431). |
| T17 slint_clarity_layer | +9,880 | PM7-README comment block after `<head>`, name-based 29-block table of contents, and a grep-able `PM7 SECTION n/29` banner before every style/script block. |

Net (rev 2): 2,394,962 -> 2,544,909 bytes (+149,947: the baked images are payload the GPU no longer has to compute every frame; 38.4 KB of dead code is gone; the runtime is strictly lighter - see below).

## Verification summary (2026-07-16)

- Screenshot matrix (rev 2 re-verification): 35 shots per file at 1600x900, deterministic recipe (seeded RNG, frozen demo clock, animations disabled at capture). STRICT shots zero-pixel identical and 6/6 glass full-composition shots pass LOOSE (mean per-channel delta 0.00-3.45, cap 5.0; glass-minimal 0.000, byte-identical) - the only systematic differing pixels are the wallpaper region (baked static frame vs runtime-blurred drifting sky), the approved change. One documented harness artifact: the usage-banner countdown label races the 1-second wall-clock tick against capture timing and can differ by 198px (0.0095%) in either direction on any single run - it flakes PM6-vs-PM6 and PM7-vs-PM7 alike, and every shot has a zero-diff PM6/PM7 pairing across capture runs (g1 and f1 both converge to 0), proving pixel-identity when tick boundaries align.
- Functional smoke: zero console errors on load, page sweep, and scripted sessions in both files. Behavior probes byte-equal for engine state, page reveals, thread switching, settings (817 rows, search, bloom, slider clamps), popout chains, terminal feeds, and chapter jumps. One known bounded artifact: on page reveal, a 1-second-granularity countdown label can display 1 tick fresher/staler than PM6's last hidden write (underlying state verified identical; PM6 itself varies by 1s between runs at tick boundaries; the label re-syncs on the next tick).
- Glass smoke: baked layers render, zero runtime wallpaper blur filters, backdrop blur intact, `--glass-alpha` slider live within clamps, all three background modes render, parallax vars written on `#glass-bg` under glass and correctly absent under other themes, all 6 float shapes animated.
- Static gates: brace balance, CSS var definitions, `node --check` on every script block, and the pm6-build no-emoji checker (0 banned glyphs) all pass.
- Perf census (30s parked on Settings): active intervals 6 -> 5 (the deleted dead ticker); document pointermove listeners 2 -> 1; idle DOM mutations -25%; 341 KB of settings JSON removed from the load-time JS eval path.

## Guidance for the Slint-porting agent

Read the PM7-README comment at the top of PMConcept7.html. The short version - these are HTML implementation ARTIFACTS; do not port them:

- The 250ms polling master clock and beat re-arm loop: build event-driven updates (`invoke_from_event_loop`), never a polling loop. The beat script content is product-behavior spec; the polling is not.
- innerHTML thread swaps in chat: use list models on a `Repeater`; switching threads is a model swap, not a re-parse.
- Body-portaled popouts (20+ `appendChild(document.body)` sites): use native `PopupWindow`; delete all portal/reposition-on-scroll machinery.
- String-built UI and per-mousemove style writes: declarative Slint markup + hover states.
- Measure-then-write overlay math (`updateFooterLayout`, `getBoundingClientRect` clusters): express as layout/anchor constraints.

These are FEATURES; keep them (cheaply):

- Glass = ONE backdrop blur over a pre-blurred wallpaper asset (this file demonstrates it; assets can be re-baked at native resolution), with the `--glass-alpha` transparency slider and per-theme clamps (F3-429).
- Footer pill scroll-reserve geometry (F3-422) as anchor constraints.
- Drag resizers, cached canvas minimaps, the reduced-motion kill-switch, and everything specified in the 2026-07-16 Plans addenda.

Canonical contracts: `Plans/FinalGUISpec.md` (incl. Theme System + Settings System + Shell Sweep + Chat Polish addenda, 2026-07-16), `Plans/assistant-chat-design.md`, `Plans/settings_inventory.json` (818 settings), `Plans/UI_Command_Catalog.md` + `Plans/Wiring_Matrix.production.json` (535 wired commands).

## Re-derivation recipe (when PMConcept6 changes)

1. `python3 Concepts/pm7-tools/css_audit.py` against the new base; review the diff vs the frozen `dead_selectors.py` (new dead candidates need human approval; newly live tokens are auto-protected).
2. `python3 Concepts/pm7-tools/build_pm7.py --allow-new-base` - any transform whose pre-assertion fails identifies exactly what changed upstream; adjust only that transform.
3. Re-run the verification matrix (`Concepts/pm7-tools/verify/capture_matrix.mjs` + `diff_all.mjs`) with the new base as the baseline before replacing `Concepts/PMConcept7.html`.
