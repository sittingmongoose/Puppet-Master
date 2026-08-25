# Wave 6 orchestrator log

Successor session to the one that wrote `handoff/HANDOFF.md`. User decisions for this run:
finish **everything** the handoff owes; **restore** the pinned history drawer's resize handle;
do the ~96MB evidence cleanup **at the very end**, not up front; then a **path-scoped** commit
and push to `origin` and `truenas-backup`.

Baseline on arrival: tree clean at `b72727f2b5`/`92647cc013`, `build.py --check` green at
`9315f951fa40a938`, audit 446/0/0/0.

---

## Wave 0 — shared infrastructure (orchestrator) — DONE

The rigs were unrunnable as shipped. `handoff/w5/rig.mjs:6` and **22 other harness scripts**
hardcoded `/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-.../scratchpad/...` — a *different
session's* directory that still exists on this box, so every film and trace would have been
written somewhere no successor would look, silently and without error.

- `rig.mjs` now derives `ROOT`/`TARGET`/`W5` from its own location and honours `PM56_TARGET` /
  `PM56_OUT`, creating its output dirs on import.
- Fixed a real instrument bug at `rig.mjs:62`: `offsets` was computed as `f.at - t0` (CDP
  **arrival** time) but printed onto frames that `:51-59` had re-sorted by `metadata.timestamp`,
  so contact-sheet captions could run backwards. Offsets now come from the same clock the sort
  uses. Smoke-tested: offsets return monotonic.
- All `handoff/*.mjs` and `handoff/w5v2/*.mjs` repointed to `handoff/w6/`.
- Froze `handoff/w6/frozen-9315f951.html` so read-only agents survive concurrent rebuilds.

## DEFECT 2 — REFUTED (pending one control). See `DEFECT2_PREFLIGHT.md`.

Ran `06-hist-cross.mjs`, which the prior session wrote and never executed. The drawer's *box*
does start 306px left of rest over the editor, but `clip-path` animates in lockstep with
`transform`: `elementFromPoint` at x=500 returns the editor on **all 50 frames**. Both side
numbers were inflated by the documented Playwright phantom-latency hazard; driven in-page the
"~58ms of non-existence" is **~20ms** and the "324ms vs 240ms declared" settle is **~261ms**.
Still owed: a painted-pixel colour read plus a forced `clip-path:none` negative control. Until
that control goes red on purpose this stays REFUTED-PENDING-CONTROL, not CLEAN.

---

## Wave 1 — findings to carry forward

**Session note:** both Wave 1 agents were killed mid-task by a usage limit and both were resumed
from their own transcripts with context intact. Their incremental logs survived completely. The
"save early, never batch" instruction is what made that recoverable — keep issuing it.

### DEFECT 1 — cause found, fix landed (W1A)

Neither diagnosis in `HANDOFF.md` was right. Cause is **`orbit.css:206-213`** — `.orbit-layout`
runs a 420ms `grid-template-rows` transition (row-axis form at `:570-579` at 1440x900), and
`flipHeights` reads `getBoundingClientRect()` at its `t=0`, where the spec requires the OLD track
value. So `h1` came back short by the whole panel **and pointing the wrong way**: -40px on an
expand, +40px on a collapse (the residual is `.orbit-caption`, present only while collapsed).
Proven by A/B: killing `.orbit-layout`'s transition drops the peak frame from **+231.4px to
+29.9px** and makes `h1` read the correct 384.06px; killing `.working-body`'s transition changes
**nothing**. The handoff's `styles.css:192` theory is inert — `min-height` interpolates (15
intermediate values under a positive control) but is never triggered by an orbit toggle.

**Second defect, found mid-verification and not in anyone's brief:** the WAAPI clock started in
the frame that still had to lay out everything `pmPatch` wrote (33-50ms), so the first frame
anyone actually *saw* was already 36-64% through the travel — a 282-349px jump **on all 24
takes**, independent of the target bug. Fixed by pausing the animation and playing it on the next
rAF.

New gate `'Working-card FLIP travels forward, in steps, and stops'` in `tests/audit.mjs`: budget
`max(40px, 25% of travel)` — a flat 40px would be a standing failure, since the FLIP's own easing
puts 17.9% of travel into its first frame by construction — with a `min(1, 16.7/dt)` dropped-frame
discount that can only soften a reading, and explicit "this assertion measured nothing" guards.
Audit 446 -> 447.

### Goals defects, for the fix wave (W1B, Area 2)

- **G1 CONFIRMED** — a just-completed phase row goes to `opacity:0` + `clip-path:inset(0 0 100%)`
  and re-arrives over 440ms, ~0.8s after completion, **in the shipped default state**. Frame #12
  of `goal-completion-2s.png` is blank; `elementFromPoint` at the row centre returns the list
  behind it. `goals.js:377-380` vs `goals.css:71-72` / `goals.css:134`.
- **G2 CONFIRMED** — completing a phase blocks the main thread 72.8-90.2ms (58-64ms of it a
  whole-app `renderApp()` from `goals.js:879`); the 233ms wipe's clock does not start for ~104ms
  and 4-5 frames are dropped in front of it. Same class as the FLIP clock defect above.
- Observations, not motion defects: `goals.css:118` scopes `.goal-strike` to `.completed`, so an
  `abandoned` phase keeps a strike permanently at `scaleX(0)` and is never struck through.

Menus came back CLEAN on all eight claims, each with a red control behind it — including the
close-opacity eye-check CSS could not settle (held at 1.000 to 76% of the collapse, first fade
sample at 83%, declared crossover 79.5%).

---

## DEFECT REGISTER — open items for the fix wave

Source: `handoff/w6/FILM_A.md` (1328 lines, 40 probe scripts, 55 traces, 16 sheets). Frozen
snapshot md5 `ab94fcc3a253` stable across every run, so all Area 1-4 findings are comparable.

### Goals (`goals.js`, `goals.css`)

| id | defect | evidence |
|---|---|---|
| **G1** | A just-completed phase row **vanishes and re-arrives 0.4-2.4s later**, reachable in the shipped default with nothing forced. `opacity:0` + `clip-path:inset(0 0 100%)`; `elementFromPoint` at its centre returns `OL.goal-phases`; `goal-completion-2s.png` #12 is blank. **Survives reduced motion as a ~90ms hard blink with no fade** (ink 0% on 3 frames) — it gets *worse* under the accessibility setting. | `goals.js:377-380` (420ms `data-wipe` lifetime) vs `goals.css:71-72` (unconditional `goal-phase-arrive`) and `goals.css:134` (guard lives only as long as the flag) |
| **G2** | Completing a phase blocks the main thread **72.8-90.2ms**, 58-64ms of it a whole-app `renderApp()`; the 233ms wipe's clock does not start for ~104ms. Menus, which use `renderOverlays()`, cost 6-18ms — so the cheap path exists and Goals does not take it. | `goals.js:879` |
| **G10** | `goal-move-phase`: dragged row **teleports 57px in one frame**; the row it passes **replays a 440ms entrance from `opacity:0`**, leaving a visibly empty slot for ~120ms. The concept ships a FLIP that `goals.js` never opts into. | `goals.js:905`; FLIP at `app.js:1125-1139`, `app.js:1158` |
| **G11** | `goal-reopen-phase`: status change animated as an arrival (341ms fade-in) while a real 19.2px shift on five rows is not animated at all — backwards from what the motion should express. | `goals.js:896` |
| **G12** | `goal-unblock`: two rows replay an arrival; the list moves ~241px in one frame. | `goals.js:881` |

### Transcript

| id | defect | evidence |
|---|---|---|
| **T1** | **You send a message and the transcript never scrolls to it.** Lands 2787px below the fold, `inView:false` for 3s, `elementFromPoint` returns null. `handleSend()` lacks the scroll-to-bottom that `appendMessage()` has. | `app.js:1588-1603` vs `app.js:1569` |
| **T2** | A render inside a smooth scroll makes `restoreScroll` write a stale mid-flight `scrollTop`; the scroller **animates backwards** 0 -> 847 -> 116 of 2892, and the transcript boots parked at the top permanently. | `app.js:1305`, `styles.css:153` |
| **T6** | `.working-card` resizing inside the transcript shifts the hovered message **19px under a stationary cursor**: `:hover` drops, buttons flicker to opacity 0.65, then fade out entirely on the second event. No `overflow-anchor` anywhere in the sheets. | `styles.css:190` |

### Suspected — deliberately not rounded

- **C11** — the compact menu's height changes by 37/43/~46px **with no intermediate frame**, where the concept's other resizing menu springs over 340ms. Scoped out by `menus.css:70-76` and `app.js:1249`. Settles by frame-stepping the PMConcept7 reference recording across a compact run.
- **C13/T8 — NEEDS AN OWNER DECISION, not a probe.** `drawer-in` (520ms) and `message-arrive` (420ms) run at **full length** under `prefers-reduced-motion` while `qs-rise` and `goal-phase-arrive` collapse to 1ms in the same build. `motion.css:230-231` states a policy under which the uncollapsed ones are correct, and two modules contradict it. All measurements in `filmA/traces/reduced-entrance-sweep.json`; W2B is extending the sweep to every entrance in the concept so the decision can be made once.

### Clean, with controls that read red

Menus: all 8 claims. Context: all 9 claims. Includes the close-opacity eye-check CSS could not
settle — opacity holds at exactly 1.000 to **76%** of the 220ms collapse, first sub-1 sample at
**83%**, declared crossover 79.5%; the box shrinks to ~84%x70% fully opaque then blinks out over
45ms. The ghost is complete, un-addressable (`pointer-events:none`, hit-test passes through, 0
stripped hooks remaining) and never flashes.

### Method note worth keeping

Two probes produced **false greens that only the positive-control rule caught**: one fired Escape
on an already-closed menu and reported "0 ghosts" on every frame; one measured the hover gate at
coordinates that were over the goal panel and reported a textbook "hidden at rest". Both are kept
on disk as worked examples. This is the eleventh through thirteenth broken instrument found across
this project's waves — the rule is earning its keep every single time.

### Not reached by Film A

Menus: `worktree`/`wand`/`persona` sprouts, and the upward-opening `--pm56-ty:-10px` branch
(unreachable at 1440x900). Goals: the activity-panel copy of the phase list is an **inference**,
labelled as such; G12's scroll-restore contribution is unseparated. Transcript:
`.pm-msg-overflow`, `.message-details`, `long-fade`/`toggle-message`. Context: drawer close, and
the `partial`/warn compact outcomes.

---

## DEFECT 1 — CLOSED. Fixed, and the negative control was run limb by limb.

Final: `build.py --check` -> sha `5067d6e3a99dd64e` (stable over two checks, orchestrator-verified),
audit `447 pass / 0 fail / 0 console / 0 page` (orchestrator ran it independently — the author
cannot certify their own green).

| | orbit expand | orbit collapse | work-history, all 24 takes |
|---|---|---|---|
| before | **+231.4px** (121% of travel) | **-231.3px** | **282-349px** on the first *visible* frame |
| after | **+31.75px** (17%) | **-31.75px** (17%) | **102.8px** (19% — the easing's own first step), first frame at **0.0%** |

62 runs, 0 violations, 0 backwards frames, max settle 366.7ms.

**Negative control, on the reverted build rebuilt to the original sha `9315f951fa40a938` -> 446/1:**
frame budget **RED** (231.4px vs a 47.8px budget, both directions); never-backwards **RED**
(-7.52px expand, +7.50px collapse); first-painted-frame **RED** (36-52% on 6 of 8 runs);
settle **GREEN, not violated** — the old build snapped, but it snapped *on time* (342ms);
measured-something **GREEN, not violated**. Complementary control (fixed build +
`.orbit-layout{transition:none!important}`): **447/0**. The +300ms colour probe reads
`rgb(14,17,26)`, **0/255** from the transcript reference on the reverted build vs 14/255 on the
fixed one. Recording which limbs did NOT fire is the point — a gate whose every limb goes red is
usually measuring the trigger, not the defect.

**Still open on DEFECT 1, carried forward honestly:**
1. Orbit's reduced-motion expand is two cuts ~117ms apart — `orbit.css:596-599` uses
   `transition-duration:1ms` instead of `transition:none`. Pre-existing and identical on the
   reverted build; a background task chip carries the frame table and the one-line remedy.
2. The `settle` and `measured something` limbs have never been observed red *through* `audit.mjs`.
3. The pixel `card owns the probe row` limb discriminates on the **expand only** (0 bad frames on
   the collapse, because a too-large target keeps the card above the probe row).
4. `layoutTransitionPending()`'s five-frame grace is **calibrated, not proven** (slowest observed
   start was three frames); a slower machine degrades to the old path at a cost of one 7.5px frame.
5. `PM56_MOTION.flipHeight()` has no call site, so its fix is reviewed, not measured.
6. All evidence at 1440x900 dpr 1, where the **row-axis** grid form is live; the column-axis form
   is unmeasured (the fix is axis-agnostic).

---

## Decisions (item 15a) — three more confirmed defects (`handoff/w6/FILM_B.md`)

- **CONFIRMED** — the decision host's **declared collapse never runs on close**. `take0-exit.png`
  frames 0-2 show the full questionnaire, frame 3 shows it entirely gone with the transcript
  already reflowed. No intermediate frame exists.
- **CONFIRMED** — **take 7 (Evidence Split) loses the entire question** below the 400px `qsHost`
  container tier.
- **CONFIRMED** — **take 7's primary action row sits below the fold at every width.**
- SUSPECTED 1A — three of eight takes (4, 5, 7) never declare an entrance and fall through to the
  stock `decision-enter` at 520ms while the five bespoke ones run 333-420ms: two entrance speeds
  ~40% apart on one surface. Becomes an accessibility defect under reduced motion (below).
- SUSPECTED 1C — content height changes inside an open decision land in **one untransitioned
  frame**; `max-height` is pinned at 460px and never binding, and `height` is not transitioned.
- CLEAN with controls: no entrance replay on option select (node identity held; the same probe
  reported `nodeReplaced:true` on a D7 flow switch, so it discriminates); D7 draft preservation
  across flow switches (`questions.js:867` saves, `:874` restores); `qsHost` tier boundaries;
  0px overflow at 11 widths for takes 5/6/7 — whose control **failed on its first attempt** (a
  plain `width` was shrunk away by the flex parent) and is recorded rather than quietly replaced.

## Reduced motion — the modules contradict the stated policy, not each other

`motion.css:227-231` states it in prose: *"stop the infinite decorative loops, keep the short
state transitions... Finite entrances are untouched, so state changes stay legible"*, explicitly
rejecting a blanket flatten because it "erased the state changes as well as the decoration".
Measured across 28 animations (`filmB/reduced-policy-table.json`):

- 8 infinite loops correctly killed, 2 correctly stopped — conformant.
- **8 finite entrances run FULL LENGTH** (`decision-enter`, `drawer-in`, `message-arrive`,
  `morph-stage`, `panel-pin`, `capability-pop`, `pm-disc-in`, `pm-roll`) — **policy says correct**.
- **9 finite entrances COLLAPSE to 1ms** (`goal-phase-arrive`, `orbit-disc-in`, `pm-materialize`,
  `pmap-in`, `qs-dock-in`, `qs-morph-in`, `qs-rise`, `qs-sheet-up`, `qs-step-open`) — **these
  violate it**; plus `details-open`, which collapses one of its two durations.

So four modules each independently overrode the central policy. Sharpest consequence:
`decision-enter` (the stock fallback for takes 4, 5, 7) runs 520ms while the five bespoke `qs-*`
entrances collapse to nothing — **three of the eight decision takes animate under reduced motion
and five do not.** This is an owner decision, not a probe; it is with the user.

### USER DECISION — reduced motion (2026-08-25)

**"Just fix the decision-take split."** The wider full-length-vs-collapsed inconsistency stays as
a deliberate per-module choice; do **not** un-collapse the 9, and do **not** flatten the other 8.
Scope the fix to the Decisions family only, so all eight takes behave identically under
`prefers-reduced-motion`.

Direction: five of the eight already collapse (`qs-dock-in`, `qs-morph-in`, `qs-rise`,
`qs-sheet-up`, `qs-step-open`), so takes 4, 5 and 7 — which fall through to the stock
`decision-enter` at 520ms — are the odd ones out. Collapse `decision-enter` under reduced motion
so the family agrees. The table confirms `decision-enter` is decision-scoped
(`els: decision-surface`, phases `decision-take4/5/7-enter`, `decision-plan`), so this cannot
leak into another module. Belongs to the fix wave, in `questions.css` — **not** `motion.css`,
whose stated policy the user has chosen to leave standing.

---

## G1 — CONFIRMED by a second, independent instrument (and the first one was a false green)

`handoff/w6/filmB/30-g1-second.mjs` had **run to completion** producing 343KB/335KB of clean
trace, 261 frames, 0 mutations. It was a false green: its trigger, `completeWorking()`, advances
the *work* lifecycle, not a goal phase. Working detector, **no control on its trigger**. That is
the 14th broken instrument on this project. Real trigger: `[data-action="open-goal"]` ->
`[data-action="goal-agent-step"]` (`goals.js:879` -> `agentStep` at `goals.js:844`), reachable
with nothing forced.

The replacement (`filmB/32-g1-pixel.mjs`) pairs an rAF frame-clock trace with a screencast ink
metric against a **spatial neighbour control band** — an adjacent row measured in the same frame,
which is what separates "this row went blank" from "this frame went blank". Four controls:
calibration, forced-blank positive, quiet-window negative, and a trigger control.

- **Normal:** click at 116.7ms -> `data-wipe="1"` + `goal-phase-complete` at 166.7ms -> at
  **700.0ms** the flag drops, `animation-name` reverts to `goal-phase-arrive`, row goes to
  `opacity:0` + `clip-path:inset(0 0 100%)`. Fully invisible **66.7ms**, then a ~450ms re-reveal.
  Ink **0,0,0** on 3 frames while the neighbour held at exactly 3742.
- **Reduced motion:** confirmed and **worse in kind** — only two states, fully hidden at 1666.5ms
  and fully shown at 1783.2ms, no intermediate opacity or clip on any frame. Stills read
  4256 -> 0 -> 4256 versus normal's 4256 -> 0 -> 584.
- **Node identity unchanged across the vanish in both modes** — not a re-mount, a live element
  restarting its entrance.

**Mechanism, exactly:** `goals.css:71-72` puts `goal-phase-arrive` on every row unconditionally
and permanently; `goals.css:134` suppresses it while `data-wipe="1"` is present; `goals.js:377-380`
gives that flag a 420ms lifetime **and schedules no render**. The guard's lifetime is finite, the
thing it guards against is permanent — so the reveal its comment says must never happen is not
prevented, only **postponed** to 0.6-2.4s (583ms and 1550ms measured from identical input).

## Reduced motion — the full picture, and the precise fix the user's decision implies

18 of 28 conformant with `motion.css:227-231`; 10 violating. Eight of the ten are four modules
overriding independently: `goals.css:369`, `questions.css:461-463`, `activity-panel.css:462`,
`orbit.css:133`. The ninth is **`motion.css:234` — the policy file contradicting its own prose
three lines later** (`pm-materialize`). A fifth override, invisible to an animation-only tour:
`menus.css:326-332` removes the overlay-menu *transitions* entirely (10 instances -> 0). Benign
in direction, still a deviation. `details-open` is the sharpest illustration: same keyframe, the
280ms call site collapses (it sits inside `.pmap`) and the 360ms one runs full — decided by an
unrelated ancestor.

**The actionable line, per the user's "just fix the decision-take split":**
`questions.css:461` enumerates **seven class names**, which happen to cover exactly the takes with
bespoke entrances and **miss the three that fall through to `decision-enter` on
`.decision-surface`**. Measured consequence: takes **4, 5, 7 animate 516.8ms** under reduced
motion; takes **0, 1, 2, 3, 6 get 0ms**. Take 4 does both at once — root full-length, its own
`qs-step-live` child collapsed. Fix = extend that enumeration to cover `.decision-surface`.
Confined to `questions.css`; `motion.css`'s policy stays standing, as the user chose.

## Theme sweep — three confirmed contrast defects, and one finding withdrawn

**Four instruments failed before one worked.** The decisive trap: **`checkVisibility()` returns
true for fully covered elements**, so hit tests returned `qs-head` and `composer-input` for
elements nominally in the activity panel. That produced a compelling, twice-reproducible,
exactly-two-themes finding ("Goal budget collapses to cr 1.0 in both retro themes") which is
**entirely an artefact and is withdrawn**. The final probe gates on `elementsFromPoint` (plural,
so cover is visible) and carries its own cover/uncover control.

| | finding | locus |
|---|---|---|
| **CONFIRMED** | `--subtle` fails WCAG AA in **all eight themes on all three surface tiers** — 24/24 pairs at 2.19-4.27; pixel-confirmed on 21-24 elements per state, measured 1.77-4.08, all 8-10px text | `styles.css:42-49` |
| **CONFIRMED** | **retro-light** fails AA on 60-63% of measured elements vs 28-40% elsewhere; 16-22 elements pass in seven themes and fail only there, almost all at exactly **4.18** = `--muted #607567` on `--surface-2` | `styles.css:49` |
| **CONFIRMED** | **friendly-light** is the only theme where `--accent` itself fails on every surface (3.60 / 3.22 / 2.88) — and that is the current-item signal | `styles.css:45` |
| CLEAN (controlled) | zero unpainted elements in any theme; **glass themes carry no translucency or blur penalty** (glass-dark is joint-best dark at median 7.53); `decision-enter` produces a 16-23 step luminance ramp in all eight palettes with the spatial header control reading exactly 0 | |

**Not reached:** the questionnaire's own text was never validly contrast-measured in any theme
(the passes that included it are withdrawn); no hover/focus/disabled states; no forced-colors
mode. Only `decision-enter` was tested for cross-theme motion — `.pm-shimmer` read `ink=0` once
in an uncontrolled pass, which is neither trustworthy nor disproved. Area 2 rests on one scripted
tour of 28 animations; `variants-a/b/c` and the lens/threadops surfaces were never exercised.
G1 was filmed only in the goal editor, not the activity panel's copy of the same list.

---

## USER DECISION — accessibility descoped (2026-08-25)

**"I do not care about accessibility or WCAG compliance, dont waste more tokens looking for those
things or fixing them."** The three confirmed contrast defects (`--subtle` failing in all eight
themes, retro-light at 60-63%, friendly-light's `--accent`) are **withdrawn from scope — recorded,
not actioned**. No further contrast auditing. The one surviving reduced-motion item is the
decision-take split, in scope only because the user asked for it by name before this instruction.

## History wave — resize handle RESTORED, DEFECT 2 REFUTED with a firing control

Landed at sha `ae6c3916d73a655c`; orchestrator independently re-ran the audit: **447 pass / 0 fail
/ 0 console / 0 page**.

**Resize handle (the user's explicit request): DONE.** `handoff/w6/hist/resize-trace.mjs` — 16/16
PASS. Pin-in-place proven *without toggling a toggle*: open -> unpin -> settle -> assert -> ONE
pin. Drawer left edge 782.59 == pane left 782.59 on **every one of 66 frames**; at rest gutter 200
== width 200; transcript starts at 982.59, the drawer's right edge. So the invariant the original
trade was protecting survived the restoration.

**The restoration is ADDITIVE.** `handoff/w6/hist/beforeafter.mjs` rebuilds git HEAD's
`history.css`/`history.js` into a separate tree, reproduces sha `5067d6e3a99dd64e` exactly (the
previously verified baseline), and pixel-compares the drawer region across 8 takes x
{pinned, floating}: **all 16 states n=0 differing pixels**, against a differ-control of
n=121148 maxd=242. The default look is pixel-identical.

**DEFECT 2: REFUTED — and this time the control fired.** `hist-cross2.mjs`, 16 pass / 0 fail over
four runs. Under `--noclip` (`clip-path:none !important`) both instruments go red at all three
probe points, and the painted patches land exactly on `rgb(19,23,37)`, the drawer's own computed
background. Not "refuted-pending-control" any more.

**The 261ms-vs-240ms residual: SETTLED, and it was never a defect.** `transitionend.elapsedTime`
reports `transform 240.00ms` and `clip-path 240.00ms` against a declared 240ms, with **0 frames of
overshoot**, one drawer node identity, and 0 overlay mutations during travel. The last still-moving
rAF sample is at 233.4ms with **0.12px of 306px remaining (99.96% done)** in every run; the arrival
reads 250ms or 267ms purely according to whether the next frame came 16.6ms or 33.3ms later.

> **METHODOLOGICAL FINDING, applies to every timing number in this project:**
> **this headless Chromium delivers rAF at ~30fps, not 60.** Measured gaps in one run:
> `33.4 16.6 16.7 16.7 16.6 16.7 33.4 16.6 50 16.7 33.3 16.7 33.3`. A 33.3ms sampler cannot report
> a 240ms event as anything but 240 or 267. The handoff's "324ms" was the Playwright click
> round-trip; my own "261ms" was this sampler. **Neither was a discrepancy, and no timing claim
> below one ~33ms interval is meaningful.**

**A sixth broken instrument, found here:** CDP screencast frames **lag the DOM**. Any probe pairing
a DOM read with a screencast frame must account for the offset rather than assuming they are in step.

**Task 3 (the lying guard) is DONE** — I verified it after the kill rather than assuming.
`node history-verify.mjs` reports **78 pass / 0 fail**, and `history-verify.mjs:408-470` is now a
three-arm test instead of the old single shadow toggle: **A** as shipped (clip
`inset(-90px -90px -90px 0)`, shadow on); **B** `clip-path` forced to `inset(0)`, which is what
actually tests whether the -90px insets are what let the shadow out; **C** `box-shadow:none`, the
original arm, kept. The sign the agent was mid-correction on is now stated in the comment: *a
shadow DARKENS the strip outside the drawer, so the shipped reading is the LOW one, and both ways
of removing it must make it brighter.* Comment and behaviour now agree.

**Still owed on history:** Task 4 only — the nine history status indicators were never filmed.

---

## Item 9 (Context Lens) — RE-VERIFIED. Instrument rebuilt from a 0.3676 floor to 0.0000.

Full log `handoff/w6/LENS_LOG.md`; instruments in `handoff/w6/lens/`. Snapshot md5 unchanged at
both ends, no source touched.

### The cause of the broken floor, which nobody had found

The diagnosis on record (`scroll-behavior:smooth` plus rects read after the shot, plus T2's stale
`restoreScroll`) was real but **incomplete**. What kept calling `renderApp()` was never identified:

> **`app.js:1611` installs `workTimer = setInterval(..., 2000)` at boot, and `switchThread` never
> clears it.** The app re-renders itself every 2s for ~28s regardless of which thread is under
> test, and each render re-writes `.transcript.scrollTop` through a smooth scroller.
> MutationObserver: **9 mutations / 5s as booted -> 0 after `pauseWorking()`**.

The old file's A/A pair spanned about five unrequested renders. **Forcing `scroll-behavior:auto`
alone would not have fixed it** — and the predecessor's unrun `lens-pixels-v2.mjs` had no defence
against it either. This is also a **product defect**, not just an instrument one, and it has been
handed to the fix wave as context for T2: a render is not merely *able* to land mid-scroll, one is
*guaranteed* every 2 seconds.

### Achieved

- **A/A floor 0.0000** against a 0.02 gate and a 0.58 signal, on two different metrics and again
  inside Mute mode. Corroborated independently: the frozen page is **bit-identical** across a 3s
  wait, while the same pipeline reports 48,692 changed pixels when one message is dimmed.
- **Coverage 26/26** in all 14 paint maps, at both 1440x6600 (no scroll) and the stock 1440x900
  (19-20 scroll passes). Two full runs, **37 pass / 0 fail** each.
- A **discriminative** positive control (forced dim on 7 named messages -> exactly those 7, zero
  false positives or negatives) and a **predicted-value** control (measured sd ratio 0.4195-0.4228
  against an algebraic prediction of 0.42).

### The seven original reds, adjudicated individually

| | verdict |
|---|---|
| R1, R2, R7 | **CONFIRMED as instrument faults** — floor, coverage, and a detector missing 3 of 21. Never product claims. |
| R3 | **REFUTED.** At rest: 0 dimmed, 0 brighter, under both rules. |
| R4, R5, R6 | **REFUTED — the product is correct.** Exactly 25 dim after sealing 25; 26 after a 26th in a second operation; Turn Off restores all 26 **bit-identically** (`maxSdRel` 0.0000 — the claimed 0.6682 does not reproduce). Newly measured: the cap is a **refusal, not a truncation**. |

### Two faults its own controls caught in its OWN instrument

1. A count anomaly that was **not** a defect — seal receipts render as `article.event-card`, not
   `.message`. A harness expecting message growth would have filed a false red.
2. **A real bug in its own code**, exposed only by the stock-viewport cross-check: `compare()`
   guarded geometry in *viewport* coordinates, so a receipt growing `maxScroll` made the last
   scroll pass discard `plain-26` as "moved 97px" — in the very comparison about `plain-26`. Same
   class as the fault on record, displaced from within-a-frame to across-two. Fixed to document
   space, and a `C-PAIRS` control now names any comparison decided on a subset. **R4 had *passed*
   on 25 of 26 before this** — i.e. the green was partly vacuous and only the new control revealed it.

### NEW DEFECT — Lens Focus breaks its own stated invariant

**Focusing a turn moves every turn below it, 12/12 messages**, against the invariant `lens.css:95`
states in its own comment.
- **User bubbles: -22.00px exactly.** The rule *replaces* `padding:11px 13px` with `9px 11px`
  (-4px), then `margin:-9px` subtracts 18px that was never added.
- **Assistant turns: +21.25 / +42.30px.** Horizontal padding 2px -> 11px takes 18px out of the text
  column, forcing a re-wrap that no margin can compensate for.

### Could not settle — stated plainly rather than rounded

"Focus paints exactly the selected turns" is **unmeasurable in the tint direction**: a focused
turn's pixels change from the tint *and* the re-wrap at once, and the crop itself resizes.
`M-F-PAINT` in `lens3-modes.json` is red and **must not be read as a product finding** — its six
false positives are stale coordinates. The measurable half is green: all 21 unselected same-size
turns are pixel-identical, so **Focus leaks no paint**. Also unmeasured: the `source` state,
`lens-release`, non-`basic-dark` themes, and widths other than 1440.

**Verdict on item 9: Mute and Subcompact are correct in painted pixels. Focus carries a new layout
defect. Re-verified, not green.**
