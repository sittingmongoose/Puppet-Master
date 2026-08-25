# Wave 5 — Motion (video inspection pass) — INTERRUPTED, HANDOFF LOG

## ============ RESUME HERE ============

**Session ended mid-pass. Everything below is what I had. Two defects are CONFIRMED with
independent instruments; one more is STRONGLY SUSPECTED and was 60 seconds from being settled
when I was stopped.**

### Filmed and settled
- **Orbit** — expand, collapse, phase handover, plus the `02-collapse.png` eye-check the
  orchestrator asked for. **One HIGH defect found (DEFECT 1), root-caused to a line of `app.js`.**
- **All 24 working takes** — animation presence, distinctness, and phase-trail crispness on
  **every** take (Wave 4 Orbit had only measured 4). All crisp, all animate, all distinct.
- **History** — the W1 open (filmed + rAF-traced). **DEFECT 2 measured**: the entrance starts
  306px to the LEFT of its resting position, i.e. over the editor pane. The frames I captured
  did NOT show it painting there, so the *last unresolved question* is whether an ancestor clips
  it. That is the next step (below).

### NOT filmed — nothing to report on these, do not assume they are clean
- History: pin-in-place narrowing (filmed but my rAF trace was invalid — see §2), the pinned-thread
  FLIP into the Pinned group (filmed, **sheet never read**: `film/hist-03-threadpin.png`), and the
  **nine status indicators** (not filmed at all).
- **Menus** — corner-origin sprout, asymmetric close, search-filter height spring. *Including the
  orchestrator's explicit ask to eye-check `close-contact-sheet.png` for the close-opacity claim.*
  NOT DONE.
- **Goals** — the ~233ms phase-completion strikethrough wipe. NOT DONE.
- **Transcript** — message arrival, hover-gated actions. NOT DONE.
- **Context** — compact menu, drawer, growth chart. NOT DONE.
- **Decisions** — all 8 question/decision takes. NOT DONE.
- **Reduced motion** — NOT DONE on any surface.
- **8-theme sweep** — NOT DONE on any surface.

### My literal next step (script is written and ready to run)
`node /…/scratchpad/w5/06-hist-cross.mjs` — it is **already written and unrun**. It answers the
one open question in §2: it walks `.history-flyout`'s ancestor chain printing
`overflow/position/z-index/contain`, calls `document.elementFromPoint(500, midY)` on every rAF
frame of the entrance to see whether the drawer actually *hit-tests* over the editor pane, and
re-films the open with a clip (x 380→1440) that actually contains the travel — my first clip
(x 0→720) was too far left and is why `hist-01-open.png` shows nothing but the editor.
**Run that first.** Then continue down the "NOT filmed" list.

### Where the evidence is
- Scripts + traces: `scratchpad/w5/*.mjs`, `scratchpad/w5/trace-*.json`, `scratchpad/w5/takes.json`
- Contact sheets / montages: `scratchpad/w5/film/`
  - `orbit-01-expand.png`, `orbit-02-collapse.png`, `orbit-03-handover.png`
  - `takes-rest-0.png`, `takes-rest-1.png` (24 takes at rest, 4-up)
  - `hist-01-open.png` (**badly clipped, ignore**), `hist-02-pin.png` (**unread**),
    `hist-03-threadpin.png` (**unread**)
- Reusable rig: `scratchpad/w5/rig.mjs` — `boot()`, `makeFilmer()`, `rafTrace()`.

### Instrument lesson the next agent MUST inherit
**Sort CDP screencast frames by `metadata.timestamp`, never by arrival order.** My rig asserts the
two agree; they did **not**, on 3 of the 6 captures I made. Arrival order is wrong often enough to
invent motion that never happened. This is what produced Wave 4 Orbit's phantom
"opens, vanishes, reopens".

## =====================================

Instrument: Playwright chromium over `file://`, CDP `Page.screencast` frames assembled into
contact sheets in-page (canvas) at deviceScaleFactor 1, plus in-page rAF traces for timing.
Rules held: contact sheets are APPEARANCE evidence only; rAF traces for durations; never measure a
transition by triggering it twice (I broke this once — see §2 — and have flagged the bad number).

---

# DEFECTS

## DEFECT 1 — HIGH — the working card lurches 271px in one frame, on every orbit expand AND collapse
**Confidence: certain.** Two independent instruments (in-page rAF geometry trace + re-sorted
contact sheets), root-caused to a specific line.

Evidence: `film/orbit-01-expand.png`, `film/orbit-02-collapse.png`,
`trace-stage-expand.json`, `trace-stage-collapse.json`, script `03-orbit-stage.mjs`.
Conditions: 1440x900, dpr 1, take 1, step 7, basic-dark.

### Measured
| moment | `.orbit-stage` (the content) | `.working-card` (the box) |
|---|---|---|
| expand +3ms | 160.8 | 273.8 |
| expand +388ms | 431.8 — grew 271 | **233.8 — shrank 40** |
| expand +437ms | 431.8 | **504.8 — +271px in ONE frame** |
| collapse +11ms | 431.8 | 504.8 |
| collapse +430ms | 160.8 — shrank 271 | **544.8 — grew 40** |
| collapse +446ms | 160.8 | **273.8 — −271px in ONE frame** |

For ~440ms the card's box moves the **wrong way** while its content moves the right way, then the
whole card — and everything below it in the transcript — jumps 271px in a single frame. Measured
on the next sibling too: its top goes 811 → 540 in one frame.

### Root cause
`app.js:1185 flipHeights()`:
```js
const h1 = el.getBoundingClientRect().height;      // read IMMEDIATELY after the patch
el.style.overflow = 'hidden';
el.animate([{height:`${h0}px`},{height:`${h1}px`}], {duration:320, …});
```
`h1` is read before the orbit's own CSS transitions have moved a pixel, so it is the incoming
animation's **first** frame, not its last. The FLIP then animates toward the wrong number,
backwards, with `overflow:hidden` clipping the real content for the whole 320ms — and the release
snaps.

This is the codebase's named recurring trap again: *a bounding box measured mid-animation standing
in for the settled value.* Same family as Menus' `positionOverlays()` measuring at `scale(.94)`.

### What it looks like (why assertions missed it)
- expand frames #6–#9 (+373…+558ms): the dial sits above a **dead empty band**, panel clipped away.
- collapse frame #6 (+383ms): the **outgoing panel ghost and the incoming caption are on screen at
  the same time**, stacked, with a gap between them.
- collapse #7–#10: ~200ms of an oversized, mostly-empty card.
- collapse #11: the snap.

### Scope — this is NOT orbit-specific
`data-flip` is on `.working-body` for **every** take (`app.js:660`). Any take whose body animates
its own height gets the same wrong-target FLIP. I did not measure the other takes for it.

### Adjacent, minor
`.working-body{transition:min-height var(--spring),height var(--spring)}` (`styles.css:192`) is
**dead weight** — `min-height` is a constant 122px and `height` is `auto`, which does not
interpolate. Not the cause; just does nothing. (The token usage itself is legal: it is the sole
time value, so no delay defect here.)

---

## DEFECT 2 — MEDIUM/HIGH, ONE STEP FROM CONFIRMED — the history drawer's entrance starts on top of the editor pane
**Confidence: the geometry is certain; whether it PAINTS there is the unfinished step.**

rAF trace (`trace-hist-open.json`, script `05-history.mjs`), 1440x900, floating mode:
```
+6.8ms   element does not exist yet
+64.9ms  x=476.6  w=300   <-- entrance start
+156.8   x=627.3
+240.2   x=762.9
+323.6   x=782.6  settled  (== the transcript's left edge)
```
`translateX(-102%)` of 300px = −306px; 782.6 − 306 = 476.6. ✓ So the start position spans
476.6→776.6, which is **entirely over the editor pane** (the transcript does not begin until
782.6). This is the same defect class the orchestrator recorded for History earlier
("the drawer slid in across the editor pane while every geometric assertion passed").

**Why it is not yet proven:** my contact sheet `hist-01-open.png` was clipped to x 0→720 and shows
only the editor — the drawer never appears in it. Either (a) an ancestor clips the flyout, in which
case this is a non-defect and the entrance reads as a wipe, or (b) my clip's y-range missed it, or
(c) it is behind the editor in z-order. **`06-hist-cross.mjs` (written, unrun) answers this** with
`elementFromPoint(500, midY)` per frame plus an ancestor `overflow/contain/z-index` dump.

**Two secondary numbers from the same trace, worth keeping either way:**
- The drawer **does not exist for the first ~58ms after the click** (null at +6.8, present at
  +64.9). A 58ms nothing-happens gap on a 240ms choreography is a third of it.
- Travel is ~259ms and the whole thing settles at ~324ms, against a claimed 240ms. Not necessarily
  wrong (spring tail), but it is not 240.

---

## §2 — MY OWN INSTRUMENT ERROR, LOGGED (per the run's convention)
I traced the **pin-in-place** transition by clicking the pin control a second time after the film
step had already pinned it. The trace shows a single state (`drawerW=200, transcriptL=982.6`) and
is **worthless — discard `trace-hist-pin.json`.** This is exactly the "never measure a toggle by
toggling it" error the orchestrator logged against itself. The correct method is an
unpin → settle → trace(pin) cycle.
`film/hist-02-pin.png` was captured from a clean unpinned state and **is** valid — I simply never
read it. So the claim "the drawer narrows 300→200 while the transcript gutter grows in lockstep"
is **unverified by me**, in either direction.

Also note for whoever resumes: there are **two** pin controls and a naive
`/pin/i.test(dataset.action)` matches the wrong one first —
`pin-history` (the header control) and `ph-toggle-pin` (*"Pin left — reserve a gutter so the
transcript stays usable"*). Scope the selector.

---

# CONFIRMED CLEAN (positive findings — do not re-investigate)

## The `02-collapse.png` eye-check the orchestrator assigned: Wave 4 Orbit was RIGHT to distrust it
My filmer records `Page.screencastFrame`'s `metadata.timestamp` (page-side capture time) alongside
arrival time and asserts they agree. **They do not.** The rig printed
`!! CDP frames arrived OUT OF CAPTURE ORDER — re-sorted` on `orbit-02-collapse`, on
`orbit-03-handover`, and on `hist-01-open`. So the "panel opens, vanishes and reopens" reading of
`w4orbit/02-collapse.png` is a **frame-ordering artifact of the instrument**. The in-page rAF
trace's clean monotonic 0→260px is the truth. **Orbit's judgement was correct; its sheet was not.**
(Consistent with History's earlier finding that sheets carry Playwright's round-trip latency.)
Re-sorted, the same capture shows DEFECT 1 instead — a different and real problem.

## Phase-trail crispness — measured on ALL 24 takes, not inferred
Wave 4 Orbit measured takes 0/1/3/8 and inferred the rest; the orchestrator flagged that gap.
Closed. Analytic painted-stroke method (`strokeWidth(user) × svgRenderedWidth / viewBox`, including
the element transform), script `04-takes.mjs`, data `takes.json`:
- **22 takes on the shared chrome: current 1.583px / resting 1.342px painted — identical on every
  one.** Comfortably over the 1px floor at dpr 1, so no sub-pixel smear.
- **take 8** (its own rail metrics): **1.622 / 1.350**.
- **take 1** has `noChrome:true` → 0 discs. By design, not a miss.
- `.wa-track` overflow (`scrollWidth > clientWidth`): **false on all 22** at 1440. The clipping
  Orbit found in the default layout is gone.

## All 24 takes animate, and all 24 are visually distinct
Per-take frame-diff over a real step advance: peak 1.90%–7.17%, every take ≥5 frames of
consecutive-frame change. None static, none a duplicate. Montages `film/takes-rest-{0,1}.png`
confirm 24 distinct designs by eye.
- Weakest movers, if anyone wants to push further: **take 8** (5/22 moving frames, peak 2.10),
  **take 4** and **take 18** (6/22).
- Only takes **0, 1, 11** visibly overshoot-and-settle; the rest read as content-swap plus a short
  transient.

## Orbit phase handover — clean in what I sampled
`film/orbit-03-handover.png`: ring rotates, core crossfades 23%→31%, no blanking in the 18 frames
I sampled. I did **not** reproduce Wave 4 Orbit's "core went blank ~40ms" — but I sampled 18 of
~55 frames, so this is **not** a refutation. Needs a dense capture.

---

# (b) LOOKS INTENTIONAL, BUT I WOULD QUESTION IT
- **take 17** renders a row of filled icon chips above a row of **empty outlined cells**.
- **take 21** renders a numbered filmstrip (…3 4 5 **6**) followed by **two or three empty cells**.
- **take 13**'s blueprint ("SCHEMATIC RUN-0043 / QUERY PATH / NODE 06/14 REV DRAFT") is a large
  mostly-empty field with a few faint boxes.
In all three the empty cells may well be "future steps, not yet reached" — but at rest, with no
motion to explain them, they read as unfinished placeholders rather than as a design. Worth a
deliberate decision. See `film/takes-rest-1.png`.

# (c) COULD NOT FILM, AND WHY
Everything under "NOT filmed" in the RESUME block — session ended. No instrument obstacle was
encountered; the rig works and is reusable. The only capture that failed for a technical reason was
`hist-01-open.png` (my clip was placed wrong, fixed in the unrun `06-hist-cross.mjs`).

---

# WORST / BEST — provisional, from the ~35% of the concept I actually filmed
**Worst-looking moment: the orbit collapse at +383ms** (`film/orbit-02-collapse.png`, frame #6).
The outgoing detail panel is still on screen as a greyed ghost while the incoming caption has
already painted below it, separated by a dead band, inside a card that is 271px taller than its
own content — and ~60ms later the whole thing drops 271px in a single frame and throws the rest of
the transcript up the screen with it. It looks like a page that lost a stylesheet for a moment.

**Best-looking moment: the orbit phase handover** (`film/orbit-03-handover.png`). The ring
re-orders its nodes around the circle while the core crossfades its label and its percentage
together, and the trail disc hands off — three things changing at once and none of them snapping.
It is the only sequence I filmed where I could not find an edge to pick at.

**Both are provisional.** I have not seen Menus, Goals, Transcript, Context or Decisions move at
all, and the brief's own history says Decisions was the surface where eyeballing found five
defects. Do not quote these two as the final answer.
