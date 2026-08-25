# Wave 4 — Orbit — work log (item 12)

Owner: `orbit.js` + `orbit.css` ONLY. No app.js / styles.css edits (patches go to the orchestrator).
Scratch: `scratchpad/w4orbit/`.

## Baseline recorded before the first edit (2026-08-25 03:07)
- `python3 build.py --check` PASSES, sha256 `6225b219bc263e18`.
- `node tests/audit.mjs reports/audit.json ./tests` -> **434 pass / 0 fail / 0 console errors /
  0 page errors**. (Note the invocation: `./tests` as argv[3]. `.` and the default both fail —
  Wave 1A's finding, confirmed again here.)

## Source reading — what is actually true right now
- Wave 1A's take-1 hooks are PRESENT and verified in source:
  - `app.js:748` orbit nodes emit `data-action="inspect-work-step" data-value="${i}"` +
    `role="button" tabindex="0"` + inline `pointer-events:auto;cursor:pointer`.
    `.orbit-ring{pointer-events:none}` is still in `styles.css:224` — the inline override on the
    node is what defeats it. So the ring is still `pointer-events:none`; only the nodes hit-test.
  - `CHROME_OPTS={0:{noRows},1:{keepBody:true},...}` — take 1 has `keepBody` but **NOT
    `noChrome`**, so the shared icon row (`renderPhaseChrome`) still renders above Orbit.
    Item 12 bullet 2 asks for it to be gone. Two options: an app.js patch to
    `CHROME_OPTS[1]={noChrome:true,keepBody:true}` (orchestrator), or a scoped rule in orbit.css.
  - Slot `workingTake:1` exists (`app.js:736`, `extEach('workingTake:'+v)`) and takes priority
    over `PM56_WORKING[v]`.
- `takeOwnsAgents(v)` reads `window.PM56_WORKING[v].ownsAgents` — a module can set that WITHOUT
  the slot being a function, which suppresses the shared `renderLiveAgentInline` list (which
  hardcodes "2" and `slice(0,2)` against 14 fixture subagents).
- Shared trail = `.pm-rail-item.wa-disc` inside `.pm-rail.wa-track`. **Take 8 (`rail8`) uses
  `.pm-rail-item` too** (`variants-a.js:100`) with `icon(s.icon,11)` — so it is garbled by the
  same cause and is in scope for the "every take that uses it" decision.

## Next
- [ ] 1. orbit.css: shared-trail fix (sizing/stroke/transform/blur/clip).

## Sub-step 1 — DONE: shared phase-trail fix (orbit.css PART 1)
Measured in-browser BEFORE (1440x900, dpr 1, `scratchpad/w4orbit/trail-probe.mjs`):

| | disc box | resting transform | svg | stroke-width | **painted stroke** |
|---|---|---|---|---|---|
| chrome, current (takes 0/1/3…) | 22x22 | scale(1) | 11px | 1.8 | **0.825 px** |
| chrome, resting | 15x15 | scale(.86) | 11px | 1.8 | **0.71 px** |
| take 8 rail8, current | 20x20 | scale(1) | 13.2px | 1.8 | 0.99 px |
| take 8 rail8, resting | 13x13 | scale(.86) | 9.46px | 1.8 | **0.71 px** |

AFTER:

| | disc box | transform | svg | stroke-width | **painted stroke** |
|---|---|---|---|---|---|
| chrome, current | 20x20 | scale(1.18) | 16.52px | 2.3 | **1.583 px** |
| chrome, resting | 20x20 | none | 14px | 2.3 | **1.342 px** |
| take 8, current | 20x20 | none | 13.2px | 2.95 | **1.622 px** |
| take 8, resting | 13x13 | none | 9px | 3.6 | **1.350 px** |

Everything is now over the 1px floor at dpr 1. Nothing sub-pixel remains.

Four causes, all addressed:
- (a) `icon(name,11)` -> `--rail-icon` / `--rail-stroke` per context. stroke-width is in USER
  units, so painted px = value * rendered/24; each context is tuned to land ~1.35px.
- (b) `transform:scale(.86)` at rest -> `transform:none`. The demotion is carried by colour and
  border, which cost no stroke weight.
- (c) `pm-disc-in` blurs 2px on a 15px box and its `both` fill pins `scale(1)`. Replaced by
  `orbit-disc-in` — **only the `animation-name` is overridden**, so motion.css keeps owning
  duration/easing/fill and take 8 keeps its 65ms stagger. The keyframe ends at
  `scale(var(--rail-pop,1))`, so `fill:both` pins the value the element actually wants — that is
  the documented "fill-mode beats a declared value" trap, handled rather than avoided.
- (d) the width/height transition re-laid-out the disc every frame. The chrome's current disc now
  grows by TRANSFORM on a constant box, so those two transition entries can never fire.
  Take 8's grow-by-width IS its design and is untouched.
- `.wa-track` clipped its own discs: measured **143px of content in a 141px box at 1440** — i.e.
  clipping in the DEFAULT layout, before any resize. Now `overflow-x:auto` + `gap:5px` +
  `padding:3px 2px` (room for the 1.18 scale), scrollbar hidden, `overscroll-behavior-x:contain`.
- Hit target: `.wa-disc[data-action]::after{inset:-2px}` -> 24px, no neighbour overlap at gap 5.

**No other take's layout moved**: the only boxes touched are `.wa-disc`'s own (15/22 -> a constant
20, inside a track that now scrolls) and take 8's icons *inside* its unchanged discs.
`build.py` sha `5d343aad151e35fe`; audit **434 / 0 / 0 / 0**.

## Next
- [ ] 2. orbit.js — the take-1 override: clickable nodes, container-derived radius, collapse/expand.

## Sub-step 2 — DONE: the Orbit take (orbit.js + orbit.css PART 2)
Registered through `PM56_EXT.slot('workingTake:1', …)` — app.js untouched.

**Reuses the ORIGINAL class names** (`.orbit-stage/.orbit-ring/.orbit-node/.orbit-core/
.orbit-track/.orbit-caption`) rather than inventing new ones, because renaming would have
orphaned six selector blocks in `styles.css` — the exact defect class this plan fights.

What landed:
- **Nodes are the control.** All 14 work steps get a node; each is a real `<button>` with
  `data-action="orbit-open-phase"`, `role`/`tabindex` from the element itself, an aria-label
  ("Step 7 of 14: Subagents, in progress") and a full title. `.orbit-ring` KEEPS
  `pointer-events:none` and the nodes opt back in — the ring is an inset:0 overlay that also
  covers the core, so deleting the rule outright would make the core unclickable. That is the
  correct reading of item 12 bullet 1.
- **Clicking a node reveals that phase's detail** and rotates that node to the top of the ring
  (shortest arc — the rotation is accumulated in the module so 13 -> 0 does not sweep backwards
  through twelve segments). Clicking the same node again collapses. The core toggles too.
  Inspecting deliberately does NOT scrub the run; when the inspected phase is not the live one
  the panel offers an explicit "Move the run to this step" that dispatches app.js's own
  `inspect-work-step`.
- **Subagent nodes open the agent.** While the delegation phase is focused, up to 5 child agents
  appear as satellites on an inner arc with `data-action="open-agent"`, and the panel lists the
  same agents as clickable rows. Agents are derived (`parentThreadId === selectedThread`), and
  statuses go through `D.labels.subagentStatus` (so `blocked` prints "Stalled", per the label rule).
  Take 1 now declares `PM56_WORKING[1].ownsAgents=true`, which suppresses app.js's shared
  `renderLiveAgentInline()` underneath — that list hardcodes the count "2" and `slice(0,2)`
  against a 14-record fixture.
- **Geometry is derived, not typed.** `--orbit-r: calc(50cqi - node/2 - 4px)` against the dial's
  own container. Verified: dial 160.8px -> every node measured at radius **65.3px**, identical
  for all 14.
- **Container query, not viewport.** `.orbit-stage` is the container; `.orbit-layout` is the grid.
- **Collapse/expand** is one mechanism on both axes: `0fr -> 1fr` on the column track (wide) and
  on the row track (narrow), with `min-width/min-height:0` on the panel so a `0fr` track really
  collapses instead of flooring at min-content.
- `data-step-kind` is re-emitted on the stage (focused phase) and on every node (its own phase),
  so motion.css's `--pm-step` paints the ring as a real phase spectrum.

**Two bugs I made and caught, both worth recording:**
1. **I put `container-type` and the `@container` rules on the SAME element.** An element is never
   its own container, so the narrow tier silently never fired — measured `grid-template-columns:
   "160.766px 0px"` (the wide value) at a 365px stage. `variants-a.css:24` documents this exact
   trap for take 8 and I walked into it anyway. Fixed with the `.orbit-layout` wrapper.
2. **`@container` adds no specificity**, so my narrow block sitting ABOVE `.orbit-panel` lost to
   it — panel measured 190px wide instead of filling the stage. Moved to the end of the file.

Measured after (1440x900, editor at 54%, stage 365px -> narrow tier):
collapsed stage 365.4 x 160.8, panel 365.4 x **0**, dial centre offset from stage centre
**-0.01px**; open stage 425.5, panel 365.4 x 253.7. All 14 nodes and the satellites hit-test to
themselves via `elementFromPoint`. Zero console errors/warnings.

## Control build — run BEFORE claiming anything
Two isolated roots from ONE source snapshot (other agents are writing live), same suite:
- **mine**: 441 pass / 1 fail
- **control** (`orbit.js`/`orbit.css` blanked): 441 pass / 1 fail
Same single test in both: the orchestrator's new `Phase compact and expand across all 24 working
takes`. Its broken list is `[1,12,16]` in the control and `[1,2,12,16]` in mine.
- 1 / 12 / 16 (v = 0, 11, 15) are **exactly the `CHROME_OPTS` `noRows:true` takes** — they print
  rows in their own bodies, so `opened===0` is correct and the assertion is stale. PRE-EXISTING.
- **take 2 (v=1, Orbit) is mine**: `.wa-chrome` is `display:none`, so `locator.count()` still
  finds the disc but the click times out. The fix is the `CHROME_OPTS[1].noChrome` patch, which
  has been sent to the orchestrator (with the triage above and a third finding).

## Third finding sent to the orchestrator
`--spring` bundling ALSO fires in `transition`, in **8 live rules** (`styles.css:217/224/226/228/
230/234 x2/236`). Measured on the stock orbit: `transition-delay: 0.52s` on `transform`. The
note's "correct in `transition`" is only true when the rule supplies no duration of its own.

## Next
- [ ] 3. Negative control, wide/narrow reflow measurement, 8 themes, reduced motion, film.

## Sub-step 3 — DONE: `orbit-verify.mjs` (the two-harness deliverable) + negative control

`orbit-verify.mjs` sits next to the sources and takes `--file <path.html>`, `--negative`,
`--json <out>` and honours `PM56_ROOT`. It exists so a SECOND agent can re-run it against a
control build without editing it.

**Result: 46 pass / 0 fail / 0 console noise** against `index.html`.
**Negative control (orbit.js + orbit.css blanked, built into an isolated temp root — the shared
deliverable was never touched): 6 pass / 21 fail.**

### The orchestrator's three replies landed first
- `CHROME_OPTS[1] = {noChrome:true, keepBody:true}` is in `app.js`, so **my
  `.working-variant-1 .wa-chrome{display:none}` interim is DELETED**. Verified: the chrome is now
  absent from the DOM (`document.querySelector('.working-variant-1 .wa-chrome')` -> null), not
  merely invisible. The comment left in orbit.css records why the interim was wrong so nobody
  reintroduces it: it satisfied the eye and failed the machine — `locator.count()` still found the
  eight disc buttons and the click timed out, which is the same "disabled, not absent" failure the
  packet forbids elsewhere.
- The 8 `--spring`-in-`transition` rules are fixed in `styles.css`. Confirmed from the negative
  control, which now measures `transitionDelay: 0s,0s,0s,0s` on the STOCK `.orbit-node`.

### THE NEGATIVE CONTROL FOUND THREE WEAK ASSERTIONS OF MINE. All three are now fixed.
1. **"a clipped trail can be scrolled" was VACUOUS.** It passed against `overflow:hidden` — an
   overflow:hidden box still has a scrollport and still obeys a programmatic `scrollLeft`; it
   simply gives the USER no way to move it. The computed `overflow-x` is now part of the same
   claim.
2. **"the current disc crop paints real ink" does not measure crispness.** A 0.71px stroke paints
   plenty of ink — it just paints all of it grey. Replaced with a real discriminator:
   **count the pixels that reach the icon's own colour.** A sub-pixel stroke can never fully cover
   a device pixel, so it has no fully-covered core.
   **Measured: negative control `core: 0` on BOTH discs; this build `core: 11` (current) and
   `core: >=12` (resting).** Threshold set at 6, i.e. between the two measurements with margin —
   not invented. The two "paints real ink" checks are KEPT but are honestly presence checks; they
   pass in the control too and are reported as such.
3. **"the live node paints a filled accent disc (>=30% one colour)" measured the crop's SHAPE, not
   the node's fill** — a rounded 26px node with a glow and a pulse ring is only ~22% any one
   colour. Replaced with: the centre pixel is within delta 12 of the node's own computed
   `background-color`, and at least 40 away from the card behind it.

Two more false positives I caught in the harness itself (neither was a product defect):
- `scroll-behavior:smooth` means `scrollLeft` does not land in one rAF. The first probe read it a
  frame later, saw 0, and reported a non-scrolling track that scrolls perfectly well.
- Opening the panel grows the card ~250px, which pushes the orbit past the bottom of the viewport
  inside the scrolling transcript. `document.elementFromPoint` returns null off-viewport, so the
  theme loop reported "not hit-testable" in all 8 themes for a purely scroll reason. The
  uniformity is what gave it away — the same tell as Wave 1A's glyph false positive.

### ONE REAL DEFECT THE HARNESS FOUND IN MY OWN CSS
The `prefers-reduced-motion` block still listed `.orbit-stage`, but the grid transition had moved
to `.orbit-layout` when the container/queried-element split was introduced. So under reduced
motion the collapse still travelled its full 420ms. Fixed (`.orbit-layout` and `.orbit-panel`
added); re-verified — the panel opens and closes inside 180ms and nothing inside the orbit
carries `animation-iteration-count: infinite`.

### The 6 assertions that still pass with my module removed — attribution, stated plainly
| assertion | why it passes without me |
|---|---|
| current/resting disc "crop paints real ink" (x2) | presence, not crispness — deliberate; the crispness claim is the core-pixel one, 0 -> 11+ |
| "no phase-chrome icon row above Orbit" | the ORCHESTRATOR's `CHROME_OPTS[1].noChrome` in app.js |
| "a node exists for every work step" | **Wave 1A's** `slice(1,9)` -> all steps fix, still true |
| "all nodes hit-test to themselves" | **Wave 1A's** inline `pointer-events:auto`, still true |
| "no transition on a node carries a delay" | the ORCHESTRATOR's `--spring-ease` sweep in styles.css |
Nothing in that list is vacuous, and four of the six are other agents' fixes that this harness
confirms rather than claims.

## Next
- [ ] 4. Film expand / collapse / wide-narrow reflow; read the contact sheets by eye.

## Sub-step 4 — DONE: filmed, read by eye, and four defects fixed BECAUSE of the film

CDP screencast contact sheets in `scratchpad/w4orbit/film/`:
`01-expand`, `02-collapse`, `03-satellites`, `04-reflow-wide-to-narrow`,
`05-reflow-narrow-to-wide`, plus `still-wide`, `still-narrow`, and `trail-take3-chrome` /
`trail-take8-rail8` at 3x nearest-neighbour magnification.

**Confirmed by eye:** wide = circle left / detail right; narrow = circle on top / detail below;
the ring is never amputated at any width; the trail icons read as clean line icons at 3x with no
smearing, on BOTH the shared chrome and take 8's rail.

**Four defects the film found that no assertion of mine had caught:**
1. **The collapse blanked its own content.** On collapse the panel's `data-k` changed to the LIVE
   phase, so pmPatch remounted it, `opacity:0` applied with no previous value to transition from,
   and the card then spent ~280ms shrinking an EMPTY rectangle. Fixed by keying the panel on the
   phase the PANEL is showing (`lastPanelIdx`), which only advances while open — so the collapse
   patches instead of remounting and the content the user was reading fades and shrinks with the
   box. Re-traced: content string identical on every frame, height 260 -> 0 with opacity 1 -> 0 in
   step.
2. **The dial row bulged mid-transition.** `grid-template-rows: auto 0fr -> auto 1fr` made
   Chromium re-resolve the `auto` track against the container's changing size: traced,
   **160.8 -> 225.3 -> 160.8px** during a 280ms expand, i.e. the circle visibly drifted down and
   back. Fixed by giving both endpoints the identical explicit first track
   (`var(--orbit-dial-w)`), so there is nothing there to interpolate. Re-traced: **160.766px on
   every single frame.**
3. **The core went blank for ~40ms on a phase handover.** `data-k="corelabel:${id}"` remounted the
   label, and styles.css gives `.orbit-core strong` a `pm-materialize` entrance from opacity 0.
   The label now carries a CONSTANT key and no entrance (the word swaps); the icon keeps its
   subject key and a new blur-free `orbit-core-in` that starts at opacity .35 rather than 0.
4. **The core label painted outside its own circle** — measured 10.3px past the core's edge, over
   the ring behind it, at a 162px dial. Now wraps rather than ellipsises (a circle has room for two
   short lines and none for a truncation mark), with `overflow-wrap:anywhere` as the backstop.
   Swept **all 14 phase labels x 5 editor splits: contained and unclipped in all 70 combinations.**

Also from the still: **satellites were sitting on the core's rim.** A fixed `--orbit-r * .64`
measured only 2.3px of clearance at a 162px dial. They are now centred in the ANNULUS between the
core's edge and the node ring's inner edge, with `* 0.63` rather than `/ 2` for the node because
the focused node is transform-scaled to 1.26 and its painted edge is closer in than its layout box.
Measured symmetric **5.4px on both sides**, and withdrawn entirely below a 168px dial.

**Instrument caveats, recorded so the sheets are not over-read:**
- Playwright's click round-trip puts a **~180ms phantom** at the head of every sheet — frames 0-4
  are always the pre-click state. All timing claims here come from in-page rAF traces instead.
- The CDP screencast's arrival order is not reliably the paint order. One sheet appeared to show
  the panel opening, vanishing and reopening; the rAF trace showed a clean monotonic 0 -> 260px.
  **Trust the trace, not the sheet, for anything about ordering.**
- The first sheet capped its crop at the card's COLLAPSED height, so the panel was mostly outside
  the frame and looked like it never opened.

## Sub-step 5 — DONE: orphan gate over my own file (both directions)
`scratchpad/w4orbit/orphan.mjs` — every selector `orbit.css` declares must match something in some
reachable state, and every class `orbit.js` emits must be styled somewhere.
Result: **78 selectors, 76 matched, 0 unstyled emitted classes.** The two unmatched:
- `.wa-track::-webkit-scrollbar` — a pseudo-element `querySelector` can never return. Not real.
- `.orbit-empty` — needs a thread that has a working card AND no child agents, which the fixture
  does not contain. Per the project rule that "unreachable today is a property of the DATA",
  `orbit-verify` now **drives that state directly** (empties `D.subagents` on a throwaway page) and
  asserts the empty row renders, paints, hit-tests, and reports a count of 0.
The gate also found a real problem: `agentsForRun()` fell back to `subagents.slice(0,4)` when a
thread had no children, which **quietly attributed another thread's agents to this one**. Removed —
the empty state is a true statement, borrowed rows are not.
Same pass added the `.orbit-chip.run` case (every other path pauses the run, so the running chip
was never exercised).

## FINAL STATE
- `python3 build.py --check` **PASSES**, sha256 `5a31a855faaa4ee9`, both deliverables CRLF and
  byte-identical to each other. Neither deliverable hand-edited.
- `node orbit-verify.mjs` -> **53 pass / 0 fail / 0 console noise.**
- Negative control (module blanked, isolated temp root) -> **6 pass / 25 fail.**
- `node tests/audit.mjs reports/audit.json ./tests`: **443 pass / 3 fail** — and the CONTROL BUILD
  with my module excised gives **443 / 3 with a byte-identical failure set and byte-identical
  details**. Introduced by orbit: none. Removed by orbit: none.
  The 3: the stale `noRows` takes 1/12/16 (triaged to the orchestrator), and two NEW pre-existing
  failures `No page overflow at 1440 / 1280 across the editor split range`, both
  `button.context-ring +29px` at a 70-80% editor split — **not mine**, proven by the control.
- Files owned and changed: `orbit.js` (346 lines), `orbit.css` (605), `orbit-verify.mjs` (707).
  `app.js` and `styles.css` untouched by me; the two changes they needed went through the
  orchestrator. Nothing committed.
