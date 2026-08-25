# Wave 5 — Second Verifier — LOG

> ## RESUME HERE (handoff, session ended mid-Task-2)
>
> **Snapshot used for every number below:** `scratchpad/w5v2/snap/index.html`,
> sha256 `fa9cc44aa39d9453`, copied while `build.py --check` was green **before and after**
> (`244377b637a858b2`). The live tree moves under you; re-snapshot before comparing.
>
> **DONE and trustworthy (high confidence, negative controls shown):**
> - **T1a** — CDP screencast frame-ordering. **Orbit's hypothesis CONFIRMED with a mechanism.**
>   Frames DO arrive out of paint order. See §01. Actionable fix for every film script in the
>   repo: **sort by `metadata.timestamp`**, which they all currently discard.
> - **T1b** — History clip-path `-90px` insets. **CONFIRMED**, by a stronger method than the
>   first verifier's (noise floor 0.000, far control 0.000, and `inset(0)` proven
>   *pixel-equivalent to deleting the shadow*: delta −0.007). See §02.
> - **T1b extra** — the SHIPPED guard `history-verify.mjs:409-434` was audited: it toggles the
>   *shadow*, not the *clip*, but it still goes **RED** when the insets are zeroed
>   (delta drops to exactly 0 vs a `>1` threshold, headroom 3.03, A/A noise 0.00). Sound.
> - **T3 partial** — `PM56_EXT.collisions` is **`[]`** at runtime on the snapshot, and the
>   registry now genuinely chains (see §03). **I did NOT get to the "make it go non-empty"
>   half** — that check is still owed.
>
> **NOT REACHED — next agent should start here, in this order:**
> 1. **Item 9 Context Lens by pixels — MY INSTRUMENT IS BROKEN, DO NOT TRUST §04's reds.**
>    `scratchpad/w5v2/lens-pixels.mjs` reports 8 pass / 7 fail but its **A/A noise floor is
>    0.37 relative** and it only sees 21 of 26 messages, so *every* red in it is unsafe.
>    Diagnosis in §04 — the leading suspect is `.transcript{scroll-behavior:smooth}`
>    (`styles.css:153`): the harness sets `scrollTop`, waits 120ms, screenshots, and only THEN
>    reads `getBoundingClientRect()`, so crops are read from a still-moving layout. Fix:
>    force `scroll-behavior:auto`, read the rects **before** the screenshot, re-read after and
>    require them equal, and re-establish the A/A floor **first**. Do not report any lens
>    verdict until A/A is ~0.
> 2. **Item 12 Orbit** — `orbit-verify.mjs --file <snap> --negative`. Not started.
> 3. **Item 15a Decisions** — `questions-verify.mjs`; the two high-value ones are take-7-only
>    evidence at narrow widths and **D7 draft preservation across flow switches**. Not started.
> 4. **Item 13 Thread Ops** — `tests/threadops-verify.mjs --themes`; **Rewind writes a restore
>    point FIRST and deletes nothing**, and the destructive confirm is genuinely modal.
>    Not started, but I read the source: `threadops.js:423-459` `rewindTo()` *does* call
>    `createRestorePoint()` before `t.messages.splice()`, and the folded turns are kept
>    verbatim in `rec.messages`, so the property looks right **on inspection only — unverified
>    at runtime**. The confirm carries its own scrim (`threadops.js:1056-1062`,
>    `role=alertdialog`, `aria-modal`) and `--z-dialog:1150` was added for it.
> 5. **T3 rest** — cross-module overlay/pointer stealing, state bleed between threads,
>    `reset-all` chain, the 24 takes, `prefers-reduced-motion`. Not started.
>
> **Latent finding worth someone's time (found by reading, not measuring):**
> `ext.actionAfter()` at `app.js:187` is still a **silent last-wins assignment**
> (`this._after[name]=fn`) — it never records a collision. `action()`/`chainAction()` were
> fixed; `actionAfter()` was not. Currently unexercised (`PM56_EXT._after` has **0 keys** at
> runtime), so it is latent, not live — which is exactly the "unreachable today is a property
> of the data, not the code" case this project has already been bitten by twice.

Working dir: `Concepts/chat-assistant-concepts/5.6 Pro/`
Scratch: `scratchpad/w5v2/`
Edits NO source file. Created only files under `scratchpad/w5v2/`.

## Status
- [x] T1a eye-check `w4orbit/film/02-collapse.png` — SETTLED
- [x] T1b History clip-path A/B — CONFIRMED (+ audited the shipped guard)
- [~] T2 re-verify items 9 / 12 / 15a / 13 — **only item 9 attempted, instrument broken**
- [~] T3 adversarial — only `PM56_EXT.collisions` half-done

## Running notes
### 00 — start
Read ORCHESTRATOR_NOTES.md (476 lines) and WAVE4_VERIFIER_LOG.md (347 lines).

### 01 — T1a SETTLED: CDP screencast really does deliver frames out of paint order
Method (`scratchpad/w5v2/frameorder.mjs`): paint a monotonically-increasing counter into every
frame as an **RGB colour** on a fixed 40x40 beacon driven by rAF, then decode that colour back
**out of the captured pixels**. Paint order is therefore carried *by the frame itself*, so
arrival order can be compared against it without trusting any clock.
Two independent channels, and they agree exactly:
- decoded beacon counter, and
- CDP's own `metadata.timestamp` (which every film script in this project discards).

4 runs x 2 actions (expand / collapse), 1440x900, snapshot `fa9cc44aa39d9453`:

| run | frames | painted-order inversions | metadata.timestamp inversions | in-page rAF trace non-monotonic |
|---|---|---|---|---|
| 1 expand | 34 | 1 | 1 | 0 |
| 1 collapse | 35 | 1 | 1 | 0 |
| 2 expand / collapse | 36 / 34 | 1 / 3 | 1 / 3 | 0 / 0 |
| 3 expand / collapse | 31 / 32 | 1 / 4 | 1 / 4 | 0 / 0 |
| 4 expand / collapse | 34 / 35 | 0 / 1 | 0 / 1 | 0 / 0 |

Every inversion is an **adjacent pair**, and in every case the later-arriving frame is stamped
EARLIER: run-1 expand `…33, 32…` at index 8, `ts` 156.932009 -> 156.921645 (**10.4ms earlier**);
run-1 collapse `…285, 284…` at index 29, ts 162.34852 -> 162.3336 (**14.9ms earlier**).
Rate ~2-12% of frames per run; **zero** runs where the in-page rAF trace was non-monotonic
(0 -> 260px on expand, 260 -> 0 on collapse, 187-204 trace frames per run).
Negative control: swapping frames 1 and n-2 of a clean run makes the detector report 3
inversions, so the detector is capable of going red.
**Verdict: Orbit's hypothesis CONFIRMED with a mechanism.** A single adjacent swap straddling a
large visual change reads exactly as "opened, vanished, reopened" on a contact sheet.
**The fix is free and in the data already: sort frames by `metadata.timestamp`, not arrival.**
Eye-check of the CURRENT `02-collapse.png` (04:19, post-fix re-film): 20 frames, monotonic —
#0-#5 open, #6-#9 open with the ring animating, #10-#11 fading, #12+ collapsed and the next
assistant turn rising. No anomaly remains in the shipped sheet; the anomalous sheet was a pre-fix
one that the re-film overwrote.

### 02 — T1b History clip-path: CONFIRMED, by a stronger method than the first verifier's
`scratchpad/w5v2/clipab.mjs`. Drawer forced **open + unpinned** via `PM56_EXT._actions` (pinned
sets `box-shadow:none`, so pinned cannot test the claim — same trap the first verifier hit).
Transitions frozen for **every** condition, six conditions, same two clip rects throughout.
Near strip = 70x400 immediately right of the drawer edge; far strip = same size, +300px right.

| condition | clip-path | box-shadow | near mean | far mean |
|---|---|---|---|---|
| A shipped | `inset(-90px -90px -90px 0px)` | float | **16.461** | 12.379 |
| A2 shipped again | same | float | **16.461** | 12.379 |
| B forced | `inset(0px)` | float | **18.575** | 12.379 |
| C forced | `none` | float | 16.402 | 12.379 |
| D shipped | `inset(-90px…)` | **none** | **18.582** | 12.379 |
| A3 shipped again | same | float | 16.261 | 12.379 |

Deltas: **noise floor A vs A2 = 0.000** (per-column all zero), A vs A3 = -0.200.
**B vs A = +2.114**, D vs A = +2.121, **C vs A = -0.059** (= noise), and the decisive one:
**B vs D = -0.007** — clipping to `inset(0)` is *pixel-equivalent to deleting the shadow*.
**FAR CONTROL = 0.000 in every condition** — the instrument reports zero where zero is correct.
Per-column deltas for B-A and D-A agree column-for-column (7.21/7.22, 6.88/7.08, 2.00/2.00,
3.73/3.74 …) and decay with distance; A2-A is all zeros.

**Grading the first verifier's method:** conclusion right, method incomplete. It had no A/A noise
floor, no far control, and no `box-shadow:none` equivalence — so its 16.14-vs-19.34 was a bare
delta with no scale. (Its self-logged polarity slip was in its own scratch script only.)

**Adversarial extra — is the SHIPPED guard real?** `history-verify.mjs:409-434` claims to test the
clip but its A/B actually toggles the **shadow**. Reproduced its exact 20x16 rect and `>1`
threshold: withShadow **15.64**, without **19.67**, **headroom 3.03**, A/A noise **0.00**.
Then forced `clip-path:inset(0px)`: withShadow **19.67**, without **19.67**, delta **exactly 0**
-> the shipped assertion **goes RED**. So the indirect guard does catch the regression, and it is
not flaky. Confirmed both directions.

### 03 — T3 (partial): the `PM56_EXT.collisions` invariant
Runtime, snapshot `fa9cc44aa39d9453` (`scratchpad/w5v2/recon.mjs`):
`collisions: []`, `_actions`: **92**, `_after`: **0 keys**, 19 slots
(`headerExtras` 5, `historyChrome` 2, `messageAffordance` 2, all others 1), **0 console
warnings/errors of any level**.
Read of the mechanism (`app.js:160-190`, kept in sync with `EXT_SHIM` in `build.py:45-56`):
`_reg(name,fn,intentional)` now **chains** later-first (`return false` falls through) and pushes
the name into `collisions` only for **undeclared** duplicates, so `collisions.length === 0` is a
real invariant rather than a vacuous one.
Static confirmation that the two known collisions were fixed the declared way, not papered over:
- `toggle-thread-pin` — `history.js:360` `EXT.action(...)` (first, no prev), `threadops.js:1471`
  via `CH()` = `chainAction` (intentional).
- `reset-all` — `goals.js:1051` `EXT.action(...)` with its own manual `prevReset` chain,
  `threadops.js:1672` via `CH()`. Build order (`build.py:25`) puts `goals` **before**
  `threadops`, so goals registers first and no undeclared duplicate is created.
**STILL OWED: I did not run the other direction.** The brief asks for a scratch build that
registers a duplicate so `collisions` is *seen* non-empty. Without that, `[]` is only "the
counter did not fire", not "the counter works". Cheap to do:
`PM56_EXT.action('toggle-history', ()=>{})` from the page after boot should push exactly one
name and log one `console.info`. **Unverified.**

**Latent hole, by inspection:** `ext.actionAfter` (`app.js:187`) is still
`this._after[name]=fn` — a silent last-wins assignment with no collision record. It is
currently unexercised (0 keys), so this is latent, not live.

### 04 — T2 item 9 (Context Lens) by pixels — **MY INSTRUMENT IS BROKEN. REDS UNSAFE.**
Intent: re-verify the 25-cap accumulation and Turn Off through a channel that reads
**neither `PM56_LENS` nor `data-lens-state`/`data-lens-sel`** — the first verifier's
`tests/lens-independent.mjs` cross-checks three readings that all originate in the module's own
store, so a `:has()` selector that stopped matching would pass all three. My method was
**per-message painted mean luminance measured against each message's OWN baseline**, so
"26 shaped" becomes "26 distinct messages are painted dimmer than they were, and nothing else
moved", and Turn Off becomes "every one of them returns to within noise of its own baseline".
The design is sound. The implementation is not.

`scratchpad/w5v2/lens-pixels.mjs`, thread `plain` (26 messages), 1440x900, all
animations/transitions killed with a `*{animation:none!important;transition:none!important}`
style tag. Reported **8 pass / 7 fail** — and the failures are **the instrument, not the app**:

| symptom | value | why it condemns the run |
|---|---|---|
| A/A noise floor, two baseline maps of the SAME state | **maxRelDelta 0.3676**, maxAbsDelta 13.42 | a 37% swing at rest is larger than the 58% dim it is trying to detect |
| messages measured | **21 of 26** | the "wholly visible inside `.transcript`" filter silently drops five |
| at-rest negative control | **7 "dimmed" + 6 "brighter"** with no lens active | implicates a third of the thread at once — the signature of a broken probe |
| "exactly 25 dimmed after seal" | reported 17 | undercounts by the same 5-message shortfall |
| SELFTEST (force every surface to `opacity:.42`) | reported 18 of 21 | **the positive control itself did not go fully green**, which is the tell |

**Leading diagnosis (not yet confirmed):** `styles.css:153` sets
`.transcript{ … scroll-behavior:smooth … }`. `paintMap()` assigns `scrollTop`, waits 120ms,
takes the screenshot, and only **then** reads `getBoundingClientRect()` inside the evaluate — so
the crop rectangles are read from a layout that may still be moving, and every message lands on
a slightly different sub-rectangle between the two baseline passes. That is this project's
"measure now, read later" trap for the **fourth** time (Wave 4's `abverify` stale crop, the
orchestrator's mid-animation menu measurement, the drawer measured mid-spring, this).
Secondary suspects not ruled out: `maxScroll` is computed once and can change; the multi-pass
union can capture the same message at a different scroll offset between runs;
`scrollbar-gutter:stable` plus the `pm-materialize` entrance on `--msg-index`.

**Prescribed repair for whoever picks this up:**
1. force `scroll-behavior:auto` on `.transcript` for the duration;
2. read the rects **before** the screenshot and re-read after, and **discard any message whose
   rect moved** rather than cropping it anyway;
3. re-establish the A/A floor **first** and refuse to run the rest until it is < 0.02 relative;
4. loosen the "wholly visible" filter (or scroll in smaller steps) until all 26 are measured —
   a probe that silently drops 5 of 26 is a matcher matching nothing, in miniature.
**No lens verdict may be reported from this run in either direction.** The first verifier's
CONFIRMED for item 9 therefore stands **un-re-verified by a second method**; it is not refuted.

## My own instrument errors this session (three)
1. **The lens paint map above** — biggest one, described in §04. Caught only because the A/A
   noise floor and the selftest were built in from the start; without them it would have
   shipped as "7 REFUTED" against four innocent modules.
2. **`clipab.mjs` first run measured the wrong state.** It clicked
   `document.querySelector('[data-action="toggle-history"], … , .ph-toggle, …')` — a comma list
   returns the FIRST match in document order, which was not the trigger I meant — and landed on
   `phDrawer === 'closed'`. Every luminance number from that run would have been of an absent
   drawer. Fixed by calling `PM56_EXT._actions['toggle-history']` directly and **looping until
   the state is literally `open`**, rather than assuming one click gets there. Note this is the
   same family as the first verifier's own clip-path error (it measured the **pinned** drawer,
   which has `box-shadow:none` and so could not have been testing the shadow claim at all).
3. **Assumed the anomalous contact sheet was the file on disk.** `02-collapse.png` was re-filmed
   at 04:19 *after* Orbit fixed the four collapse defects, so the sheet I was asked to eye-check
   is the post-fix one and is clean. Spent a pass looking for an artefact in the wrong artefact
   before checking the mtimes against the log. The anomaly was real; the evidence for it was
   overwritten. Settled it by reproducing the **cause** instead (§01), which is the better
   instrument anyway.

## Ranked verdict table (what I can actually stand behind)

| # | Claim | Claimed result | My independent result | Verdict |
|---|---|---|---|---|
| 1 | `02-collapse.png` anomaly = CDP frame-arrival ordering (Orbit's guess, unexplained) | suspected, unproven | Painted-counter beacon decoded out of the pixels + CDP `metadata.timestamp` agree **exactly**: 0-4 adjacent inversions per ~34-frame run, later-arriving frame stamped **10.4-14.9ms earlier**, in 7 of 8 runs. In-page rAF trace non-monotonic **0 of 8 runs**. Negative control (swap two frames) detects 3. | **CONFIRMED — with a mechanism and a fix (sort by `metadata.timestamp`)** |
| 2 | History clip-path `-90px` insets are load-bearing; `inset(0)` clips the shadow and computed style cannot see it | CONFIRMED via 16.14 vs 19.34 | Six-condition A/B: noise floor **0.000**, far control **0.000** in all conditions, `inset(0)` vs `box-shadow:none` differ by **−0.007** (pixel-equivalent), `clip-path:none` vs shipped **−0.059** (= noise), per-column falloff matches column-for-column | **CONFIRMED (first verifier's conclusion right; its method lacked a noise floor, a far control and the shadow-equivalence control)** |
| 3 | The shipped guard in `history-verify.mjs` actually guards the clip | asserted by the CSS comment | It toggles the **shadow**, not the clip — but forcing `inset(0)` collapses its delta from **4.03 to exactly 0.00** against a `>1` threshold, so it **does** go red. Headroom **3.03**, A/A noise **0.00** | **CONFIRMED (sound, if indirectly named)** |
| 4 | `PM56_EXT.collisions` is `[]` | claimed | `[]` at runtime, 92 actions, 0 console output of any level; both known collisions fixed via `chainAction`, build order checked | **CONFIRMED one direction only — the "can it go non-empty" half is NOT done** |
| 5 | `ext.actionAfter()` records collisions like `action()` does | never claimed | It does **not** — still a silent last-wins assignment (`app.js:187`). `_after` has 0 keys today, so latent | **NEW latent defect (low severity, unexercised)** |
| 6 | Item 9 Context Lens (25-cap accumulates, Turn Off) | 34/0 by the first verifier, one store-derived method | **UNVERIFIABLE from my run** — my pixel instrument's A/A noise floor was 0.37 and its own positive control failed. Not refuted; not re-verified either | **UNVERIFIABLE (my instrument)** |
| 7 | Items 12 Orbit / 15a Decisions / 13 Thread Ops | 53/0 · claimed · claimed | **NOT REACHED** | **NOT ATTEMPTED** |
| 8 | Rewind writes a restore point FIRST and deletes nothing | claimed | **By source reading only**, `threadops.js:423-459`: `createRestorePoint()` is called before `t.messages.splice()`, folded turns are held verbatim in `rec.messages`, and the restore-point card is pulled back out of the fold so the audit trail stays visible. **No runtime check** | **PLAUSIBLE ON INSPECTION — UNVERIFIED** |
