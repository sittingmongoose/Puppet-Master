# Coverage Report — Opus 5 Assistant Chat concept workspace

> ## Update — 2026-08-01 (spring physics, reveal, pinning)
>
> ```
> Total assertions   6018   (was 5872)
> Passed             6018
> Failed                0
> Console errors        0
> ```
>
> **Motion coverage, measured rather than asserted:**
>
> | | Before this pass | Now |
> |---|---|---|
> | Concept signatures on a real spring | 0 of 16 | 14 of 16 |
> | Opacity-only signatures left on smooth easing | — | 2 (t2 tone, t8 read-in) — a fade has nothing to overshoot |
> | Popup opening legs on a spring | 0 | all |
> | Question cards with entry choreography | 0 of 8 | 8 of 8 |
> | `.pmx-live` shimmer wired | 0 of 8 | 8 of 8 |
> | Windows with pinnable history | 1 partial (w7, local state) | 8, store-backed |
> | Windows mounting shared history | 5 of 8 | 8 of 8 |
>
> **Vocabulary utilisation.** Last pass found `.pmx-cascade`, `.pmx-live`, `.pmx-press`, `.pmx-pop`,
> `pmx-sweep` and `PMXMotion.enter/exit` had **zero usages** — written and never wired. The cascade
> now drives question option rows, the shimmer drives every live status strip, and press physics
> drive the composer controls.
>
> **Deliberately NOT covered, and why:** the closing legs of popup motion keep their ease-in curves;
> `t2` and `t8` keep smooth easing on their opacity-only signatures. Both are judgement calls
> recorded in the source, not omissions.
>
> **Still not produced:** the archived visual capture set (16 contact sheets at 520px, four at
> 1200px into `evidence/`). Spot checks and programmatic measurement were done throughout; the
> archive itself is not written.

---

> ## Previous update — 2026-08-01
>
> **Assertion coverage widened from one host pairing to all eight.** The previous sweep ran the
> geometry, fit, policy and feature suites against w1+t1 only; they now run against w1+t1 … w8+t8, each
> across 8 themes × 4 widths × 2 rail states. That widening is what surfaced the w2 rail overflow, which
> a w1-only run could not have reached.
>
> ```
> Total assertions   5872   (was 5338)
> Passed             5872
> Failed                0
> Console errors        0
> ```
>
> **Feature states added to the matrix** — previously every pairing ran in its default state only:
>
> | State | Why it carries risk | Result |
> |---|---|---|
> | Context Lens selection active | Adds a marker to every message row; the most likely source of row-alignment drift | clean |
> | Long thread, 700 messages (`thread-09`) | Windowed list plus the "load earlier" control, never previously measured for overlap | clean |
> | Second queued questionnaire (`thread-12`) | The state that previously exposed a render re-entrancy bug | clean |
> | Hover rows pinned visible over a questionnaire | The hover row rests at `opacity: 0`, so the general overlap check correctly skips it — this state forces it visible so the correction cannot hide a real collision | clean |
>
> **New assertions:**
> - `checkComposerIsOneSurface` — the bordered box must contain the field, attach and send; the field
>   must carry no border or background of its own; neither control may escape the box. Runs at every
>   theme and width (64 additional assertions per pairing).
> - `checkReducedMotionSettled` — geometry matching alone is not sufficient, because an entry animation
>   that ends at zero opacity and an indefinite pulse that keeps running both leave geometry identical
>   while still being wrong. This checks the end state, not the duration.
> - `checkRemovedControls` extended to fail if a draft control reappears in the composer.
>
> **Not covered, stated plainly:** the archived visual capture set (16 contact sheets at 520px, four at
> 1200px into `evidence/`) has not been produced. Spot checks across all four theme families were done
> by eye; the systematic archive was not written.

---

Exact counts. Where coverage is partial I say which part.

---

## 1. Configuration counts

| Dimension | Required | Delivered |
|---|---|---|
| Themes | 8 | 8 |
| Chat widths | 520 / 750 / 975 / 1200 | all four, plus a continuous 520–1200 slider |
| Theme-width configurations | 32 | 32 |
| Rail states | open, closed | both |
| Shell arrangements per pairing | 64 | 64 |
| Mounts | docked, pop-out | both, sharing one semantic state |
| Window concepts | 8 | 8 |
| Thread concepts | 8 | 8 |
| Pairings enumerable | 64 | 64 |
| Pairings mount-smoke tested | 64 | 64 |

**Assertions executed: 3250. Passed: 3250. Failed: 0. Console errors: 0.**

## 2. Host pairings used

Every window is tested with a thread; every thread is tested in a structurally different window.

| Pairing | Why this pairing |
|---|---|
| w1 Ledger + t1 Speaker Turns | the default reference pair |
| w2 Split Desk + t5 Paired Columns | both change shape with width — the widest-swing combination |
| w3 Focus Column + t8 Reading Mode | w3 provides **no** `threadHistory` region |
| w4 Stacked Panes + t2 Two-Tone Slabs | accordion host, time-multiplexed space |
| w5 Command Bar + t6 Work Interleave | no header at all, plus the zero-nested-boxes thread |
| w6 Docked Sheets + t7 Cards with Air | sheet host, plus the most vertically expensive thread |
| w7 Two-Rail + t3 Timeline Spine | two coexisting rails, plus the spine concept |
| w8 Frameless + t4 Digest | w8 provides **neither** `threadHistory` **nor** `workSurfaceHost` |

The last row is the important one: it proves a thread renders its work surfaces inline when no host
region exists, rather than losing them.

## 3. Required feature states

All 28 render and were inspected. Column three names where each is exercised.

| # | State | Evidence |
|---|---|---|
| 1 | Baseline sustained conversation | every pairing, all 32 configs |
| 2 | Long assistant message collapsed | thread-01, 9 messages over 1200 chars |
| 3 | Long assistant message expanded | `setExpanded` verified per pairing |
| 4 | Long user message collapsed | thread-03 (`blue lantern checkpoint`) |
| 5 | Long user message expanded | same, expanded state |
| 6 | Active live activity summary | `runtime.liveStatus`, updates in place with worked timer |
| 7 | Completed activity history collapsed | `condenseLabel`, thread-01 |
| 8 | Completed activity history expanded | stage detail sheet |
| 9 | Questionnaire active | thread-12 |
| 10 | Completed questionnaire in transcript | thread-03 message `t03-m0014` |
| 11 | Goal only | thread-17 (added; no supplied thread had this) |
| 12 | Todo only | thread-06 |
| 13 | Subagents only | thread-10 |
| 14 | Diff only | thread-18 |
| 15 | Goal plus Todo | thread-06, thread-11 |
| 16 | Goal + Todo + subagents + diff | thread-01 |
| 17 | Search, Current Thread scope | behavior suite, default scope |
| 18 | Search, All Threads scope | behavior suite, grouped by thread |
| 19 | Context Lens selection mode | lens suite |
| 20 | Context Lens applied state | `stateOf` returns muted/focused/subcompacted/source |
| 21 | Active thought stream collapsed | thread-05 `t05-m0018` |
| 22 | Active thought stream expanded by setting | same, `keepActiveOpen` |
| 23 | Agent working, empty composer, Stop visible | Send/Stop machine assertion |
| 24 | Agent working, user typed, Send visible | same |
| 25 | Draft recovery after simulated restart | snapshot → rehydrate into a fresh store |
| 26 | Artifact shortcut and editor-tab handoff | thread-13, three artifacts |
| 27 | Exact jump into unloaded older history | thread-09, 650 messages unloaded |
| 28 | State restoration after docked/pop-out change | 4 state categories asserted explicitly |

**Partial:** states 2–5, 7–8, 19–22 and 26 are verified by assertion and by inspection at the pairings
above, not by a captured image at each of the 32 configurations individually. The contact sheet covers
eight configurations per image, which is the mechanism intended for that, but a full 28 × 32 image set
was not produced.

## 4. Demo data

`demo/demoData.json` is the supplied file, **byte-identical at 349,661 bytes, never edited**. All
additions live in `demo/demoDataExtension.js`, generated deterministically by
`demo/build-demo-bundles.mjs`.

| Measure | Supplied | After extension |
|---|---:|---:|
| Threads | 15 | **18** |
| Messages | 400 | **1052** |
| Longest thread | 120 | **700** (50 initially visible, 650 unloaded) |
| Messages over 1200 chars | 1 | **9** |
| Archived threads | 0 | **1** |
| Diff files with status `deleted` | 0 | **1** |
| Messages where worked ≠ total elapsed | 0 | **46** |
| Threads with a Goal and nothing else | 0 | **1** |

The extension exists because the supplied data could not exercise several required states. Its median
message is 105 characters and exactly one of 400 exceeded 1200, so long-message collapse could not be
judged at all; two of the three named search phrases were not inside collapsed content. The data
contract explicitly permits extension provided coverage is not reduced.

## 5. Reduced motion

Verified per pairing across all 32 configurations: geometry after toggling reduced motion matches
normal motion within 2 px, and no element is left mid-transition. Both the OS preference and the
in-workspace toggle are honored, and animation/transition **delays** are zeroed as well as durations.

## 6. Not covered

Stated plainly rather than implied.

- **Headless matrix now runs, visual matrix does not.** The functional sweep executed in a real
  Chromium: 128 pairing/width runs, 512 assertions, zero failures, recorded in
  `interaction-test-report.json`. What is still not captured is the full VISUAL matrix
  (history x artifact x rail x mount x reduced motion); `evidence/` holds 14 targeted captures
  rather than the complete grid.
- **No 28 × 32 exhaustive image set.** See section 3.
- **Full manual visual review of all 64 pairings was not done** — the contract does not require it, and
  the 64 pairings received the automated mount smoke test instead.
- **Accessibility beyond reduced motion** was not audited. Reduced motion is the stated accessibility
  focus for this exercise; production keyboard, focus, and screen-reader obligations are untouched by
  this prototype and remain owned by the Plans.

## Measured fixture counts

Printed by `node demo/build-demo-bundles.mjs`. Measured from the merged corpus, not restated from
the generator source, so a record that fails to land shows up as a number rather than as a claim.

| Key | Value |
|---|---|
| `threads` | 18 |
| `messages` | 1053 |
| `longestThread` | 700 |
| `over1200` | 9 |
| `over2500` | 0 |
| `over5000` | 0 |
| `medianLen` | 98 |
| `archivedThreads` | 1 |
| `deletedDiffFiles` | 1 |
| `divergingRuntime` | 47 |
| `todoMax` | 8 |
| `agentRoutes` | 6 |
| `agentStates` | blocked, completed, queued, retried, running, stopped, None |
| `activityKinds` | browser, read, search, test, verify, web |
| `conflicts` | 1 |
| `decisions` | 3 |
| `attachmentClasses` | unsupported |
| `bsdStates` | auto, on |
| `outboxEntries` | 1 |
| `threadOpRecords` | 4 |
| `questionKinds` | freeform, multi select, single select |
| `goalPhases` | start, pause, resume, replan, blocked, complete |
| `verificationMessages` | 1 |

`demo/demoData.json` is byte-frozen at 349,661 bytes and is only ever read. Regeneration is
byte-identical across runs, verified by checksum before and after a second run.
