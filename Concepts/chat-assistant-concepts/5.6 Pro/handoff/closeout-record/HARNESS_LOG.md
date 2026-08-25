# W4B — Independent second-instrument harness log

Role: READ-ONLY verification engineer. Edits NO source. Writes only under
`handoff/w6/harness/` and this log.

Target: `handoff/w6/frozen-9315f951.html`
Snapshot md5 AT START: `ab94fcc3a25341aa23556bcfbaa9608d` (verified)

Method contract in force:
- every assertion gets a negative control that must go RED
- every probe gets a trigger control observed in the DOM
- painted pixels via `elementsFromPoint` (plural), never bounding boxes, never `checkVisibility()`
- timing from the rAF frame clock only; this Chromium runs rAF at ~30fps
- `PM56_DEMO.pauseWorking()` before any steady-state measurement (app.js:1611 workTimer)
- harnesses derived from source + spec, never from re-reading the author's harness

---
## Item 6 — PM56_EXT slot parity (`handoff/w6/harness/ext-parity.mjs`)

**Author's instrument:** none. The claim "20 slots declared / 19 emitted / 0 orphaned"
lives only in a handoff document.

**My method (two channels with different blind spots):**
- *channel A, sentinel*: register a handler returning `''` for all 20 declared names
  plus `workingTake:0..7` plus one fabricated control. Returning `''` is inert —
  `extRender` emits `''`, `extReplace` treats `''`/`null` as "no slot" and keeps its
  fallback (app.js:224-228) — so nothing about the page changes, but the handler is
  reachable ONLY from `extEach`, which makes a fire proof of real emission.
- *channel B, proxy*: a `get` trap on `PM56_EXT._slots` recording every name the app
  looks up, with the stack classifying `extEach` (emission) vs registration.
  Channel A cannot see a slot with no handler; channel B can. Channel B cannot tell a
  lookup from an emission; channel A can.

### MEASURED NUMBERS (runtime, frozen snapshot)

| quantity | measured |
|---|---|
| declared (`ext.SLOTS`, app.js:157-159) | **20** |
| declared names actually EMITTED under drive | **19** |
| declared-but-never-emitted | **1 — `workingTake:N`** |
| emitted names not literally in SLOTS | **8 — `workingTake:0` … `workingTake:7`** |
| module-registered slot names at boot | **19** (18 declared literals + `workingTake:1`) |
| declared names with ZERO module handler | **1 — `planEditorActions`** |
| channel A vs channel B disagreement | **0 names in either direction** |
| total `_slots` lookups over the drive | 15,531 |

**Verdict on the documented claim: 20/19/0 SURVIVES numerically, but the document
names the wrong slot.** The one declared-but-unemitted slot is **`workingTake:N`**,
which is a template placeholder, not a slot — its concrete instances
`workingTake:0..7` are what app.js:761 emits (`extEach(\`workingTake:${v}\`)`).
`planEditorActions` **is** emitted, at app.js:392, on every render of an open plan
artifact; the frozen snapshot boots with `plan-query` already open in the editor, so
it emits on the very first render (probe: `harness/probe-planslot.mjs`, 1 hit on the
first render, 3 by the time a Deep Plan artifact is triggered). What is true of
`planEditorActions` is that **no module registers a handler for it** — `_slots
['planEditorActions'].length === 1` and that one is my own sentinel. Declared +
emitted + unsubscribed is very likely what the document meant by "unemitted".

"0 orphaned" is only true under the reading that `workingTake:N` declares the whole
family. Under a literal name match there are 8 emitted names not in `SLOTS`.

### Negative / trigger controls
- **N1** fabricated name `zzz-w4b-not-a-slot` — 0 fires on both channels. PASS.
- **N2** sentinel for `headerExtras` deliberately withheld — it VANISHED from channel A
  and REMAINED in channel B, exactly as a real instrument must behave. PASS. This is
  the control that proves channel A is reporting fires, not the registration list.
- **N3** boot-only census (0 names) is a strict subset of the driven census (27). PASS.
- **trigger control** — first appearance is attributable per drive step:
  `hover-collapsed-bar`→activityHoverCard, `openActivity`→goalSection+activityPanelBody,
  `openContext`→contextDrawer, `openQuestionnaire`→questionSurface,
  `thread-row-menu`→threadMenu, `goal-editor`→goalEditor,
  `destructive-dialog`→dialog, `click-menus`→threadSearchMenu/contextLensMenu/contextCompactMenu,
  `workingTake-sweep`→workingTake:1..7.

### Two false negatives my own instrument produced first (recorded, not hidden)
Both were drive-coverage faults, NOT app defects, and both would have been reported as
"never emitted" by a less suspicious agent:
1. `threadMenu`/`goalEditor`/`dialog` missing because the drive clicked `toggle-history`
   (closing the flyout) before it clicked `thread-menu`.
2. `activityHoverCard` missing because the drive hovered `[data-domain]`; app.js:1974
   opens the card on `pointerover` of `[data-hover-domain]`, and those anchors exist
   only while the activity bar is COLLAPSED — `pinActivity()` earlier in the drive had
   destroyed them. Isolated probe `harness/probe-hover.mjs` shows a real mouse move
   onto `[data-hover-domain]` produces `.hover-card.ab-card` and one slot fire.

---

## Item 5 — `PM56_EXT.collisions`, the untested direction (`harness/ext-parity.mjs`)

**Method difference:** the shipped assertion is `collisions.length === 0`, only ever
observed in the passing direction. I made it go non-empty on purpose and counted both
the array push and the `console.info` independently (Playwright `console` listener
filtered to `type()==='info'`), then proved the counter is not simply counting calls.

| probe | measured | verdict |
|---|---|---|
| boot invariant `collisions.length===0` | `[]`, 92 registered actions | PASS |
| `action('toggle-history', …)` duplicate | pushed **exactly 1** name (`"toggle-history"`), emitted **exactly 1** `console.info` (`PM56_EXT: UNDECLARED duplicate action "toggle-history" - chaining; declare it with chainAction() if deliberate`) | **PASS — claim survives** |
| **N4** fresh name `w4b-fresh-action-<ts>` | pushed 0, logged 0 | PASS (counter is not counting calls) |
| **N5** `chainAction('toggle-history', …)` — same duplicate | pushed 0, logged 0 | **PASS — the two paths do differ, as designed** |
| **N6a** chain order, synthetic actions | order `A:outer, A:base, B:outer, C:outer, C:base` — exactly as predicted | PASS |
| **N6b** chain on the real `toggle-history`, observed in the DOM | return `false` → module handler ran, DOM 1321→907 nodes, `historyMode` floating→closed; return `true` → DOM unchanged | PASS |

N6a is the discriminative pair: `return false` reaches `prev`, `return true` does not
(`B:base` absent — the negative control), and an undeclared `action()` duplicate chains
identically to `chainAction()` while additionally recording `collisions:["w4b-base-C"]`.
So the difference between the two APIs is **reporting only**, never dispatch — which is
what the source comment at app.js:180-185 claims.

**One instrument fault of mine, corrected:** the first run reported N6b INCONCLUSIVE
(DOM unchanged in both directions) because I sampled 220 ms after dispatch and the
history drawer's close animation is longer than that. At 800 ms the discrimination is
clean. Recorded because "INCONCLUSIVE" from a too-short wait is exactly the kind of
result that gets rounded into a defect.

---

## Item 13 — Thread Ops, second harness (`handoff/w6/harness/threadops-second.mjs`)

**Author's instrument:** `tests/threadops-verify.mjs`, status "plausible on inspection,
unverified at runtime". I did not read it before building this.

**Precondition control (T13.pre-live-state, PASS):** `PM56_EXT.ctx().state` is the LIVE
state object, proven by writing a scratch key through one call and reading it back
through another, while `PM56_DEMO.getState()` (a clone) does not see it. Every
measurement below reads live state through that door, never through the clone.

### C1 — "Rewind writes a restore point BEFORE it deletes anything"

**Method difference:** this is an ordering claim, so I measured order, not source. I
patched the INSTANCE methods `push`/`splice`/`slice` on the one live `thread.messages`
array and recorded a sequence with a monotonic counter. No source edit; the patch lives
on the array instance for the life of the page.

Measured mutation timeline for `rewind-to-message` on `query-14` (thread `query`,
17 messages):

```
slice(0,15)                       <- createRestorePoint captures the immutable prefix
push(threadops-restore-point)     <- the restore point card is appended
splice(14,4)   rpCardsAlreadyInThread = 1
push(threadops-restore-point)     <- the card pulled back out of `folded` and re-appended
push(threadops-rewind)            <- the fold card
```

| probe | result | verdict |
|---|---|---|
| T13.C1a restore point precedes any removal | push at index 0, splice at index 1, and at splice time a restore-point card is already in the thread | **PASS** |
| T13.C1b rewind really folds (trigger control) | 17 → 16 messages; folded ids `query-15`, `query-16`, `query-17` | PASS |
| T13.C1c Restore returns every folded turn | all 3 back, order preserved, **byte-identical JSON**, 0 mutated; restore driven by a REAL mouse click on the painted `Restore 3 turns` button after confirming via `elementsFromPoint` that it was the top element at that point (`topIsIt: true`, stack `soft-button / pm-tops-card / plan-actions`) | **PASS** |
| T13.C1c-N1 NEGATIVE | same comparator against the post-rewind state → RED (3 missing) | PASS (went red) |
| T13.C1c-N2 NEGATIVE | one byte altered in the expected set → RED (`query-09`) | PASS (went red) |
| T13.C1d NEGATIVE, induced failure | forced the restore-point append to THROW: timeline is `slice, push(restore-point), INDUCED-THROW`, **no splice ever ran**, 0 messages lost, error surfaced as `PM56_EXT action "rewind-to-message" threw` | **PASS** |

**The author's C1 claim survives independent measurement, with controls.** C1d is the
decisive one: it is the only test in this file that could have shown the fold happening
without a restore point, and it did not.

Note for the record: the restore adds 2 cards (17 → 19 after restore) — the restore
point card and the fold card, the latter mutated in place to "…restored"
(threadops.js:481-490). No original message is touched.

### C2 — "The destructive confirm is genuinely modal"

| probe | result | verdict |
|---|---|---|
| T13.C2a shell | `role=alertdialog`, `aria-modal=true`, title `Delete thread?`, dialog `z-index:1151`, scrim `z-index:1150`, `--z-dialog: 1150`, scrim rect `[0,0,1440,900]` = exactly the viewport, `pointer-events:auto` | PASS |
| T13.C2b cover | 39 points, each one the TOP element of its own `elementsFromPoint` stack BEFORE the dialog opened. With the dialog open: **39/39 covered by the scrim or the dialog, 0 leaks, 39/39 still present in the stack underneath** (covered, not removed from the DOM) | PASS |
| T13.C2c real click behind | real mouse click at (877,633), a `select-thread` row for thread `bsd` sitting outside the dialog rect: `selectedThread` stayed `query` | see UNCONTROLLED below |
| T13.C2d trigger control | identical coordinates with the dialog closed: `query` → `bsd`. The click instrument does actuate that control | **PASS** |
| T13.C2f keyboard | 14 Tab presses from the open confirm: **0 landed outside the dialog**; focus cycles `close-dialog → confirm-delete-thread ×2 → close-dialog …` | PASS (focus contained) |

**T13.C2c is UNCONTROLLED — do not read it as a verdict.**
The anti-modal control (T13.C2e), which removes the scrim's `pointer-events` and
requires the same click to LEAK, reported `leaked:false` — but that is my instrument's
fault, not evidence about the app: by the time C2e runs, the trigger-control step has
already switched the selected thread to `bsd`, so clicking the `bsd` row again cannot
change `selectedThread` and the probe has no observable. The control needs a fresh page
and a target thread that is not the selected one. Until that control fires, C2c's green
is exactly the kind of untried-red this project has been burned by fifteen times.
What IS controlled and does stand on its own: **C2b** (39/39 cover, measured with
`elementsFromPoint` plural, cover distinguished from removal) and **C2d/C2f**.

Also observed, not a defect, worth stating: clicking the scrim closes the dialog
(`data-action="close-dialog"` on the scrim, threadops.js:1055). Light-dismiss on an
`alertdialog` is a design choice, not a modality failure — but it does mean "the content
behind cannot be reached" is true only for the click that dismisses.

---

---
## Item 13 C2c — controlled re-instrument (`handoff/w6/harness/c2c-controlled.mjs`)

Prior C2c was UNCONTROLLED because C2d switched `selectedThread` to the click
target before C2e's anti-modal ran, leaving the anti-modal with no observable.

**Fix:** each limb on a fresh page; target is always a painted `select-thread`
that is **not** the selected thread (`plain` while selected=`query`).

| probe | result | verdict |
|---|---|---|
| T13.C2c real click behind modal | `query`→`query`, dialog stayed open; `elementsFromPoint` stack had scrim/dialog | **PASS** |
| T13.C2e ANTI-MODAL (pointer-events killed) | `query`→`plain` (leak observed) | **PASS (went red / can see leak)** |
| T13.C2d TRIGGER (no dialog) | `query`→`plain` | **PASS** |

**Controlled verdict: PASS — destructive confirm blocks a real behind-click; both controls fire.**
Target: live `index.html`. Snapshot not required for this limb.

---
---
## Item 15a — Decisions, second harness (`handoff/w6/harness/decisions-second.mjs`)

Target: live `index.html`. Method: `elementsFromPoint` ownership (self-or-descendant only;
ancestor-on-top is NOT ownership — first N1 attempt was blind until that was fixed).

### A — take-7 narrow evidence / question reachability

Live `questions.css:433-448` already caps `.qs-split-aside` at `max-height:72px` under
`@container qsHost (max-width: 400px)` and gives `.qs-split-main` `min-height:180px` —
the FILM_B D2 mechanism (`flex:0 0 auto` aside starving the question) is **gone**.

| probe | measured | verdict |
|---|---|---|
| take7 @ vw360 | contentW=348, column, mainH=282.8, asideH=72, choice0 **owns=true** | defect **absent** |
| take7 @ vw400 | same shape, choices reachable | defect **absent** |
| take7 @ vw480 POS | row layout, reachable | PASS |
| take0 @ vw360 POS | reachable | PASS |
| N1 forced opacity:0 + pointer-events:none | owns true→false | **PASS (went red)** |

**Claim "take 7 loses the question below 400px": REFUTED on live build** (instrument can see unreachability when forced).

### B — D7 draft preservation

| probe | result | verdict |
|---|---|---|
| answer "Windows native" → `flow-migration` → back to `flow-deploy` | answer restored | **PASS / CONFIRMED** |
| N1 clear `state.qs.drafts` mid-flight | answer comes back empty | **PASS (went red)** |

---
## Item 12 — Orbit blank-core (`handoff/w6/harness/orbit-blankcore.mjs`)

Dense rAF (~30fps) over `setVariant(2,1)` Orbit + `stepWorking()` phase handover.
Blank = label **and** icon opacity < 0.05 (or core not hit-tested while near-transparent).

| probe | result | verdict |
|---|---|---|
| N-forced opacity:0 on strong+icon | 13 blank frames | **PASS (went red)** |
| N-quiet (no step) | 0 blank / 19 frames | **PASS** |
| trigger | label Web search → Web fetch | **PASS** |
| handover dense sample | 29 frames, **0 blank**; minSop=1, minIop=0.35 (`orbit-core-in`); `data-k="corelabel"` constant | **REFUTED** |

The Wave 4 "~40ms blank core" does not appear on the live build. Icon dips to 0.35 by design;
the label never leaves opacity 1. Trace: `orbit-blankcore-trace.json`.

---
## Item 6 — Context second smoke (`handoff/w6/harness/context-smoke.mjs`)

Independent of author's `tests/context-verify.mjs`. Live `index.html`.

| probe | verdict |
|---|---|
| PM56_CTX / openContext available | PASS |
| openContext mounts visible `.ctx-drawer` | PASS |
| elementsFromPoint centre owns ctx surface | PASS |
| N forced opacity:0 + pe:none → owns false | **PASS (went red)** |
| Capabilities + growth chart + ceiling present | PASS |
| live state via `PM56_EXT.ctx().state` | PASS |
| `ctx-compact-now` fires; outcome tone in body text | PASS |
| N bogus `.ctx-w4b-totally-fake-slot` absent | **PASS (went red)** |

**Overall: PASS (8/8).**

## STATUS — 2026-08-25 (harness continuation complete)

Snapshot policy: C2c / 15a / 12 / Context measured against live `index.html` via
`handoff/w5/rig.mjs` (`PM56_TARGET` unset → concept `index.html`). No app source edited.
JSON under `handoff/w6/harness/`. Path OUT via `process.cwd()` / `fileURLToPath` (space-safe).

| # | Item | Status |
|---|---|---|
| 5 | `PM56_EXT.collisions` non-empty direction | **COMPLETED** — 6 probes, 4 of them controls, all green |
| 6 | PM56_EXT slot parity | **COMPLETED** — 20 declared / 19 emitted / template caveat, 3 controls green |
| 13 | Thread Ops | **COMPLETED** — C1 prior; **C2c controlled PASS** (`c2c-controlled.json`: C2c/C2d/C2e all PASS on fresh pages) |
| 15a | Decisions (`questions.js`) | **COMPLETED** — take-7 narrow defect **REFUTED** on live build (CSS fix present); D7 draft **CONFIRMED**; both negative controls went red (`decisions-second.json`) |
| 12 | Orbit | **COMPLETED** — blank-core ~40ms **REFUTED** (29 rAF frames, 0 blank; minIop=0.35 from `orbit-core-in`; forced/quiet/trigger controls green) (`orbit-blankcore.json`) |
| 6 | Context (`context.js`) | **COMPLETED** — second smoke **PASS** 8/8 with 2 negative controls red (`context-smoke.json`) |

### Harness files written
- `handoff/w6/harness/ext-parity.mjs` — items 5 + 6, results in `ext-parity.json`
- `handoff/w6/harness/threadops-second.mjs` — item 13, results in `threadops-second.json`
- `handoff/w6/harness/recon.mjs`, `probe-run.mjs`, `probe-hover.mjs`, `probe-planslot.mjs` — supporting probes

### Reusable findings for whoever picks this up
1. `PM56_EXT.ctx().state` is the live state object. `PM56_DEMO.getState()` is a clone and
   cannot be used to observe mutation, nor patched to intercept it.
2. Patching instance methods on a live array (`t.messages.push/splice/slice`) is a clean,
   source-free way to get a true ordering timeline, and lets you inject a failure at an
   exact point for an induced-failure control.
3. Drive-coverage faults masquerade as defects. Three of mine, all caught by controls:
   clicking `toggle-history` before `thread-menu` (kills the flyout), hovering
   `[data-domain]` instead of `[data-hover-domain]`, and pinning the activity panel before
   trying to hover the collapsed bar.
4. Sampling 220 ms after a dispatch is too soon for the history drawer; its close animation
   is longer. 800 ms discriminates cleanly.
5. Any click-based "it is blocked" test needs a target whose effect is observable AND that
   is not already in the target state — otherwise the trigger control passes and the
   anti-control silently cannot fire.
SNAPSHOT_MD5_END=ab94fcc3a25341aa23556bcfbaa9608d
