# LENS_LOG — item 9 (Context Lens), instrument repair and re-adjudication

Agent: **W3B** (read-only instrument engineer). Started 2026-08-25.

Snapshot under test (frozen, because another agent is rebuilding `index.html` concurrently):

```
PM56_TARGET = handoff/w6/frozen-9315f951.html
md5 at start = ab94fcc3a25341aa23556bcfbaa9608d   (VERIFIED, matches the brief)
```

No source file is edited by this agent. Everything written lives under `handoff/w6/lens/`
plus this log.

---

## Step 0 — what is being re-adjudicated

`handoff/w5v2/lens-pixels.mjs` produced 15 assertions, **7 red**. Those 7, verbatim from
`handoff/w5v2/lens-pixels.json`, are the docket:

| # | assertion | reported |
|---|-----------|----------|
| R1 | A/A NOISE FLOOR: two baseline paint maps of the same state agree per message | FAIL — 21 msgs, maxAbsDelta 13.4171, **maxRelDelta 0.3676** |
| R2 | the paint map actually sees every message of the 26-message thread | FAIL — measured **21** |
| R3 | NEGATIVE CONTROL: nothing is dimmed relative to baseline at rest | FAIL — **7 dimmed, 6 brighter** at rest |
| R4 | POSITIVE CONTROL: after sealing 25, exactly 25 messages painted dimmer | FAIL — **17** |
| R5 | THE CAP ACCUMULATES: a 26th turn shapes in a second operation, 26 dim not 25 | FAIL — before 17, after 18 |
| R6 | TURN OFF restores EVERY message to within the noise floor of its own baseline | FAIL — stillDim 8, worstRatio 0.6682 (`plain-07`), compared 19 |
| R7 | SELFTEST: forcing `opacity:.42` on every surface makes the detector report every message dim | FAIL — **18 of 21** |

R1, R2, R3 and R7 are *instrument* controls. R4, R5, R6 are *product* claims — and because
R1/R3/R7 were red, none of R4/R5/R6 is safe **in either direction**. The prior session's
ruling stands and is the starting position of this run: item 9 is **un-re-verified**, not
refuted.

## Step 0b — sources read before writing anything

- `lens.js` (638 lines) — the behaviour spec. Extracted contract, in my own words:
  - modes are exactly `mute | focus | subcompact | off` (ACD-192);
  - `MAX_PER_OP = 25`, **per operation, not per thread**; the 26th toggle in one op is
    *refused*, never truncated (`toggle()` returns `{ok:false,reason:'cap'}`);
  - `seal()` freezes the live selection into `ops[]` and empties the buffer, which is the
    mechanism by which the cap accumulates past 25;
  - mute/focus apply live (ACD-193): a live-selected id under mode `mute` already has
    `stateOf() === 'muted'`;
  - `setMode(tid,'off')` runs `releaseAll()` — mode `off`, selection `[]`, ops `[]`.
- `lens.css` (260 lines) — **the paint contract I will measure**:
  - `muted` -> `.message-surface { opacity:.42; filter:saturate(.6) }`
  - `.message:has(...muted):hover > .message-surface { opacity:.72 }` <- **hover confound;
    the pointer must be parked away from the transcript and held there for every frame.**
  - selection -> `outline` on the surface (outline is drawn *outside* the border box, so it
    is outside a `getBoundingClientRect()` crop — deliberate, it keeps the crop clean)
  - entering any mode adds `padding-left:30px` to **every** message that carries an
    affordance -> **the whole transcript reflows the moment the mode changes.**
- `styles.css:153` — `.transcript { overflow:auto; scroll-behavior:smooth; }` (the
  diagnosis on record).
- `app.js:1342` — `restoreScroll(pos)` is
  `requestAnimationFrame(()=>...el.scrollTop=pos[el.dataset.scrollKey])`, called from
  `renderApp()` (app.js:1142). Confirms T2 from the other agent: every lens action calls
  `ctx.renderApp()`, so **every lens action re-writes `.transcript.scrollTop` one frame
  later, through a smooth-scroll animation.** A measurement that scrolls and screenshots
  around a render is measuring a moving target by construction.
- `tests/lens-independent.mjs` (336 lines) — read only to learn *what is claimed*. It
  cross-checks three DOM/model views (`PM56_LENS.slice`, `.pm-lens-mark` attributes,
  `effectiveHistory`). **My instrument reads none of those for its verdicts** — verdicts come
  from painted pixels only. DOM is used solely for the trigger control, where observing the
  state change in the DOM is the point.

## Step 0c — three confounds the old instrument did not account for

1. **Hover.** `opacity:.72` on hover of a muted message. Pointer must be parked.
2. **Reflow on mode change.** `padding-left:30px` appears for every message when a mode is
   entered, so text re-wraps and heights change. Comparing *lens-off* against *mute+selected*
   therefore compares two different layouts. My baseline is taken **inside mute mode with an
   empty selection**, so the gutter reflow is present in both terms and cancels.
3. **Receipts mutate the transcript.** `lens-seal` and `lens-mode=off` call `ctx.addReceipt()`,
   which *appends a message to the thread under test*. Content height grows mid-run and every
   message below moves. Any instrument that keys on scroll offsets rather than element
   identity will crop the wrong pixels after the first seal.


---

# W3B2 — successor run (2026-08-25)

W3B was killed by a usage limit after writing `lens/recon.mjs`, a **phase-1-only**
`lens/lens-pixels-v2.mjs` (it stops mid-file at the A/A gate; there is no phase 2/3/4 and
no `lens-pixels-v2.json`, so **it was never run**), and the 81 lines above.

Snapshot re-verified at the start of THIS run:

```
md5sum handoff/w6/frozen-9315f951.html
ab94fcc3a25341aa23556bcfbaa9608d   MATCHES the brief
```

## Judging the inherited files on their merits

- `lens/recon.mjs` — a plain geometry dump, no verdicts. Sound, reused as-is.
- `lens/lens-pixels-v2.mjs` — **incomplete but its two central ideas are good and I keep
  both**, with one added guard each:
  1. *Tall viewport so `maxScroll === 0`.* A scroll that never happens cannot animate under
     the shot. This is a stronger fix than "force `scroll-behavior:auto`" because it removes
     the scroller from the experiment rather than taming it. I still force
     `scroll-behavior:auto` as well (prescribed repair 1) and I still assert `maxScroll===0`
     every pass. **Added guard:** the tall viewport is itself a change to the system under
     test, so I re-run the whole adjudication a second time at the stock **1440x900** with a
     scrolling paint map, and report both. A finding that only appears at one height is not
     a finding.
  2. *Read verdicts off the standard deviation, not the mean.* Compositing at opacity `a`
     over a uniform backdrop is affine, `P -> aP + (1-a)B`; the mean moves by an amount that
     depends on the backdrop but `sd` scales by exactly `a`. And CSS `saturate()` is built
     from the Rec.709 luma coefficients, so it leaves luminance untouched. Predicted
     falsifiable reading for a muted surface: `sd(muted)/sd(base) = 0.42`. The old file's
     mean-luminance rule is theme-dependent — in a light theme `opacity:.42` makes a message
     *brighter*. **Added guard:** I report mean AND sd for every message, and I replay the
     old file's own mean rule on the new pixels so the two runs are directly comparable.

Everything below is mine and was re-derived from `lens.js` + `lens.css`, not from
`tests/lens-independent.mjs` (which I read only to learn what is *claimed*).

---

## Step 1 — the actual mechanism, measured (new; not previously on record)

The diagnosis on record was `scroll-behavior:smooth` + rects read after the shot, corroborated
by another agent as T2 (`restoreScroll`, app.js:1305/1342, writes a stale mid-flight
`scrollTop` when a render lands inside a smooth scroll). That is real. **What was missing is
what keeps calling `renderApp()`.**

`app.js:1611` — `startWorking()` installs `workTimer = setInterval(..., 2000)`. It is armed at
boot (app.js:1622, `if(state.demoAutoStart && ... selectedThread==='query') startWorking(true)`)
and **`switchThread` never clears it**. So after `PM56_DEMO.selectThread('plain')` the app keeps
re-rendering itself every 2000ms for up to 14 work steps (~28s) — and every one of those renders
runs `captureScroll()` / `restoreScroll()` and re-writes `.transcript.scrollTop` one rAF later,
through a smooth scroller.

Measured on the frozen snapshot with a MutationObserver (`handoff/w6/lens/bench.mjs`):

| 5s window, thread `plain` | DOM mutations | work step |
|---|---|---|
| as booted | **9** | 0 -> 3 |
| after `PM56_DEMO.pauseWorking()` | **0** | frozen |

`handoff/w5v2/lens-pixels.mjs` takes `base1` and `base2` back to back with a full multi-pass
scroll each — around ten seconds of wall clock, i.e. **roughly five unrequested re-renders and
five smooth-scroll animations straddling the A/A pair.** That is the engine behind the 0.3676
floor, and forcing `scroll-behavior:auto` alone would not have fixed it. My predecessor's
`lens-pixels-v2.mjs` had no defence against it either.

So repair 1 is implemented as three things, not one: force `scroll-behavior:auto`, **stop the
clock** with `pauseWorking()`, and then **prove it stopped** with a quiescence control whose
window (2600ms) is deliberately longer than the 2000ms tick.

## Step 2 — the instrument: `handoff/w6/lens/lens3.mjs`

Design, in one paragraph each.

- **Geometry.** Primary run at **1440x6600**, where `.transcript` has `maxScroll === 0` and all
  26 messages paint in ONE frame. A scroll that never happens cannot animate under the shot,
  cannot crop at stale coordinates, and cannot hide five messages behind a "wholly visible"
  filter. `maxScroll === 0` is asserted on every pass. Because a tall viewport is itself a
  change to the system under test, the entire adjudication is **re-run at the stock 1440x900**
  with a scrolling map in `0.4 * clientH` steps.
- **Repair 2, literally.** Rects are read BEFORE the screenshot and AGAIN after. Any message
  whose surface rect moved >0.5px in x/y/w/h, or vanished, is **discarded** — never cropped
  anyway. `scrollTop` moving across a shot discards the whole pass.
- **Metric.** Verdicts are read off the **standard deviation** of crop luminance, not the mean.
  Compositing at opacity `a` over a uniform backdrop is affine, `P -> aP + (1-a)B`: the mean
  moves by an amount that depends on the backdrop, but `sd` scales by exactly `a`. CSS
  `saturate()` is built from the Rec.709 luma coefficients, so it leaves per-pixel luminance
  untouched. Predicted, falsifiable reading for a muted surface: **`sd(muted)/sd(base) = 0.42`**,
  independent of theme. The old file's mean rule is theme-dependent — in a light theme
  `opacity:.42` makes a message *brighter*. Mean and sd are reported for every message and the
  old file's own mean rule is replayed on the new pixels.
- **Crops.** Inset 24px from the surface top and 12px on the other three sides, **in every
  state**, so the compared pixel set is identical whether `.pm-lens-flag` (absolute, `top:-6px`)
  and the selected `outline` + `border-radius:10px` are present or not.
- **Driving.** Every click is `el.click()` in-page, **never** a Playwright click, which would
  move the pointer (hover confound, lens.css:91 `opacity:.72`) and fabricate a phantom ~200ms.
  The pointer is parked at (2,2) once and never moved.
- **Baseline.** lens.css:38 gives every message `padding-left:30px` the moment a mode is
  entered, so the column re-wraps. "Lens off" and "mute" are two different layouts and are not
  pixel-comparable at all. The baseline for every selection claim is taken **inside Mute mode
  with an empty selection**.

## Step 3 — snapshot determinism, established before any verdict

`handoff/w6/lens/probe-determinism.mjs`, 1440x6600, work timer stopped:

```
t0    95a901c5baabf491f08dda67cb95e6ef
t0b   95a901c5baabf491f08dda67cb95e6ef     <- back to back, BIT-IDENTICAL
t3s   95a901c5baabf491f08dda67cb95e6ef     <- 3 seconds later, untouched, BIT-IDENTICAL
```

Tile diff (60x60 tiles, all channels): `t0 vs t0b` = 0 differing pixels; `t0 vs t3s` = 0.
So the A/A floor of exactly **0.0000** reported below is a real property of the frozen page
once the work timer is stopped, not a stuck instrument — the same pipeline reports 48,692
differing pixels the moment one message is dimmed.

One residue, reported because it is the only non-determinism found: adding and then removing a
`filter` on one message leaves **17 pixels** differing at a maximum channel delta of **3/255**,
in two tiles at x=1380 — the transcript's right padding / scrollbar-gutter column, not inside
any message crop. That is Chromium layer promotion for `filter`, it is sub-perceptual, and it is
outside every crop this instrument reads (C-REVERT measures `maxSdRel 0` across all 26).

## Step 4 — two things the controls caught in my own instrument

Recorded because "five instruments have failed here in two days" and both of these produced
plausible output first.

**(a) A count anomaly that turned out NOT to be a defect.** After Seal, my DOM signature
reported `messages: 26` — unchanged — although `lens-seal` calls `ctx.addReceipt()`, which
appends a message to the thread under test. That looked like "the receipt that makes the seal
non-silent is never rendered". Probed directly (`handoff/w6/lens/probe-receipt2.mjs`):

```
AFTER SEAL   modelMsgs 27   domMessageEls 26   domArticles 27
             innerChildren tail: [ message message-user|plain-25,
                                   message message-assistant|plain-26,
                                   event-card | ]
             /Mute operation sealed/ present in .transcript innerText : true
```

The receipt IS rendered and IS visible — as `article.event-card`, not as `.message`, so it
carries no `data-message-id`. **No defect.** It also explains why the measured set stays exactly
26 across seals: receipts are not messages. Reported because a harness that counted
`.transcript .message` and expected growth would have filed a false red here.

**(b) A real defect in MY instrument, which the 1440x900 cross-check exposed and the tall
viewport could never have.** First stock-height run failed R5 and R6 — but with
`stillDim: []`, `bright: []` and `comparable: 25`. One message had been silently dropped:

```
R6 geomChanged: [{ id: "plain-26", px: 97 }]
mute0  maxScroll 4356      sealed / after26  maxScroll 4481      off2  maxScroll 4471
```

`compare()` guarded geometry using **viewport-relative** crop coordinates. The seal appends its
`event-card` receipt below the thread, `maxScroll` grows by the card's height, so the final
scroll pass lands 125px further down and `plain-26` is captured at a different *viewport* y —
while its *document* position never moved. The instrument discarded `plain-26` as "moved 97px"
**in the very comparison that was about plain-26**. Fixed by recording the scroll offset each
message was captured at and comparing in document space (`crop.y + scrollTop`); x/w/h are
scroll-invariant and unchanged.

Note the shape of this: it is the same class of error as the one on record for the old
instrument — coordinates that moved under the image — just displaced from within a frame to
across two frames. It is invisible at 1440x6600 because nothing scrolls. **A finding that
appears at only one viewport height is not a finding**, and that is why the cross-check exists.

Second hole closed at the same time: R4 had **passed** at 1440x900 with only 25 of 26 messages
paired. Adjudicating on a subset without saying so is exactly how the old run adjudicated on 21
of 26. Every product verdict now requires a full 26-way pairing, and a named `C-PAIRS` control
reports the pairing of every comparison whatever it shows.

---

## Step 5 — results

Two full runs of `lens3.mjs` against the frozen snapshot, identical adjudication, different
viewport height. `handoff/w6/lens/lens3-h6600.json` and `lens3-h900.json`.

| | 1440x6600 (no scroll) | 1440x900 (stock, 19-20 scroll passes) |
|---|---|---|
| checks | **37 pass / 0 fail / 3 info** | **37 pass / 0 fail / 3 info** |
| A/A floor, sd (verdict metric) | **0.0000** | **0.0000** |
| A/A floor, mean (old file's metric) | **0.0000** | **0.0000** |
| A/A floor inside Mute, empty selection | **0.0000** | **0.0000** |
| coverage | **26 / 26**, twice | **26 / 26**, twice |
| messages discarded for a moved rect | 0 | 0 |
| comparisons decided on a subset | 0 (C-PAIRS: all 7 comparisons paired 26/26) | 0 |

**A/A floor achieved: 0.0000 relative, against a gate of 0.02 and a signal of 0.58.** The old
run's 0.3676 was self-inflicted, not a property of the page: with the work timer stopped the
frame is bit-identical across a 3-second wait (Step 3).

### Every control, and what it showed

| control | result |
|---|---|
| **A/A floor** (same state twice) | 0.0000 at both heights, on both metrics, and again inside Mute mode. Gate 0.02. |
| **Positive control** (forced `opacity:.42 + saturate(.6)` on every surface) | detected on **26 of 26**, both heights. Old run: 18 of 21. |
| **Predicted-value control** | measured sd ratio **0.4195 – 0.4228** against the algebraic prediction **0.42**. The instrument does not merely detect a change, it lands on the number the CSS implies. |
| **Discriminative positive control** (forced dim on 7 NAMED messages) | exactly those 7, **0 false positives, 0 false negatives**. This is also the crop-alignment proof: crops are bound to the right message ids. |
| **Revert control** | removing the forced style returns all 26 to `maxSdRel 0`. The detector is not sticky. |
| **Trigger control** (4x, in the DOM) | Mute entry 0 -> 26 gutter controls; 25 toggles -> exactly the 25 named ids checked; Seal -> live checks 25 -> 0 and 25 sealed flags appear; Turn Off -> controls **gone** (0), flags 0. Every action provably changed lens state before any pixel was read. |
| **Far control** (editor pane + transcript's own left-padding neighbour strip, same frame) | `meanRel`/`sdRel` **0.00000** in every phase, including the frames where 25 and 26 messages really changed. `FAR-history` moves by 0.0002 after a receipt and is reported, not asserted — `appendMessage` sets `thread.updated='now'`, so the history row legitimately repaints. |
| **Coverage control** | 26/26 in all 14 paint maps across both runs. |
| **Pairing control** (added after it caught a hole) | all 7 adjudicated comparisons paired 26/26 at both heights. |
| **Quiescence control** | 0 DOM mutations over 2600ms (longer than the 2000ms work tick), `work.running false`, `scrollTop` unmoved. |
| **Hover control** | `.transcript .message:hover` empty in every measured frame; pointer parked at (2,2), all clicks via in-page `el.click()`. |
| **Paint-lag control** (info) | a screenshot taken with **no settle at all** already showed the forced dim on 26/26 — Playwright's `page.screenshot()` is not behind the DOM here. (This is not CDP screencast; the screencast lag warning still applies to `makeFilmer`.) |
| **Console / page errors** | 0 across every run. |

### The seven original reds, adjudicated individually

| # | original claim and reading | verdict | evidence |
|---|---|---|---|
| **R1** | A/A floor FAIL, `maxRelDelta` 0.3676 | **CONFIRMED as an instrument fault, and its cause is now identified.** The floor really was 0.3676 in that rig; it was not a property of the page. Cause: the `setInterval` work tick (app.js:1611) re-rendering ~5 times across the A/A pair, each render re-writing `scrollTop` through a smooth scroller. Fixed floor: **0.0000**. | `lens3-h6600.json`, `bench.mjs` |
| **R2** | only 21 of 26 messages measured | **CONFIRMED as an instrument fault.** Two causes: the "wholly visible" filter applied to the full surface rect while the scroller was mid-animation, and rects read after the shot. Fixed: **26/26 at both heights**, including at the stock 1440x900 where the transcript really does scroll. | both JSONs |
| **R3** | negative control FAIL — 7 dimmed + 6 brighter **at rest** | **REFUTED.** At rest, with the app quiesced, **0 dimmed and 0 brighter**, on the sd rule *and* replayed under the old file's own mean rule. The 13 implicated messages were the moving scroller, not paint. | R3, R3b |
| **R4** | positive control FAIL — 17 dim after sealing 25 | **REFUTED. The product behaves correctly.** After selecting 25 and sealing, **exactly 25** messages are painted dimmer than their own in-mode baseline — the exact named set, 0 unexpected, 0 missing, 0 brighter, over a full 26-way pairing, at both heights. Median sd ratio **0.4213** against the predicted 0.42. | R4, R4b |
| **R5** | cap accumulates FAIL — before 17, after 18 | **REFUTED. The product behaves correctly.** Baseline 25 dim; after a 26th turn is selected in a second operation, **26** dim; all 25 retained; nothing brightened back. Also measured, which the old run never tested: the cap is a **refusal, not a truncation** — the 26th toggle *inside* the first operation leaves 25 dim, not 26 (`P-CAP`). | R5, R5b, P-CAP |
| **R6** | Turn Off FAIL — 8 still dim, worst `plain-07` at 0.6682, only 19 compared | **REFUTED. The product behaves correctly.** After Turn Off, **0 still dim, 0 brighter, 26 of 26 compared, `maxSdRel` 0.0000** against each message's own lens-off baseline — bit-identical restoration. `plain-07`'s 0.6682 does not reproduce. Also holds under the old file's own mean rule. | R6, R6b, R6c |
| **R7** | selftest FAIL — detector saw 18 of 21 | **CONFIRMED as an instrument fault.** A detector that misses 3 of 21 messages it is told to find is broken. Fixed: **26 of 26**, at both heights, landing on the predicted 0.42. | R7, C-PRED |

Four of the seven were the instrument (R1, R2, R7 confirmed as instrument faults; R3 refuted
outright). The three product claims — **R4, R5, R6 — are REFUTED: Mute is correct in pixels.**

### Item 9, beyond the seven reds

The seven reds are all about **Mute**. ACD-192 defines four modes, so `lens3-modes.mjs` +
`probe-focus.mjs` + `probe-focus2.mjs` measure the other two by the same rules.

**Subcompact — clean, 8/8.** Does not apply on toggle (ACD-193: 0 collapsed, 0 cards, 6 checked);
Apply produces exactly one summary card; all 6 selected turns stop painting with the head
keeping its article (`plain-05(surface-hidden)`, the other five gone entirely, exactly as
lens.css:113 specifies); all **20** turns outside the range are pixel-identical after the
column shortens; Turn Off restores all 6 and removes the card; all 26 crops return to their
original size.

**Focus — one new defect, below.**

---

## Step 6 — NEW DEFECT: focusing a turn moves every turn below it

`lens.css:95` states its own invariant in a comment:

> "A soft field plus a ring, with negative margins compensating the padding so neighbouring
> turns never shift."
> ```css
> .message:has(> .pm-lens-mark[data-lens-state="focused"]) > .message-surface {
>   padding: 9px 11px;  margin: -9px -11px; }
> ```

**Measured: neighbours shift in every case tested — 12 of 12 messages, at 1440 width.**
Turns *above* the focused one never move (correct); every turn *below* it jumps.

| role | article height delta when focused | turns below shift by | n |
|---|---|---|---|
| user | **-22.00px** (identical every time) | -22.00px | 6 of 6 |
| assistant | **+21.25px** or **+42.30px** | +21.25 / +42.30px | 6 of 6 |

Mechanism, and it is two different bugs wearing one comment:

- **Assistant turns** (`styles.css:158`, `.message-assistant .message-surface{padding:0 2px}`).
  The negative margin does correctly absorb the *vertical* padding. But horizontal padding goes
  `2px -> 11px`, taking **18px out of the text column**, so the body re-wraps and gains one or
  two lines at `line-height: 21.06px`. **+21.25px / +42.30px is re-wrap, not box math.** The
  margins cannot compensate a re-wrap.
- **User turns** (`styles.css:157`, `.message-user .message-surface{padding:11px 13px}`). Here
  the rule does not *add* padding to a zero-padding surface, it **replaces a larger one**:
  vertical `11px -> 9px` is **-4px**, and then `margin:-9px` subtracts **18px** that was never
  added. `-4 - 18 = -22px`, exactly the constant measured on all six user bubbles. The negative
  margin is over-compensating by 18px on every user turn.

Consequence for a reader: clicking Focus on a turn makes the rest of the transcript jump under
the pointer — up 22px for a user turn, down 21-42px for an assistant turn. The `outline`-based
selection was chosen precisely so that "nothing shifts when a message is picked" (lens.css:76);
that goal is met for selection and missed for the applied Focus state.

Not fixed here — this agent is read-only and does not edit source.

### One thing I could not measure, stated plainly

**"Focus paints exactly the selected turns and nothing else" is UNMEASURABLE by this
instrument, in the tint direction.** A focused turn's own pixels change for two reasons at once
— the accent tint *and* the re-wrap caused by the same rule — and the two cannot be separated
by cropping, because the crop itself changes size. `M-F-PAINT` in `lens3-modes.json` is red and
**must not be read as a product finding**: it froze its crop rectangles from the baseline, which
is only valid if nothing moves, and Step 6 shows things move. Its six "false positives" are
stale coordinates — the same class of error this whole wave exists to stop, so it is recorded
rather than deleted.

The half that IS measurable was measured and is green (`probe-focus.mjs` F5): cropping every
message at its **own current position** with a width/height guard, all **21** unselected turns
that kept their crop size are **pixel-identical** after five turns are focused. So Focus does
not leak paint onto turns it did not select. Whether the five selected turns receive the
*specific* tint lens.css:95 describes, as opposed to merely changing, is **not settled**, and
the honest reading is: not measured, not refuted.

Also not measured: the `source` (rehydrated) state, `lens-release` per-operation restore, any
theme other than the stock `basic-dark`, and any viewport width other than 1440 (at <=1100px
`lens.css:234` withdraws the header trigger, so the wand submenu is the only entry point).

---

## Step 7 — verdict on item 9

**The Context Lens dims the right messages. R4, R5 and R6 are REFUTED; the three product
claims the old run reported as broken are correct in painted pixels, at two viewport heights,
against a 0.0000 noise floor with 26/26 coverage and every control green.** Mute applies live,
the 25-per-operation cap is a refusal rather than a truncation, operations accumulate past 25,
and Turn Off restores every message bit-identically. Subcompact is clean on all 8 checks.

**Item 9 is not fully green: Focus carries a new layout defect** (Step 6) in which focusing a
turn shifts every turn below it by -22px (user) or +21-42px (assistant), against the invariant
its own source comment claims. And one Focus claim could not be measured at all.

Four of the seven original reds (R1, R2, R7 confirmed as instrument faults, R3 refuted) were
never about the product. The prior ruling — *un-re-verified, not refuted* — was the correct
call on that evidence; it is now re-verified.

### Files

```
handoff/w6/lens/lens3.mjs           the instrument (both heights, --height 900)
handoff/w6/lens/lens3-h6600.json    37 pass / 0 fail   primary run
handoff/w6/lens/lens3-h900.json     37 pass / 0 fail   stock-viewport cross-check
handoff/w6/lens/lens3-modes.mjs     focus + subcompact          (14 pass / 2 fail, both Focus)
handoff/w6/lens/lens3-modes.json
handoff/w6/lens/probe-focus.mjs     focus shift, characterised  -> probe-focus.json
handoff/w6/lens/probe-focus2.mjs    focus shift, per role       -> probe-focus2.json
handoff/w6/lens/probe-determinism.mjs   snapshot is bit-identical at rest
handoff/w6/lens/probe-receipt2.mjs      receipts render as article.event-card (no defect)
handoff/w6/lens/bench.mjs               the work-tick measurement
handoff/w6/lens/recon.mjs               inherited from W3B, geometry only
handoff/w6/lens/lens-pixels-v2.mjs      inherited from W3B, phase 1 only, NEVER RUN
```

Snapshot md5 at end of run: `ab94fcc3a25341aa23556bcfbaa9608d` — **unchanged**, matches start.
No source file was edited by this agent; `git status` shows only `handoff/w6/lens/` and this log.
