# Wave 6 — W4A fixes log

Tree owner: W4A. Baseline verified before any edit:
`python3 build.py --check` -> `Build check passed. Both deliverables match sha256 ae6c3916d73a655c.`
`node tests/audit.mjs reports/audit.json ./tests` -> `447 pass / 0 fail / 0 console / 0 page`.

Instrument: `handoff/w6/fixes/g1-probe.mjs` (frame-clock trace + CDP screencast ink with a
spatial neighbour control). Outputs in `handoff/w6/fixes/`.

---

## Fix 1 — G1: a completed goal row vanishes and re-arrives

### Mechanism (as confirmed, re-read in the source before editing)

- `goals.css` put `animation:goal-phase-arrive var(--spring-soft) both` on `.goal-phase`
  **unconditionally and permanently** (`--spring-soft` = 440ms, styles.css:10).
- The only thing suppressing it was `.goal-phase.completed[data-wipe="1"]`, which replaces
  `animation-name` with `goal-phase-complete`.
- `goals.js`'s `wipeFlag()` gave `data-wipe="1"` a **420ms lifetime** and scheduled no render.
- So on whatever render happened next after 420ms, `data-wipe` disappeared, `animation-name`
  flipped **back** to `goal-phase-arrive`, and a changed `animation-name` **restarts** the
  animation on a live, already-visible node. The row replayed its entire entrance from
  `opacity:0; clip-path:inset(0 0 100% 0)`.
- Node identity confirmed unchanged across the vanish (stable WeakMap token in the trace),
  so this is a live element restarting its entrance, not a re-mount.

### Change

`goals.css`
- `.goal-phase` no longer declares `animation`.
- New rule `.goal-phase[data-arrive="1"]{animation:goal-phase-arrive var(--spring-soft) both}`.
- The reduced-motion stop rule was extended to the new selector, or it would have stopped nothing.

`goals.js`
- New `arrived` map + `arriveFlag(p)`: a phase id gets `data-arrive="1"` on its **first mount
  only**, never again. `arrived` is cleared in `seedSettled()` so Reset really resets.
- The commit of "this id has arrived" is deferred to the end of the task rather than done
  inline, because one task can legitimately paint the same phase list twice (Activity panel
  and goal editor) and both copies must get the entrance.
- `wipeFlag`'s timer 420ms -> 520ms. **This is not the fix** — it only stops the 520ms
  `goal-phase-complete` wash being torn off ~85% through by a render landing in the old
  100ms gap. Lengthening a finite guard would only have moved G1 later; the actual guard
  (`arriveFlag`) is permanent, which is what makes its lifetime match the threat's.

The same guard also removes the arrival half of G10/G12 in advance: the keyed patch
re-**inserts** rows on a reorder or a status change (`data-k` embeds status and is-current),
and Blink restarts CSS animations on re-insert.

### Negative control

Reverted `goals.js` + `goals.css` to the pre-fix copies, rebuilt (sha back to
`ae6c3916d73a655c`, so the revert was exact), re-ran the same instrument.

| limb | what it asserts | reverted build | fixed build |
|---|---|---|---|
| L1 | `animation-name` never becomes `goal-phase-arrive` after settle | **RED** 1049.9..2616.6ms (93f) | green |
| L2 | computed opacity never < 0.9 after settle | **RED** 4f, min **0.491** | green |
| L3 | `clip-path` never re-applied after settle | **RED** 93f, `inset(0px 0px 74.9132%)` | green |
| L4 | row stays in `elementsFromPoint` (plural) | **RED** 2f | green |
| L5 | screencast ink vs spatial neighbour control | **RED** 6f, target ink -> **0** while neighbour held 3742, first at +1144.4ms | *MEASURED NOTHING* |

Also green under `prefers-reduced-motion: reduce` (`RED=1`), where the defect had been a
two-state hard blink.

Stated plainly, not folded into the green:

- **L5 reads "MEASURED NOTHING" on the fixed build, not "green".** That is correct and
  intended: its own reach control (a concurrent rAF sampler on the row's computed style)
  reports `minOpacity=1 clippedFrames=0/125 names=goal-phase-complete|none` — there is no
  vanish left for the pixels to record. Its ability to go RED was demonstrated on the
  reverted build, where the same code read `minOpacity=0 clippedFrames=80/120
  names=goal-phase-complete|goal-phase-arrive` and ink 0.
- **L5 produced two false greens before it was trustworthy**, both recorded in the file's
  comments: (1) it cropped a band captured *after* the induced render had moved the row, so
  it was reading a neighbour's pixels; (2) the two control films take seconds of wall clock,
  and with the completion fired before them the replay finished in that gap, so the
  measurement film recorded a settled row. Both produced a plausible green on a build the
  timing limbs called red. The band is now taken before the film and re-checked after, the
  completion happens inside the measurement film, and a window in which the replay never
  started reports "MEASURED NOTHING" instead of passing.
- The instrument also carries a **reach control**: if `data-wipe` never drops inside the
  window, the vanish cannot occur, and the run aborts with no verdict rather than a green.
  Both builds reached it (`wipe-dropped-at` 1049.9ms / 1066.6ms).
- Measured rAF gap here was **16.7ms median** (60fps), not the ~30fps noted in the brief;
  no timing claim below one frame is made either way.

### Rebuild + audit

```
python3 build.py         -> Built index.html and the standalone (sha256 e760840fb873d455).
python3 build.py --check -> Build check passed. Both deliverables match sha256 e760840fb873d455.
node tests/audit.mjs reports/audit.json ./tests -> 447 pass / 0 fail / 0 console / 0 page
```

---

## Fix 2 — T1: a sent message is never scrolled to

### Mechanism

`appendMessage()` had always followed its `renderApp()` with a
`requestAnimationFrame(() => tr.scrollTop = tr.scrollHeight)`. `handleSend()` pushes the
user's turn onto the thread itself and calls `renderApp()` with no such follow-up, so the
new message landed **2787px below the fold** and stayed there.

### Change (app.js only)

- The existing rAF scroll was given a name, `scrollTranscriptToEnd()`, defined immediately
  above `appendMessage`.
- All three verbatim copies of it (`appendMessage`, `switchThread`, boot) now call the named
  function — one mechanism, not four. The literal line `  renderApp(false);` that
  `build.py:68` matches is untouched, indentation included.
- `handleSend()` calls `scrollTranscriptToEnd()` after its `renderApp()`.

### Negative control

Instrument: `handoff/w6/fixes/t1t2-probe.mjs`. Reverted `app.js` to the pre-fix copy, rebuilt
(sha back to `e760840fb873d455` — the exact post-Fix-1 build, so the revert was clean).

| | reverted build | fixed build |
|---|---|---|
| first frame the sent message was in view AND hit-tested by `elementsFromPoint` | **never** | +700ms |
| held for the rest of the 3s window | **false** | true |
| worst distance below the fold | 3062px | (in view) |
| screenshot-crop ink on the message's own band | *NOT APPLICABLE — nothing on screen to crop* | 17.8% vs 2.3% padding control — painted |
| verdict | **RED** | green |

Stated plainly:

- **The first negative-control run returned no verdict at all, and that was the control
  working.** Its spatial control was the thread's FIRST message, asserted off-screen — but on
  a build where the transcript never scrolls, the first message *is* on screen, so the probe
  correctly refused ("BLIND — the predicate calls that one visible too") rather than
  reporting red for the wrong reason. The control is now the message furthest from the fold,
  which is off-screen at any scroll position in a transcript 2962px taller than its box.
- The probe carries a reach control (`user messages 5 -> 6; transcript scrollable by 2962px`)
  so a run in which nothing was appended, or a transcript short enough that top and bottom
  are the same place, reports "MEASURED NOTHING" instead of green.
- **+700ms to arrive is the `scroll-behavior:smooth` animation, not latency.** It is not a
  defect but it is not nothing either; see Fix 3.

### Rebuild + audit

```
python3 build.py --check -> Build check passed. Both deliverables match sha256 a0c9c0a2b9e414cf.
node tests/audit.mjs reports/audit.json ./tests -> 447 pass / 0 fail / 0 console / 0 page
```

T2 was measured RED throughout both of the above runs (`parked at 0 of 2962`), i.e. Fix 2 did
not accidentally fix or mask it.

---

## Fix 3 — T2: the transcript boots parked at the top, permanently
### (and the `workTimer` leak the coordinator forwarded from the Lens agent)

### Mechanism

Two independent defects that compound, **not** one defect seen twice (proved below).

1. **Stale mid-flight capture.** `.transcript` carries `scroll-behavior:smooth`
   (`styles.css:153`, out of my scope and not edited), so every programmatic `scrollTop`
   write *animates*. `captureScroll`/`restoreScroll` bracket every patch, so a render landing
   inside that animation captures a position the scroller is only passing **through** and
   writes it back a frame later, cancelling the animation and parking the scroller there.
2. **`switchThread` never cleared `workTimer`.** Every other path that abandons the work
   sequence — `pauseWorking`, `stepWorking`, `completeWorking`, `resetWorking`,
   `globalReset`, `inspect-work-step`, `PM56_DEMO.setWorkStep` — already did. So the app
   re-rendered itself every 2s, unprompted, in whatever thread the reader had switched to.
   That does not *cause* (1), but it turns "a render can land inside a scroll" into "a render
   is guaranteed to, every two seconds".

### Change (app.js only — `styles.css` was not touched)

- **Scroll custody.** A commanded scroll registers an **intent** (`scrollIntents`);
  `captureScroll` reports the intent instead of the live offset while one is active.
  `'end'` is stored as a **sentinel, not a number**, so it stays correct when the patch that
  ran in between grew the content.
- `restoreScroll`: an `'end'` intent re-aims at the bottom and is left **smooth** (the
  commanded scroll owns the scroller and may need re-aiming at grown content); a numeric
  restore is written with `scroll-behavior:auto`, because a restore re-applies a position and
  is never a journey to one — left smooth, the restore is itself an in-flight scroll for the
  *next* render to misread.
- Intents are dropped on `wheel`/`touchstart` (the reader taking over) and expire after
  1600ms. `keydown` is deliberately **not** in that list: typing is not scrolling, and
  Ctrl+Enter would cancel the intent the send it triggered had just registered.
- The **boot** call is the one that scrolls instantly (`scrollTranscriptToEnd(true)`) — the
  transcript's opening position, not a 2962px journey to it. Sends and thread switches keep
  their smooth scroll.
- **Leak:** the interval body moved into a single `armWorkTimer()`; `switchThread` now calls
  `stopWorkTimer()` and clears `state.work.running` with it, so a card can never say
  "running" with no timer behind it. The one demo trigger that legitimately wants a live
  sequence after a thread switch (`'Live subagents'`) now arms its own timer instead of
  inheriting a leaked one.

### Negative control

| limb | pre-Fix-3 (`a0c9c0a2b9e414cf`) | leak fix ONLY (`125bf39d5c896bf8`) | full Fix 3 (`bd9567e020dbbe4f`) |
|---|---|---|---|
| T2 boot position | **RED** — `0/2380`, never reached the end, best 2380px short | **RED — identical**, `0/2380`, never reached the end | green — `0/2380` at +149.6ms -> `2380/2380` at +245.4ms |
| T2 backwards travel | 0px (it never moved at all) | 0px | 0px |
| LEAK mutations/5s after a thread switch, nothing clicked | **RED — 6**, `state.work.running=true` | green — 0, `running=false` | green — 0, `running=false` |
| LEAK positive control (boot thread, sequence running) | 72 | 72 | 62 |
| T1 | green (Fix 2 present) | green | green |

**Answer to the coordinator's question 2: T2 and the timer leak are two defects, not one.**
With the leak fixed and scroll custody deliberately left out, T2 reproduced *exactly* as
before — `0/2380`, never reaching the end. The boot thread's own legitimately auto-started
sequence renders often enough on its own to hold the transcript at the top. The leak makes
T2 worse in real use and would have made any short trace of it flaky; it is not its cause.

Stated plainly:

- **T2 is green on "boots at the bottom and never travels backwards", not on "is at the
  bottom five seconds later".** It ends **582px above** the bottom, because the bottom
  *moved*: the demo's working card grows the transcript by exactly 582px while it runs, and
  the reader's position is then correctly preserved rather than auto-followed. That is a
  product decision I did not make on my own authority — if the transcript is meant to stick
  to the bottom while a working card grows, that is a further change and it is not in this
  fix.
- The leak limb reads **6** mutations on the broken build against **72** on its own positive
  control. The gap is real but small because the thread it switches to has no working card,
  so each unrequested render mutates fewer nodes. The unambiguous part is
  `state.work.running=true` with the reader in a thread that never started a sequence,
  versus `false` after.
- The **T2 measurement had to be rebuilt** to be worth anything: the first version started
  sampling after Playwright had already settled the page, so it missed the boot entirely and
  reported a post-hoc position. It now installs its sampler with `addInitScript` and reloads,
  so the first sample is at +149.5ms, when the transcript element first exists.
- The **T1 pixel limb also had to be rebuilt**: an ink count against a "transcript padding"
  control band reported *INDISTINGUISHABLE FROM EMPTY* on a build where the message was
  plainly painted, because at the new scroll offset that band held text. It is now a colour
  read — the user bubble's own `background-color` fills **81.2%** of the message band and
  **0%** of a left-gutter control band the right-aligned bubble never occupies.

### Rebuild + audit

```
python3 build.py --check -> Build check passed. Both deliverables match sha256 bd9567e020dbbe4f.
node tests/audit.mjs reports/audit.json ./tests -> 447 pass / 0 fail / 0 console / 0 page
```

---

## Item 4 — G2: completing a phase blocks the main thread

### NOT LANDED. Measured, diagnosed, and deliberately not fixed. No source edit survives.

Instrument: `handoff/w6/fixes/g2-probe.mjs` (synchronous block via `performance.now()` around
the click dispatch — which is what it is for; frame cost counted separately off the rAF frame
clock, against that browser's own measured baseline gap, with a menu as reference control).

```
frame-clock baseline gap = 16.7ms
  open a menu (renderOverlays)              sync block  17.1ms   worst gap  50.1ms
  bare renderApp (PM56_DEMO.pinActivity)    sync block  69.1ms   worst gap  83.4ms
  goal-agent-step (agentStep + renderApp)   sync block  79.5ms   worst gap  83.2ms
  goal-agent-step again                     sync block  95.3ms   worst gap 100.0ms
```

The brief's numbers reproduce (79.5–95.3ms vs the stated 72.8–90.2ms). **But its premise does
not hold up.** The brief says "the cheap path exists and Goals simply is not taking it".
Measured, the cost is not something Goals is doing:

- A **bare `renderApp()` with no goal work in it at all costs 69.1ms**. `agentStep()` itself
  is only the ~10ms difference.
- A throwaway instrumented build (applied, measured, reverted; `build.py --check` re-verified
  afterwards) breaks that down as: **`pmPatch` 24ms**, `renderChat` 5.8ms, `renderEditor`
  0.6ms, header/status ~0ms. The cost is generating, parsing and diffing the whole
  application's HTML on every render — it scales with the document, not with the change.
- `renderOverlays()` is cheap because `#pmOverlayRoot` is a small tree, not because menus are
  written better. **Goals cannot use it**: goal state is projected into at least four
  *in-tree* surfaces — the header chip (`headerExtras`), the history chrome
  (`historyChrome`), the Activity panel section (`goalSection`) and the editor document
  (`goalEditor`) — two of which are fed `extra` data (`{thread}`, `{flyout,groups}`) computed
  inside their callers and not reconstructable from outside.

So the real fix is a **scoped/region render in the app's render pipeline**, not a goals.js
change. I did not land it: a scoped patch that misses one of those surfaces converts a 45–95ms
stall into a **stale surface**, which is a worse defect than the one being fixed, and I could
not bound "which surfaces show goal state" to my own module's knowledge. I would rather hand
this over honestly than ship a fast, wrong panel.

Recommended for a follow-up wave, with the measurement above as the starting point.

**Incidental finding, not acted on:** `goal-phase` (opening a phase drill-in) calls
`renderApp()` **twice** per click — 69ms paid twice for one disclosure. `goal-agent-step` and
`goal-toggle` call it once. Verified by counting `renderApp()` entries in an instrumented
build. Worth a look; not in my six items and not investigated further.

---

## Item 5 — G10 / G11 / G12: phase mutations that animate backwards or not at all

### PARTLY ADDRESSED BY FIX 1. The FLIP opt-in was NOT started in source. No source edit exists.

- **The arrival half is fixed**, as a consequence of Fix 1 rather than as separate work. The
  keyed patch re-**inserts** phase rows on a reorder and re-**creates** them on a status change
  (`data-k` embeds status and is-current), and Blink restarts CSS animations on re-insert —
  which is why "the row it passes replays a 440ms entrance from `opacity:0`" (G10),
  "two rows replay an arrival" (G12) and "the status change is animated as an arrival" (G11).
  Fix 1's `data-arrive="1"` is one-shot per phase id, so no already-mounted row can be handed
  a fresh entrance by any later render. Verified for the completion path (G1's five limbs);
  **not** separately verified for the reorder/reopen/unblock paths.
- **The movement half is NOT fixed.** `goals.js` still does not carry `data-flip-move`, so
  `flipMoves` never sees the rows and the 57px / 19.2px / ~241px shifts still land in one
  frame. The intended change was a single attribute on the phase `<li>`; **it was never
  written to the source.** `goals.js` is byte-identical to its post-Fix-1 state.
- The instrument for it exists and works — `handoff/w6/fixes/g1012-probe.mjs`, frame-clock
  trace of every row's top edge, judged by largest-single-frame step as a fraction of the
  trip, with an idle control (0px movement in a still list) and a trigger control. It is **not
  yet producing a verdict**: its last run reported `NO-OP`/`MEASURED NOTHING` for all three,
  because reaching these three actions through the shipped UI needs more setup than it
  currently does (the first "move earlier" button is a no-op on row 1; reopen and unblock need
  the right drill-in open). **Nothing in that file has been shown to go red yet — treat its
  output as unqualified.**

---

## Item 6 — the decision-take reduced-motion split (`questions.css:461`)

### NEVER STARTED. `questions.css` is untouched (confirmed: no diff against git HEAD).

The one-line change is unwritten. For the next session: the enumeration at `questions.css:461`
currently reads

```css
.qs-card, .qs-sheet, .qs-inspector, .qs-morph-field, .qs-fold, .qs-step-live, .qs-stack-live{
  animation-duration:1ms;
}
```

and needs `.decision-surface` added to it so takes 0/1/2/3/6 — which fall through to
`decision-enter` on `.decision-surface` — agree with 4/5/7. `motion.css` must not be touched
and no other module's reduced-motion behaviour may change.

---

# Final state at hand-back

`python3 build.py --check` -> **`Build check passed. Both deliverables match sha256 bd9567e020dbbe4f.`**

Last audit run, after Fix 3 and before the G2 investigation:
`node tests/audit.mjs reports/audit.json ./tests` -> **`447 pass / 0 fail / 0 console / 0 page`**.
The audit has **not** been re-run since, because no source file changed after it: the G2
instrumentation was applied, measured and reverted, and `build.py --check` re-confirms the
same sha the audit ran against. Items 5 and 6 never touched a source file.

| item | state | negative control run? |
|---|---|---|
| 1. G1 goal row vanish/re-arrive | **DONE** (`goals.js`, `goals.css`) | **Yes** — reverted to `ae6c3916d73a655c`, 5/5 limbs went red, restored and all green; also green under reduced motion |
| 2. T1 send does not scroll | **DONE** (`app.js`) | **Yes** — reverted to `e760840fb873d455`, went red ("never came into view", 3062px below the fold), restored and green |
| 3. T2 stale mid-flight scrollTop | **DONE** (`app.js`) | **Yes** — reverted to `a0c9c0a2b9e414cf`, went red (`0/2380`, never reached the end), restored and green |
| 3b. `workTimer` leak (coordinator) | **DONE** (`app.js`) | **Yes** — red at 6 unrequested mutations with `state.work.running=true`; green at 0 / `false`, against a positive control of 62–72 |
| 4. G2 main-thread block | **NOT LANDED** — measured and handed over | n/a (nothing landed) |
| 5. G10/G11/G12 FLIP adoption | **arrival half fixed via Fix 1; movement half NOT STARTED in source** | Fix 1's control covers the completion path only; the reorder/reopen/unblock paths are **unverified** |
| 6. `questions.css:461` | **NEVER STARTED** | n/a |

No fix was landed without its negative control being run.
No source file is in a partial state; `styles.css` and `motion.css` were never edited.

---

# Closeout wave — continuation (2026-08-25)

Baseline on arrival: sha `bd9567e020dbbe4f`, audit 447/0/0/0.

## Landed

| id | change | negative control |
|---|---|---|
| RM | `questions.css` — added `.decision-surface` to reduced-motion 1ms list | take 7 under reduce: `decision-enter` duration `0.001s` |
| D1 | `app.js` — `closeDecision()` keeps last surface under `.empty` through max-height collapse | 14 distinct heights, 17 ramp frames; kids=1 while empty |
| D2/D3 | `questions.js` take7: actions outside scroll; `questions.css` ≤400 aside capped 72px, main min 180px | vw360 after settle: ansReach+nextReach true; mainH~246 |
| L1 | `lens.css` Focus: layout-neutral (no padding/margin) | probe-focus style: worst neighbour shift 0px |
| T6 | `styles.css` `.transcript{overflow-anchor:none}` | computed `overflow-anchor:none` |
| G10–12 | `goals.js` `data-flip-move` on phase rows | G10 animated (14% of trip/frame); G11/G12 no large move after arrival fix (MEASURED NOTHING = no teleport left) |
| G2 | `app.js` `renderGoalSurfaces()` + goals `paint()` via `ctx.renderGoals` | goal-agent-step ~19–37ms vs bare renderApp ~60–85ms (ratio ~0.27–0.6); chip/badge coherent |
| Layout | named `assistantPane` + `activityPanel` containers; `.wa-label` ellipsis | structural only |

Closeout probe: `handoff/w6/fixes/closeout-probe.mjs` → **OVERALL GREEN**.
Final deliverable sha (pre-cleanup): see `build.py --check` after last source edit.
Audit after closeout edits: **447 pass / 0 fail / 0 console / 0 page**.

Harness resume (read-only): Thread Ops C2c PASS controlled; 15a take-7 narrow REFUTED (fix live) / D7 draft CONFIRMED; Orbit blank-core REFUTED; Context smoke PASS 8/8.
History status film: 24 thread rows with distinct status-dot classes captured in `handoff/w6/hist/status-film.json`.
