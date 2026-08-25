# FILM A — motion inspection of Menus / Goals / Transcript / Context

Agent: **W1B** (read-only). Written incrementally, one section per area.

## Rig, target, discipline

| | |
|---|---|
| Target | `handoff/w6/frozen-9315f951.html` (frozen snapshot, md5 `ab94fcc3a253…`, 1 371 068 bytes) |
| Rig | `handoff/w5/rig.mjs` — `boot()`, `makeFilmer()`, `rafTrace()` |
| Output | `handoff/w6/filmA/{film,shots,traces}` + the probe scripts `handoff/w6/filmA/*.mjs` |
| Env for every run | `PM56_TARGET=<frozen>` `PM56_OUT=<BASE>/handoff/w6/filmA` |
| Boot | clean — `errs.length === 0` on every run below; `window.__PM56_BOOT_OK` reached in all runs |

Rules held to throughout:

* **All timing numbers come from an in-page `rAF` trace.** Contact-sheet `+Nms`
  captions are appearance evidence only and are never quoted as timing.
* **CDP frame reordering**: every screencast consumer here sorts by
  `metadata.timestamp` exactly as `rig.mjs` does. Out-of-order arrivals were
  observed and reported by the rig on 3 of 4 menu films.
* **Painted pixels, not rects**, for every presence/absence claim
  (`elementFromPoint` + screenshot-crop colour reads).
* **Every clean verdict carries a positive control** — an injected fault that
  makes the same instrument read red.
* The work simulation is **paused** (`PM56_DEMO.pauseWorking()`) for every
  pixel-difference run, because its 2 s tick otherwise contributes a moving
  background that swamps the signal (measured: it held the close-presence floor
  at 0.74 instead of the paused floor).

---

# AREA 1 — MENUS (`menus.js`, `menus.css`)

## What was filmed, and with what trigger

Menus are opened by an **in-page** `element.click()` on
`[data-action="open-menu"][data-menu=…]` and closed by an **in-page**
`KeyboardEvent('keydown',{key:'Escape'})` (`app.js:1727` → `closeMenu()`
`app.js:1452`). Nothing is driven by a Playwright click, so no ~200 ms
round-trip enters any number below.

| Script | Produces |
|---|---|
| `filmA/10-menus-close.mjs` | `traces/menu-close-{mode,model,permissions}.json`, `film/menu-open-{mode,model}.png`, `film/menu-close-{mode,model}.png` |
| `filmA/11b-menus-pixels.mjs` | `traces/menu-presence-paused.json` |
| `filmA/12-menus-spring.mjs` | `traces/menu-height-spring.json`, `traces/menu-submenu.json`, `traces/menus-spring-report.json` |
| `filmA/13-menus-cornerflash.mjs` | `traces/menu-cornerflash.json`, `film/corner-*.png` |
| `filmA/14-menus-hooks.mjs` | `traces/menu-hooks.json`, `traces/menu-hooks-reduced.json` |

## 1.1 The close opacity curve — the unsettled eye-check — **CLEAN**

`menus.css:209` declares `transition: opacity 45ms ease-in 175ms, transform
220ms cubic-bezier(.45,.05,.55,.2)` on `.pm56-menu-ghost`. CSS inspection
cannot say what that *looks* like, so it was traced per frame and then looked at.

rAF trace, in ghost-relative time (τ = 0 at the frame the ghost's transition
starts; identical to ±1 ms for `mode`, `model` and `permissions`):

| τ (ms) | opacity | scale (x, y) |
|---:|---:|---|
| 0 | 1.0000 | 1.000, 1.000 |
| 100 | 1.0000 | 0.951, 0.909 |
| 133 | 1.0000 | 0.903, 0.820 |
| 166 | 1.0000 | 0.838, 0.699 |
| 183 | 0.9454 | 0.802, 0.632 |
| 199 | 0.6236 | 0.765, 0.564 |
| 216 | 0.1200 | 0.728, 0.494 |
| ~220 | node removed | (target 0.72, 0.48) |

**The fade is genuinely held back.** The last exact `opacity: 1` sample is at
τ = 166 ms = **76 % of the 220 ms collapse**; the first sub-1 sample is at
τ = 183 ms = 83 %. The declared crossover is 175/220 = **79.5 %**, which is
bracketed by those two samples one frame apart. The box therefore shrinks to
about **84 % wide × 70 % tall at full opacity** and only then blinks out over
the last 45 ms. That is ACD-439 as written, and the frames agree
(`film/menu-close-mode.png` #6→#11).

The 0.120 reading at τ = 216 is *not* a truncation: the transform transition and
the opacity transition are both 220 ms long, `transitionend` on `transform`
fires at the same instant the opacity reaches 0, and `GHOST_MS = 260`
(`menus.js:62`) is a backstop behind that, not a cut. The ghost's last sampled
frame before removal is one rAF short of the natural end.

**Positive control for this measurement:** the same probe reads `null` for
opacity whenever `.pm56-menu-ghost` does not exist, and it did exactly that on
the reduced-motion run (`traces/menu-hooks-reduced.json`, ghosts = 0 for the
whole window) while reading 1 → 0 on the normal run through the identical code
path. The instrument distinguishes "no ghost" from "ghost at opacity 1".

## 1.2 Does the ghost flash? — **CLEAN (with a red control)**

Instrument: per-screencast-frame mean-absolute-difference over the menu's
at-rest rect, against a still captured with the menu **closed**, normalised so
`1.0` = menu fully present. A flash is a non-monotone dip.

```
CLOSE mode (real)   1.4527 1.4527 1.4527 1.4527 1.4462 1.4462 1.4462 1.4526 1.4527
                    1.4077 1.3841 1.3150 1.2671 1.1806 0.9934 0.8669 0.8406 0.8406 …
                    NON-MONOTONE DIPS: []
```

Monotone decay, floor reached and held. (The 0.84 floor is a fixed
screenshot-vs-screencast rasterisation offset, constant across all frames; only
the 0.60 of dynamic range is signal.)

**Positive control (`traces/menu-presence-paused.json` → `control`)**: the same
run with the live menu forced to `visibility:hidden` for one frame from inside a
`requestAnimationFrame`, then restored:

```
CONTROL  … 1.4482 1.4482 0.8457 0.8459 1.4477 1.4476 …
         NON-MONOTONE DIPS: [{t:88,p:0.846,before:1.448,after:1.448},
                             {t:115,p:0.846,before:1.448,after:1.448}]
```

The instrument goes red on a **single injected blank frame**. It did not go red
on the real close. There is no gap between the live menu leaving the DOM and the
ghost appearing.

## 1.3 The ghost is visually correct and un-addressable — **CLEAN**

`menus.js:344-360` strips `id`, every `data-*`, `name`, `title`, `aria-label`,
`role` and `tabindex` from the clone and all its descendants before it enters the
document. Re-run of the shipped audit's own sequence (open `mode` → Escape →
open `mode`), sampled every frame while the ghost is in flight
(`traces/menu-hooks.json`):

| | during flight |
|---|---|
| `.pm56-menu-ghost` | 1 |
| `.overlay-menu` | **2** (live + ghost — classes deliberately survive) |
| `[data-overlay="root-menu"]` | **1** |
| `[data-submenu="deep-plan"]` | **1** |
| `[data-action="set-mode"]` | **5**, not 10 |
| `[id]` inside the ghost | 0 |
| `[data-action] / [role] / [aria-label] / [title] / [tabindex]` inside the ghost | 0 |
| computed `pointer-events` | `none` |
| `document.elementFromPoint(ghost centre)` | `DIV.activity-wrap` — the page *behind* it |

Visual correctness was checked on the frames, not on the DOM:
`film/menu-close-mode.png` frames #6–#11 show the collapsing clone carrying the
full menu — heading "Mode", the `/agent` badge, all five rows with their icons
and subtitles, and the check mark still on **Agent**. Nothing is missing, blank
or re-flowed in the clone.

**Positive control:** the same locator battery read `[data-submenu="deep-plan"]
= 1`, `.overlay-menu = 1` before the trigger, and the run aborts loudly if the
menu failed to open — the first version of this probe *did* fire Escape on a
closed menu and reported ghosts = 0 for every frame, which is precisely the
"selector matching nothing looks like a measured zero" failure. It was caught by
the pre-trigger assertion and the probe was fixed, not the finding.

## 1.4 Corner sprout — **CLEAN**, including the static-origin flash hazard

`menus.css:96-106` exists because an unpositioned first frame can flash at the
document's static origin. The DOM trace shows that window really is reachable:
one frame after the submenu is requested, `.overlay-menu[data-overlay="sidecar"]`
is in the document at box `(0, 0, 233.5 × 122.2)` with **opacity 1 and transform
none** (`traces/menu-submenu.json`, t = 0), before `pm56-s-hidden` and
`pm56-s-pin` move it to `(8, 8)` at opacity 0 and then to its real place.

Whether that DOM state is ever *painted* is a pixel question, so it was measured
as one: percentage of the top-left 420 × 260 of the viewport that differs from a
steady reference, per screencast frame.

| run | frames over 2 % changed |
|---|---|
| submenu open | **none** — 0.00 % on all 28 frames |
| root menu open | **none** — a steady 0.76 % (a sidebar item taking its active state; present on every frame, so not a flash) |
| **control**: a 233 × 122 box appended at `(0,0)` for one frame | **25.42 % for 3 frames** |

The control's 25.4 % is the arithmetically correct coverage for a 233 × 122 box
in a 420 × 260 crop (26 %), so the instrument is calibrated as well as live.
The arming classes win the race; nothing is painted at the origin.

Sprout timing from the same trace (submenu, sidecar lane):

* opacity `0 → 1` over **163 ms** (declared 160 ms `var(--ease)`),
* transform `scale(0.48, 0.72) → 1` over **~300 ms**, peaking at
  **sx 1.0488** at τ = 129 and settling at τ ≈ 296 (declared 300 ms
  `cubic-bezier(.22,1.55,.36,1)`, whose analytic peak for a 0.52 range is
  1.049),
* `transform-origin` computed to `233.5px 21.9994px` = `100% 18%` — the edge
  facing the root menu, i.e. `[data-side="left"]` matched,
* the sidecar settles at `left 906, width 233.5` → right edge 1139.5, flush
  against the root menu's left edge at 1146.5.

Root-menu sprout appearance: `film/menu-open-mode.png` #7–#11 (grow from a small
faint corner-anchored box), #12–#17 (settled).

## 1.5 Search-filter height spring — **CLEAN against its declared curve**, one thing to note

Trigger: `[data-input="model-search"].value = 'opus'` + an in-page `input`
event, fired from inside the rAF loop (`traces/menu-height-spring.json`).
Bottom edge pinned by `pm56-anchor-bottom`.

| t (ms) | height | top | bottom | scaleY | `pm56-r-bounce` |
|---:|---:|---:|---:|---:|:--:|
| 0 | 560.00 | 249.0 | 809 | – | – |
| 51 | 430.52 | 378.5 | 809 | 1.000 | B |
| 114 | 172.73 | 636.3 | 809 | **1.0602** | B |
| **156** | **142.35** | 666.7 | 809 | 1.0563 | B |
| 253 | 168.86 | 640.1 | 809 | 0.9976 | B |
| 421 | **190.00** | 619.0 | 809 | 1.000 | B |
| 437+ | 190.00 | 619.0 | 809 | – | – |

* **The bottom edge never moves**: 809 on every one of the 40 sampled frames.
  The pre-module defect (top pinned, bottom flying 809.5 → 596.5) is gone.
* The height **undershoots to 142.35 against a 190 target** — 47.65 px, i.e.
  25 % of the settled height — then springs back. That is not a bug: the
  declared `height 340ms cubic-bezier(.22,1.72,.36,1)` has an analytic peak
  overshoot of 12.9 %, and 12.9 % of the 370 px travel is 47.7 px. Measured and
  declared agree to 0.05 px.
* `pm56-menu-size-bounce` peaks at **scaleY 1.0602** against a `40 % { 1.055 }`
  keyframe — the extra 0.5 % is the spring easing between keyframes, not a delay.
  Critically it is **one** time value: no phantom delay (the animation is
  visibly running by t = 51 and is off by t = 437 ≈ 380 ms + start).
* Content swaps instantly (28 rows → 2 rows by t = 0) while the box takes
  ~390 ms to arrive, so there is a visible empty region inside the menu for the
  duration of the spring. This is inherent to animating the box rather than the
  list and is what the reference does; recorded as an observation, not a defect.

**Positive control:** the same probe reported `rows: 14 → 2` and
`height 560 → 190` in the same trace, so it was demonstrably reading a live,
changing element; a dead selector would have returned `{gone:1}`, which the
probe emits explicitly.

## 1.6 Close is not a stall — **CLEAN**

The close rAF trace shows a dropped frame between the Escape and the ghost's
first sample (34 ms for `mode`/`permissions`, 77 ms for the 420 × 560 model
picker), which looks like main-thread jank one layer up. It is not: measured
directly with `performance.now()` around the synchronous call, blocked
main-thread time is

```
mode  open 7.6 / close 5.9      model  open 9.1 / close 11.1
permissions 12.6 / 17.6         wand 11.6 / 11.1
worktree 13.3 / 11.0            persona 12.5 / 11.6      (ms)
```

— 6–18 ms, i.e. under one frame in every case. The dropped frame is style /
layout / paint of the removal plus the clone insertion, and it is covered: the
last painted content in that window is the full-size menu (§1.2 shows no dip),
so the eye sees a hold, not a hole.

## 1.7 Reduced motion — **CLEAN**

`traces/menu-hooks-reduced.json`, `boot({reducedMotion:true})`: `.pm56-menu-ghost`
count is **0 on every frame** of a close, matching
`menus.js:337 if (reduced() || !L.snap) return;` and
`menus.css:341 .overlay-menu.pm56-menu-ghost { display:none !important }`.
**Positive control:** the identical probe on the identical sequence read
ghosts = 1 with a live opacity ramp under `no-preference`.

## Area 1 verdicts

| # | Finding | Class |
|---|---|---|
| M1 | Close opacity held at 1.000 to 76 % of the collapse, first fade sample at 83 %, declared crossover 79.5 % — asymmetric close is real and correct | **CLEAN** |
| M2 | No flash / no gap between live menu and ghost (monotone presence decay; control red on 1 injected blank frame) | **CLEAN** |
| M3 | Ghost carries no `id`, no `data-*`, no `role`/`aria-label`/`title`/`tabindex`; `pointer-events:none`; hit-test passes through; content renders complete and correct | **CLEAN** |
| M4 | No paint at the document static origin on root-menu or submenu open (control: 25.4 % for 3 frames) | **CLEAN** |
| M5 | Height spring: bottom edge pinned at 809 on all frames; 47.65 px undershoot matches the declared bezier to 0.05 px; size-bounce carries no phantom delay | **CLEAN** |
| M6 | Sprout: opacity 163 ms, transform 300 ms peaking at 1.0488, origin `100% 18%` on the edge facing the root menu | **CLEAN** |
| M7 | Blocked main-thread time on open/close is 6–18 ms across all six menus | **CLEAN** |
| M8 | Reduced motion suppresses the ghost entirely | **CLEAN** |

**Still owed in Area 1:** the `worktree`, `wand` and `persona` menus were only
measured for synchronous cost (§1.6); their sprout geometry and close were not
filmed. The upward-opening (`data-pm56-sprout="t"`) variant was never reached —
every menu in the 1440 × 900 viewport opened upward from a bottom trigger
(`origin-y: 100%`), so the `--pm56-ty: -10px` branch is unexercised.

---

# AREA 2 — GOALS (`goals.js`, `goals.css`)

## What was filmed, and with what trigger

Viewport 1500 × 1200 so the goal editor's phase list fits. State reached with
`PM56_DEMO.openActivity('goal')` → in-page click on `[data-action="open-goal"]`
→ `scrollIntoView` on the current phase → 800 ms settle. **Then** the completion
is triggered once, by an in-page click on `[data-action="goal-agent-step"]`
(`goals.js:744`, handler `goals.js:879` → `agentStep()` `goals.js:830`).

| Script | Produces |
|---|---|
| `filmA/22-goals-wipe.mjs` | `traces/goal-wipe.json`, `traces/goal-wipe-geom.json` |
| `filmA/23-goals-restart.mjs` (`cost` / `rerender` / `reflow`) | `traces/goal-step-cost.json`, `traces/goal-wipe-rerender.json`, `traces/goal-reflow.json` |
| `filmA/24-goals-pixels.mjs` | `traces/goal-wipe-columns.json` |
| `filmA/25-goals-sheet.mjs` | `film/goal-strike-wipe-zoom.png`, `traces/goal-settled-strikes.json` |
| `filmA/26-goals-washcut.mjs`, `26b-goals-arrivereplay.mjs` | `traces/goal-washcut-{450,250}.json`, `traces/goal-arrivereplay-450.json` |
| `filmA/27-goals-replay-natural.mjs` | `traces/goal-arrive-replay-natural.json` |
| `filmA/28-goals-replay-film.mjs` | `film/goal-completion-2s.png` |

Every run prints a **PRE** line asserting the trigger exists and is enabled and
the current phase's title, and aborts if not — the same discipline that caught a
false zero in Area 1.

## 2.1 **CONFIRMED DEFECT G1** — a completed phase row vanishes and re-arrives ~0.8 s later

This is the headline finding of Area 2, and it is reachable in the **shipped
default state with nothing forced** — `27-goals-replay-natural.mjs` does not
call `pauseWorking()`; the work simulation's own tick supplies the render.

rAF trace of the just-completed row (`traces/goal-arrive-replay-natural.json`):

| t after completion | opacity | clip-path | animation | `data-wipe` | `elementFromPoint` at the row's own centre |
|---:|---:|---|---|---|---|
| 674 ms | 1 | `none` | `goal-phase-complete` | `1` | `SPAN.goal-phase-copy` |
| **794 ms** | **0** | **`inset(0px 0px 100%)`** | `goal-phase-arrive` | `null` | **`OL.goal-phases`** — the list *behind* the row |
| 896 ms | 0.647 | `inset(0 0 61.7%)` | `goal-phase-arrive` | null | `OL.goal-phases` |
| 970 ms | 0.980 | `inset(0 0 17.7%)` | `goal-phase-arrive` | null | `SPAN.goal-phase-copy` |
| ~1240 ms | 1 | `inset(0 0 0%)` | settled | null | `SPAN.goal-phase-copy` |

Painted-pixel confirmation, `film/goal-completion-2s.png` (30 frames over 1.9 s):
**frame #12 (+769 ms) is empty** — the row's whole crop is background. #13
(+857 ms) shows it half-revealed from the top. #14 (+910 ms) has it back.

### Mechanism (the layer it actually lives on)

* `goals.css:71-72` gives **every** `.goal-phase` `animation: goal-phase-arrive
  var(--spring-soft) both`, whose `0%` is `opacity:0; translateY(-4px);
  clip-path: inset(0 0 100% 0)`.
* `goals.css:134` overrides that for the completing row:
  `.goal-phase.completed[data-wipe="1"]{animation:goal-phase-complete 520ms …}`.
  The comment above it (goals.css:127-133) states the intent exactly: *"A row
  that just COMPLETED must not also clip-reveal: the reveal would wipe over the
  strikethrough and the completion would read as 'this row was rebuilt'"*.
* `goals.js:377-380 wipeFlag()` emits `data-wipe="1"` and starts a **420 ms**
  timer, after which `settled[p.id] = true` and later renders stop emitting it.
* The row's DOM node is **preserved** across renders — proved with an expando
  (`24-goals-pixels.mjs`: `sameNode:true, expandoSurvived:true`).

So the first render after 420 ms removes the attribute from a *live* node,
`animation-name` flips `goal-phase-complete → goal-phase-arrive`, and CSS starts
that animation from its `0%` keyframe. The guard holds for exactly as long as
the flag does, and then hands the row straight to the animation the guard exists
to prevent.

**Reproduced deterministically** (`26b-goals-arrivereplay.mjs 450`): forcing one
`renderApp()` at 450 ms produces the identical snap — opacity `1 → 0`, clip
`0% → 100%`, `translateY(0 → -4px)` in a single frame, then a 440 ms re-reveal.
Forcing the same render at **250 ms** (`26-goals-washcut.mjs 250`) does **not**
trigger it: `data-wipe` is still `1`, and the wipe and wash continue unbroken.
The 420 ms boundary is the switch.

**File:line:** `goals.js:377-380` (the 420 ms flag lifetime) against
`goals.css:71-72` (the unconditional arrive animation on `.goal-phase`) and
`goals.css:134` (the guard that only lasts as long as the flag).

## 2.2 **CONFIRMED DEFECT G2** — the 233 ms wipe cannot start for ~100 ms because the app is blocked

The wipe *looks* late and abrupt. It is not the wipe.

`traces/goal-wipe.json` — strike width, and the frame clock:

```
t=  0   class flips to .completed, data-wipe=1, animation goal-strike-wipe/0.233s/0s, strikeW 0
t= 85   strikeW 0      <-- an 85 ms frame gap: no rAF ran between t=0 and t=85
t=100   strikeW 0
t=117   strikeW 13.14
…
t=339   strikeW 72.73  (final)
```

Measured directly with `performance.now()` around the synchronous call
(`traces/goal-step-cost.json`):

```
phase completion  blockedMs 72.8, then 90.2
bare renderApp()  via PM56_DEMO.openActivity('goal'): 64.2 / 58.0 / 60.6 ms
```

So the completion handler blocks the main thread for **73–90 ms**, of which
**58–64 ms is the whole-app `renderApp()`** that `goals.js:879` calls — the goal
logic itself is ~15–25 ms. Chrome sets a CSS animation's start time at the first
rendering opportunity after the style change, so the animation clock only starts
at t ≈ 104 (back-solved from `13.14 / 72.73 = 0.181` on
`cubic-bezier(.34,.86,.4,1)`), and 4–5 frames are dropped in front of it.

For contrast, the menus in Area 1 go through `renderOverlays()` and block for
6–18 ms. This is a `renderApp()` cost, not a goals cost, but it is the goal
wipe that pays for it.

## 2.3 The wipe itself — **CLEAN**

Once its clock starts, the wipe is exactly what `goals.css:111-122` declares.

* **Duration 233 ms.** Clock start back-solved at t ≈ 104; final width 72.73
  reached at t = 339 → **235 ms ± one frame**. Declared: 233 ms.
* **Direction left → right.** `transform-origin: left center`; the strike's left
  edge is pinned at x = 80 on every frame while the right edge travels
  80 → 152.73. Confirmed in painted pixels on the 3× zoom sheet
  `film/goal-strike-wipe-zoom.png`: #7 (+200 ms) green wash, bright text, **no
  strike**; #8 (+256 ms) strike across the left third of "Implement"; #9
  (+284 ms) across two thirds; #10 (+331 ms) complete.
* **It does not snap.** 15 distinct intermediate widths were sampled
  (13.14, 25.8, 37.6, 47.9, 55.9, 61.8, 65.8, 68.5, 70.3, 71.4, 72.1, 72.5,
  72.7, 72.73) — a monotone eased ramp, not a step.
* **It does not restart under a re-render.** A full `renderApp()` fired at the
  frame where the strike was 13.14 px across left it at 13.14 px in the same
  frame and 47.82 px two frames later — the un-restarted curve
  (`traces/goal-wipe-rerender.json`). Node identity confirmed by expando.
* **Settled geometry is exact**: on every completed row the strike's painted
  width equals the title's text width to 0.1 px — Audit 36.3/36.3, Research
  62.3/62.3, Prototype 67.2/67.2, Implement 72.7/72.7
  (`traces/goal-settled-strikes.json`).

**Positive control for the direction claim:** the same column-profile instrument
that read the real wipe was pointed at an injected **mirrored** wipe
(`transform-origin: right center`, same 233 ms curve, same band) and reported the
opposite march — leftmost lit column 38 → 22 → 16 → 9 → 4 with the rightmost
pinned at 56 (`traces/goal-wipe-columns.json` → `control`). The instrument can
tell the two apart. Note that on the *real* wipe that same column profile was
swamped by the row's 520 ms background wash — which is why the direction verdict
rests on the 3× zoom sheet, not on the profile.

## 2.4 The row does not reflow under the wipe — **CLEAN**

All seven editor rows, sampled every frame from −17 ms to +1171 ms
(`traces/goal-reflow.json`):

```
Audit@316.67/52.03  Research@373.7/52.03  Prototype@430.73/52.03
Materialized@543.91/52.03  Implement@600.94/52.03  Verify@714.11/52.03
```

— every `top/height` pair identical on every frame, and the editor's
`scrollTop` constant at 418. The only row that moves is `Handoff`, the row that
*becomes* current: 771.14 → 767.14 → 771.14, i.e. the designed 4 px
`goal-phase-arrive` slide, and it is below the completing row.

**Positive control:** the same probe registered `Handoff`'s 4 px travel and, in
the run of §2.1, registered the completing row's own opacity going to 0 — it is
demonstrably able to report movement and absence.

## 2.5 Wash truncation — measured, and **below the perceptual floor**

When `data-wipe` is dropped at ~420 ms, the 520 ms `goal-phase-complete` wash is
also cut. Measured (`traces/goal-washcut-450.json`): the background jumps from
`oklab(0.21232, −0.00038, −0.02789)` to the resting `rgb(19,23,37)`
(= `oklab(0.20778, 0.00076, −0.02859)`). ΔL = 0.0045 against a total wash travel
of ΔL = 0.156 — **2.9 % of the animation's colour distance**. Recorded for
completeness; not called a defect. (The *same* render is what triggers G1, which
is not below any floor.)

## Area 2 verdicts

| # | Finding | Class |
|---|---|---|
| **G1** | A just-completed phase row goes to `opacity:0` + `clip-path:inset(0 0 100%)` and re-arrives over 440 ms, ~0.8 s after completion, in the shipped default state. `elementFromPoint` at the row centre returns the list behind it; frame #12 of `goal-completion-2s.png` is blank. `goals.js:377-380` vs `goals.css:71-72` / `goals.css:134` | **CONFIRMED DEFECT** |
| **G2** | Completing a phase blocks the main thread 72.8–90.2 ms (58–64 ms of it a whole-app `renderApp()` from `goals.js:879`); the 233 ms wipe's clock does not start for ~104 ms and 4–5 frames are dropped in front of it | **CONFIRMED DEFECT** |
| G3 | Wipe duration 235 ms measured vs 233 ms declared | **CLEAN** |
| G4 | Wipe direction left → right (pixels, 3× zoom sheet; mirrored control read right → left) | **CLEAN** |
| G5 | Wipe does not snap (15 eased intermediate widths) and does not restart under a mid-wipe render (node identity proved by expando) | **CLEAN** |
| G6 | No reflow: all 7 rows hold `top/height` and `scrollTop` across the completion | **CLEAN** |
| G7 | Settled strike width == title text width to 0.1 px on all completed rows | **CLEAN** |
| G8 | Wash truncated at 420 ms, but only 2.9 % of its colour travel remains | observation |
| G9 | `abandoned` phases carry a `.goal-strike` permanently at `scaleX(0)` — an abandoned phase is never struck through (`goals.css:118` scopes the strike to `.completed` only) | observation (content, not motion) |

**Still owed in Area 2:** the activity-panel copy of the phase list (the
narrower `left: 1119` rendering) was traced for geometry but its wipe was never
filmed separately — both copies mount the same markup, so G1/G2 are expected to
apply to it identically, but that is an inference, not a measurement. Reduced
motion for goals (`goals.css:364-372` collapses the wipe to 1 ms) was **not**
run; G1 in particular should be re-checked under `prefers-reduced-motion`
because `goal-phase-arrive` is not obviously suppressed there. `goal-unblock`,
`goal-reopen-phase` and `goal-move-phase` — the other three phase mutations —
were not filmed at all.

---

# AREA 3 — TRANSCRIPT (`transcript.js`, `transcript.css`, `transcripts.css`)

## Accounting for `scroll-behavior: smooth` first

`styles.css:153` puts `scroll-behavior:smooth` on `.transcript`. Every probe in
this area therefore obeys two rules:

1. **No rect is read while the scroller is in motion.** After any scroll,
   `scrollTop` is sampled twice ~400 ms apart and the run **aborts** unless the
   two agree. (`34-transcript-hover.mjs` prints `scroll parked: 2892 2892
   STABLE (rect reads are safe)`.)
2. When a probe needs to *park* the transcript rather than *measure* the
   scrolling, it sets `style.scrollBehavior='auto'` on the element for that one
   assignment. That is a probe-local inline style on a scratch page, not a
   source edit.

That precaution turned out to matter more than expected: the scroller is itself
the subject of two of this area's findings.

| Script | Produces |
|---|---|
| `filmA/30-transcript-probe.mjs` | structure / at-rest read |
| `filmA/31-transcript-replay.mjs` | `traces/transcript-replay.json` |
| `filmA/32-transcript-send.mjs` | `traces/transcript-send.json` |
| `filmA/33-transcript-scroll-hover.mjs` | `traces/transcript-scroll.json`, `traces/transcript-hover.json`, `traces/transcript-unhover.json` (the aborted hover attempt — kept deliberately, see §3.5) |
| `filmA/34-transcript-hover.mjs` | `traces/transcript-hovergate.json`, `film/message-hover-in.png`, `film/message-hover-out.png` |

## 3.1 **CONFIRMED DEFECT T1** — sending a message never scrolls to it

Trigger: text put in `[data-input="composer"]`, then a single in-page
`KeyboardEvent('keydown',{key:'Enter',ctrlKey:true})` fired from inside the rAF
loop — the path `app.js:1726` → `handleSend()` (`app.js:1588`).

State before the trigger (`32-transcript-send.mjs`, PRE-SEND):
`nMsgs 13, scrollTop 0, scrollHeight 3493, clientHeight 601, atBottom false`.

Per-frame trace for 3 s after the send (`traces/transcript-send.json`):

| t | nMsgs | new nodes | last msg top..bottom | in view | scrollTop / maxScroll |
|---:|---:|---:|---|---|---|
| 0 | 13 | 0 | 3415 .. 3557.3 | false | 0 / 3162 |
| 68 | **15** | **2** | 3696.1 .. 3834.0 | false | 0 / 3162 |
| 350 | 15 | 0 | 3687.6 .. 3826.5 | false | 0 / 3162 |
| 2767 | 15 | 0 | 3687.6 .. 3826.5 | false | 0 / 3162 |

Settled read after the trace:
`{nMsgs:15, scrollTop:0, maxScroll:3162, lastTop:3687.6, inView:false,
hitAtLastCentre:null}`.

**The two new messages land 3687.6 px down a 900 px viewport — 2787 px below the
fold — and the transcript does not move a single pixel in three seconds.**
`document.elementFromPoint()` at the new message's own centre returns `null`,
because that point is off the viewport entirely. The 420 ms arrival animation
(§3.3) plays in full, off-screen, where nobody can see it.

**File:line.** `handleSend()` (`app.js:1588-1603`) pushes the turns and calls
`renderApp()` and stops there. The scroll-to-bottom that every other message
path has —

```
app.js:1569  function appendMessage(msg,thread=activeThread()){ … renderApp();
               requestAnimationFrame(()=>{const tr=document.querySelector(
                 '[data-scroll-key="transcript"]');if(tr)tr.scrollTop=tr.scrollHeight;}); }
```

— is absent from `handleSend`. (The same rAF appears at `app.js:1566` and
`app.js:1938` for boot, and at `app.js:1792` for the history pane.)

**Positive control that this is a live measurement, not a dead selector:** the
same probe's node counter went `13 → 15` and its expando detector reported
`newThisFrame: 2` on the very frame the messages appeared, and the opacity probe
caught them at `opacity 0`. The instrument saw the send happen; it is the scroll
that did not.

## 3.2 **CONFIRMED DEFECT T2** — a render landing inside a smooth scroll drags the scroll backwards

The transcript also boots parked at the top: measured `scrollTop 0` at boot
+500 ms and `0` on all 390 frames of a 6.5 s trace
(`traces/transcript-replay.json`), against `scrollHeight 3493 / clientHeight
601`, i.e. `maxScroll 2892`. `app.js:1566` and `app.js:1938` both ask for
`tr.scrollTop = tr.scrollHeight` in a rAF at boot, so something is undoing it.

Two controlled runs isolate the mechanism (`traces/transcript-scroll.json`):

**A — the scroll on its own.** `tr.scrollTop = tr.scrollHeight`, nothing else:

```
t: 0    67   133  200  267   333   400   467   533   600   667   733   800   867   989
st: 0   22   164  636  1483  1996  2297  2496  2634  2732  2800  2847  2875  2889  2892
```

A clean ~950 ms smooth ramp to the full 2892. Smooth scrolling works, and this
is the **positive control** for run B: the same assignment, same page, reaches
the bottom when nothing interferes.

**B — the same scroll with ONE `renderApp()` fired ~100 ms in** (via
`PM56_DEMO.openActivity('goal')`, which is nothing but a render):

```
t:  0   50   100R  250R  312R  354R  400R  450R  500R  610R  650R … 1750R
st: 0   9    71    847   792   529   305   201   142   106   115  … 116
```

The scroll climbs to 847, **reverses**, and settles at **116 of a possible
2892**. `captureScroll()` (`app.js:1303`) reads `el.scrollTop` mid-flight and
`restoreScroll()` (`app.js:1305`) writes that stale value back in a rAF; because
`scroll-behavior` is `smooth`, that write is not a snap-back but a second
animation, so the scroller visibly *travels backwards* over ~500 ms.

At boot the interfering render is the demo's own `startWorking(true)` at
`app.js:1839` (`setTimeout … 250`), which lands squarely inside the 950 ms ramp
— and every 2 s work tick after it re-restores the same stale value.

**File:line.** `styles.css:153` (`scroll-behavior:smooth`) against
`app.js:1303` / `app.js:1305` (`captureScroll` / `restoreScroll`), with
`app.js:1566` / `app.js:1938` as the scroll that gets cancelled.

This is a *separate* defect from T1: T1 is a missing call, T2 is a call that
gets undone. Fixing only T1 would leave the new scroll to be cancelled by the
next tick.

## 3.3 Message arrival animation — **CLEAN**

`styles.css:155`: `.message { animation: message-arrive 420ms
var(--spring-soft-ease) both }`, keyframes at `styles.css:359`
(`0% {opacity:0; transform:translateY(8px) scale(.993)}`).

Per-frame, on a genuinely new node (`traces/transcript-send.json`):

| t | opacity | transform |
|---:|---:|---|
| 68 | 0 | `matrix(0.993, 0, 0, 0.993, 0, 8)` |
| 117 | 0.270 | `…0.994891 … 5.839` |
| 200 | 0.798 | `…0.998587 … 1.615` |
| 300 | 0.983 | `…0.99988 … 0.137` |
| 350 | 1 | `…1.00005 … −0.0566` (overshoot) |
| 367 | 1 | `…1.00008 … −0.0903` (peak overshoot) |
| 503 | 1 | `matrix(1, 0, 0, 1, 0, 0)` settled |

Opacity ramps 0 → 1 over ~334 ms, `translateY` 8 → 0, `scale` .993 → 1 with a
soft overshoot to 1.00008 / −0.09 px, settling at t = 503 — a 435 ms run for a
420 ms declared duration plus the frame it started on. That is
`--spring-soft-ease` behaving as a soft spring, and it does not snap.

The last message's `top` drifts 3696.1 → 3687.6 across the animation; that is
the 8 px `translateY` resolving, not a reflow — the delta is 8.5 px and the
element's own transform accounts for 8 of it.

**Positive control:** the identical probe read `opacity 1` and
`transform: matrix(1,0,0,1,0,0)` on the thirteen pre-existing messages at
t = −16 and t = 0, then read `opacity 0` on the new one at t = 68. It
distinguishes an arriving node from a settled one in the same trace.

## 3.4 No entrance replay under the work tick — **CLEAN**

`transcript.js`'s header states the hazard directly: *"it lives inside the
transcript, which survives the 2 s work tick, so an unkeyed node would be
remounted and replay its entrance animation twice a second."* The `.message`
wrappers are emitted by `app.js:507`, not by `transcript.js`, and they carry
**no `data-k`** (`30-transcript-probe.mjs`: `msgKeys: [null,null,null,null]`),
so this needed measuring rather than assuming.

Instrument: every `.message` and `.system-card` is stamped with a JS expando
(`__w1b`) on the first frame. An expando cannot survive `outerHTML` replacement,
so a node whose tag is missing on a later frame was remounted.

6.5 s trace with the work simulation **running** (`31-transcript-replay.mjs`
does not call `pauseWorking`), `traces/transcript-replay.json`:

```
MESSAGE NODES REPLACED:                      0 events
FRAMES WHERE ANY node HAD opacity < 1:       0 events
node count over the window:                  min 15, max 15
```

**Positive control:** the identical expando detector, in
`32-transcript-send.mjs`, reported `newThisFrame: 2` on the exact frame two real
messages were appended. The detector fires when nodes actually change identity.

**Caveat, stated rather than hidden:** this run proves the nodes were not
replaced, but it does **not** independently prove that a `renderApp()` occurred
inside the 6.5 s window — `state.work` was sampled only at the start
(`{step:0, running:true, elapsed:0}`) and not re-sampled. §3.6 closes this.

## 3.5 Hover-gated message actions — **CLEAN**

`transcript.css:48-68` moves the gate from the row onto the buttons and adds
`visibility` so an `opacity:0` button is not still hit-tested. Measured on a
message parked in the middle of a **stable** scroller (§3.0), hovered exactly
once from a settled unhovered state — the state is reached, allowed to settle,
and then the thing under measurement is triggered once
(`traces/transcript-hovergate.json`):

| | `:hover` | button opacity | visibility | `elementFromPoint` at the button's centre |
|---|---|---:|---|---|
| at rest | false | **0** | **hidden** | `DIV.message-actions` — the row, **not** the button |
| on hover (settled) | true | **1** | **visible** | a `SPAN` **inside** the button (`hitIsButton: true`) |
| after leaving | false | **0** | **hidden** | `message-actions` again (`hitIsButton: false`) |

The row and the metadata stay on throughout: `.message-actions` computed
`opacity: 1` and `.message-meta` `opacity 1 / visibility visible` at rest. So
the gate really did move down one level — the timestamp and model chips are
readable without hovering, exactly as `transcript.css:10-15` claims, and the
four buttons (`copy-message`, `edit-message`, `message-details`,
`message-overflow`) are the only hidden things.

`visibility: hidden` is doing real work: the hit-test at the button's own centre
resolves to the row behind it at rest, so "absent at rest" is not an
opacity-only claim.

**Positive control — and the false green it caught.** The probe asserts, before
measuring anything, that the hover point is inside the message it intends to
hover (`hoverPointIsInsideThisMessage`), and aborts otherwise. That assertion
earned its keep: the **first** attempt at this measurement
(`33-transcript-scroll-hover.mjs`, kept on disk as
`traces/transcript-hover.json` / `transcript-unhover.json`) ran on a page where
an earlier probe had opened the activity panel, which re-laid-out the transcript.
It reported `:hover false` on all 26 frames, `opacity 0`, `visibility hidden`
and `hitIsButton: false` — which reads exactly like a clean "hidden at rest"
result. It was not: the hit-test string showed `BUTTON.goal-phase-row`, i.e. the
probe point was over the goal panel and the mouse never touched a message at
all. A selector — or in this case a coordinate — matching nothing looks exactly
like a measured zero. Both traces are retained as the worked example.

Appearance: `film/message-hover-in.png` and `film/message-hover-out.png` (18
frames each, cropped to the message).

## Area 3 verdicts

| # | Finding | Class |
|---|---|---|
| **T1** | `handleSend()` appends the turns and never scrolls; the new message lands 2787 px below the fold, `inView:false` on every frame for 3 s, `elementFromPoint` at its centre `null`. `app.js:1588-1603` missing the rAF present at `app.js:1569` | **CONFIRMED DEFECT** |
| **T2** | Any `renderApp()` landing inside a smooth scroll makes `restoreScroll` write a stale mid-flight `scrollTop` back, and the scroller animates *backwards*: 0 → 847 → 116 of 2892. Boot therefore parks at 0 forever. `styles.css:153` vs `app.js:1303`/`app.js:1305` | **CONFIRMED DEFECT** |
| T3 | `message-arrive` runs 0 → 1 opacity, 8 → 0 px, .993 → 1 scale with a 1.00008 overshoot, settled at 503 ms for a 420 ms declaration | **CLEAN** |
| T4 | No `.message` / `.system-card` node is remounted under the work tick — 0 replacements, 0 opacity dips over 6.5 s (see the caveat in §3.4, closed in §3.6) | **CLEAN** |
| T5 | Hover gate: buttons `opacity 0` + `visibility hidden` + not hit-testable at rest; `opacity 1` + `visibility visible` + hit-testable on hover; row and metadata stay on | **CLEAN** |

## 3.6 §3.4's caveat, closed — the app really was re-rendering

`filmA/35-transcript-close.mjs` re-runs the replay window with two independent
witnesses that a `renderApp()` occurred (`traces/transcript-render-proof.json`):

```
t=0ms     mutationBatches=0  records=0    tick="Working · 0m 00s Preparing …"
t=1000ms  mutationBatches=1  records=27   tick="Working · 0m 02s Thinking …"
t=3000ms  mutationBatches=2  records=54   tick="Working · 0m 04s Exploring …"
t=5000ms  mutationBatches=3  records=82   tick="Working · 0m 06s Searching …"
TOTAL over 7s: 4 mutation batches / 104 records
.message + .system-card nodes: before 15, after 15, SAME NODE OBJECTS SURVIVING: 15
```

A `MutationObserver` on the app root counted **4 real DOM patches / 104 records**
and the work-tick text advanced through four distinct steps, so the window
contained genuine renders. All fifteen message nodes are the *same JS objects*
afterwards. **T4 is a real green, not an idle page.**

## 3.7 **CONFIRMED DEFECT T6** — a work tick moves the transcript out from under a stationary cursor and drops the hover

Found while measuring the hover fade: the button opacity ramp reversed
mid-flight with the mouse untouched. `filmA/37-transcript-hoverhold.mjs` settles
it — one mouse move in, then **7.2 s with the mouse completely stationary**,
then one move out (`traces/transcript-hoverhold.json`).

At **+4974 ms**, with no input of any kind:

| t | `:hover` | btn opacity | message top | scrollTop | scrollHeight | `.working-card` height |
|---:|---|---:|---:|---:|---:|---:|
| 4900 | true | 1 | 523.0 | 2892 | 3493 | 256.3 |
| **4974** | **false** | 1 | **542.0** | 2873 | 3493 | 256.3 |
| 4999 | false | **0.8869** | 532.3 | 2879 | 3490 | 252.7 |
| 5023 | **true** | **0.6528** | 522.8 | 2885 | 3486 | 249.2 |
| 5066 | true | 0.9997 | 522.7 | 2878 | 3479 | 242.1 |

The work step changed, `.working-card` began animating its height
(256.3 → 236.8 px), the transcript's `scrollHeight` shrank 3493 → 3474, the
scroller was dragged 2892 → 2873, and the hovered message **jumped 19 px in a
single frame**. The pointer was momentarily outside it, `:hover` went
`true → false → true`, and the action buttons dipped to **opacity 0.65** before
recovering — a visible flicker under a motionless cursor.

The same thing happens at **+7100 ms** as the card grows back
(msgTop 536.7 → 541.9), and that time the hover is **not** recovered: opacity
runs all the way down 1 → 0.887 → 0.655 → 0.425 → 0.259 → 0.148 → 0.075 →
0.031 → 0.007 → 0, i.e. the buttons disappear entirely while the user is still
pointing at the message. (This second flip is ~95 ms *before* the scripted
mouse-out, and the `msgTop` drift that causes it starts at +7066, so it is not
my own input.)

Over the 7.2 s hold with a stationary mouse:
`msgTop 522.3 .. 542.0`, `scrollHeight 3474 .. 3493`, `workingCardH 236.8 .. 256.3`.

**File:line.** `styles.css:190` (`.working-card`, whose height is animated per
work step) inside the transcript, against a bottom-parked `.transcript`
(`styles.css:153`) that carries **no `overflow-anchor`** — `grep -n
overflow-anchor` over `styles.css`, `motion.css`, `transcript.css`,
`transcripts.css` and `activity-bar.css` returns nothing, so the scroller relies
on default anchoring and does not hold the reading position when content above
the fold resizes. `app.js:1305 restoreScroll` re-imposes the stale `scrollTop`
on top of that.

**Why this is not the same finding as T2:** T2 is the scroller being pulled
backwards *while it is animating*. T6 is content resizing *under a parked
scroller*. They share `restoreScroll` but they are separately reachable — T6
reproduced with the scroller provably stationary for 4.9 s first
(`scroll parked: 2892 2892 STABLE`).

## 3.8 Hover fade timing — **CLEAN**

From the same trace, anchored on the in-page frame `:hover` flips (never on a
Playwright clock):

**In** — `transition: opacity 150ms, transform 150ms, visibility 0s`
(`transcript.css:62-68`):

| t | `:hover` | opacity | visibility |
|---:|---|---:|---|
| −17 | false | 0 | hidden |
| **0** | true | 0 | **visible** (instant) |
| 66 | true | 0.3457 | visible |
| 116 | true | 0.8522 | visible |
| **183** | true | **1** | visible |

Opacity 0 → 1 in **183 ms** (150 ms declared + the two frames either side of the
sample grid); `transform` `translateY(−2px) → 0` over the same window;
`visibility` flips to `visible` **on the same frame as `:hover`**, so the button
is hit-testable from the first frame of the fade rather than after it.

**Out** — `transition: … visibility 0s linear 150ms` (`transcript.css:60`):

opacity 1 → 0 over the +7100 → +7266 window (**166 ms**), and `visibility`
stays `visible` throughout, flipping to `hidden` at **+7283**, one frame after
opacity reaches 0. The delayed-out / instant-in visibility switch is doing
exactly what `transcript.css:17-21` claims — no flicker, and no hit-testable
invisible button.

**Positive control:** the same probe read `visibility: hidden` and
`hitIsButton: false` before the hover and after the fade completed, and
`visibility: visible` with `hitIsButton: true` in between — it registers both
states in one trace, so neither reading is a stuck value. A second control:
`36-transcript-hoverloss.mjs` ran the identical probe twice, once with the work
simulation running and once paused, and both held `:hover true` and
`opacity 1` for the full 2.6 s window with `msgTop` constant at 523 — proving
the flicker in §3.7 is caused by the content shift and not by the probe.

## Area 3 verdicts (final)

| # | Finding | Class |
|---|---|---|
| **T1** | `handleSend()` (`app.js:1588-1603`) never scrolls; new turns land 2787 px below the fold, `inView:false` for 3 s, `elementFromPoint` at their centre `null`. The rAF present at `app.js:1569` is missing here | **CONFIRMED DEFECT** |
| **T2** | A render inside a smooth scroll makes `restoreScroll` (`app.js:1305`) write a stale mid-flight `scrollTop`; the scroller animates *backwards*, 0 → 847 → 116 of 2892. Boot parks at 0 permanently. `styles.css:153` | **CONFIRMED DEFECT** |
| **T6** | `.working-card` (`styles.css:190`) resizing inside the transcript shifts the hovered message 19 px under a stationary cursor; `:hover` drops, the action buttons flicker to opacity 0.65 and on the second event fade out entirely. No `overflow-anchor` anywhere in the sheets | **CONFIRMED DEFECT** |
| T3 | `message-arrive`: opacity 0 → 1, 8 → 0 px, .993 → 1 scale, overshoot 1.00008, settled 503 ms for a 420 ms declaration | **CLEAN** |
| T4 | No message node remounted under the work tick — 0 replacements / 0 opacity dips over 6.5 s, with renders proved by 4 mutation batches and an advancing work clock (§3.6) | **CLEAN** |
| T5 | Hover gate: `opacity 0` + `visibility hidden` + not hit-testable at rest; the row and the metadata stay on | **CLEAN** |
| T7 | Hover fade: in 183 ms with visibility instant-in; out 166 ms with visibility held to the end of the fade | **CLEAN** |

**Still owed in Area 3:** the `.pm-msg-overflow` disclosure
(`transcript.css:170-196`, `pm-overflow-open` keyframes) and the
`.message-details` panel (`styles.css:166`, `details-open 300ms`) were never
opened — both are message-level animations in this area and both are unfilmed.
The `long-fade` / `toggle-message` expansion was not filmed. Reduced motion for
the transcript (`transcript.css:235-254`) was not run.

---

# AREA 4 — CONTEXT (`context.js`, `context.css`)

Never filmed by anyone before this pass.

## What was filmed, and with what trigger

| Surface | Trigger |
|---|---|
| compact menu | in-page `.context-ring.click()` (`data-action="context-menu"`) |
| "More limits" disclosure | in-page click on `[data-action="ctx-more-limits"]` |
| compact run | in-page click on `[data-action="ctx-compact-now"]` (`context.js:674`) |
| context drawer | `PM56_DEMO.openContext()` → `state.context.details=true; renderOverlays()` |
| growth-chart dot | a real `p.mouse.move` onto a `.ctx-pt`, from a settled un-hovered state |

| Script | Produces |
|---|---|
| `filmA/40-context-probe.mjs` | `traces/context-struct.json` |
| `filmA/41-context-meter.mjs` | `traces/context-meter-replay.json` |
| `filmA/42-context-morelimits.mjs` | `traces/context-morelimits.json` |
| `filmA/43-context-flash.mjs` | `traces/context-flash.json` |
| `filmA/44-context-drawer.mjs` | `traces/context-drawer-open.json`, `context-drawer-hold.json`, `context-growth-hover.json` |
| `filmA/45-context-compact.mjs` | `traces/context-compact-now.json` |
| `filmA/46-context-sheets.mjs` | `traces/context-cost.json`, `film/ctx-drawer-open.png`, `film/ctx-compact-run.png`, `film/ctx-meter-grow.png` |

## 4.1 The meter never replays under the work tick — **CLEAN**, and this one deserved the check

`context.js:31-36` names the hazard itself: *"`renderApp()` calls
`renderOverlays()`, and the 2 s work tick calls `renderApp()`. So an OPEN
compact menu is re-patched twice a second."* And `.ctx-meter i` carries
`animation: ctx-meter-grow 420ms var(--spring-soft-ease)` **unconditionally,
with no `data-k` on either the `.ctx-meter` or the `<i>`**
(`traces/context-struct.json`: `iK: null`, `anim: "ctx-meter-grow/0.42s/none"`).
That is the same shape as the two defects in Area 2 and Area 3, so it was
measured, not assumed.

Compact menu opened, sprout and first grow allowed to settle, then held for
**7 s with the work simulation running** (`traces/context-meter-replay.json`):

```
METER <i> REMOUNTS:                 0
FRAMES WITH A METER MID-GROW:       0
menu opacity range:                 1 .. 1        ghosts seen: 0
menu height range:                  308.4 .. 308.4
```

**Witness that this is not an idle page** (`42-context-morelimits.mjs`): a
`MutationObserver` on `#pmOverlayRoot` and on the app root, over the same 5 s
with the compact menu open —

```
t=2000ms  overlayRoot=5 records    app=32 records
t=4000ms  overlayRoot=10 records   app=65 records
TOTAL 5s: overlayRoot 15, app 92
```

The open menu **is** re-patched, 15 overlay records' worth, and the meters still
do not restart. The module's defence works.

**Positive control — the detector fires on a real change.** Toggling
"More limits" adds a third meter, and on the very next frame:

| t | meters | remounted | scaleX | painted width (px) |
|---:|---:|---:|---|---|
| 0 | 2 | 0 | `[1, 1]` | `[127.86, 75.92]` |
| 26 | **3** | **1** | `[1, 1, 0]` | `[127.86, 75.92, 0]` |
| 69 | 3 | 0 | `[1, 1, 0.2698]` | `[127.86, 75.92, 11.86]` |
| 200 | 3 | 0 | `[1, 1, 0.9233]` | `[127.86, 75.92, 40.58]` |
| **317** | 3 | 0 | `[1, 1, 1.0113]` (peak) | `[127.86, 75.92, 44.45]` |
| 450 | 3 | 0 | `[1, 1, 1]` | `[127.86, 75.92, 43.95]` |

The new meter grows `scaleX 0 → 1` with a 1.13 % overshoot over **424 ms**
(declared 420 ms `var(--spring-soft-ease)`) — and the two existing meters hold
their painted widths at **127.86 and 75.92 px on every single frame**. Visible in
`film/ctx-meter-grow.png`: the Session (64 %) and Weekly (38 %) fills are
pixel-identical across all 18 frames while the third row is removed.

## 4.2 No static-origin flash when the open menu re-renders — **CLEAN**

The DOM passes through the same one-frame unpositioned state found in Area 1:
on the frame "More limits" is clicked, the compact menu's box reads
`top 0 / bottom 343` before settling to `top 87 / bottom 430`
(`traces/context-morelimits.json`). Measured in painted pixels over the band
**strictly above** the menu's real top (`x 1144, y 0, 346 × 83`):

| run | frames over 2 % of that band changed |
|---|---|
| "More limits" toggle | **none** — 0.00 % on all 26 frames |
| **control**: a 346 × 83 box painted at `top:0` for one frame | **99.22 % for one frame** |

The arming path wins the race here too.

## 4.3 Chevron, drawer, spinner, status, dot — **CLEAN**

**"More limits" chevron** (`context.css:154`, `transform 160ms var(--ease)`):
`0° → 68° → 117° → 144° → 160° → 169° → 174° → 179° → 180°` between t = 0 and
t = 167. 160 ms declared, ~167 ms measured.

**Drawer entrance** (`styles.css:303`, `drawer-in var(--spring) both`, keyframes
`styles.css:353`), `traces/context-drawer-open.json`:

| t | opacity | transform |
|---:|---:|---|
| 0 | 0 | `matrix(0.985, …, 30, 0)` |
| 126 | 0.1113 | `…, 26.66, 0` |
| 272 | 0.9111 | `…, 2.667, 0` |
| 362 | 1 | `…, −0.0099, 0` |
| **446** | 1 | `…, −0.495, 0` (overshoot peak) |
| 636 | 1 | `matrix(1, 0, 0, 1, 0, 0)` |

A clean slide-in from the right with a 0.5 px overshoot, settled at 636 ms.
`film/ctx-drawer-open.png` #6–#8 show the cross-fade; no flash, no snap, and the
nine growth-chart points are present from the first frame.

**Compact run** (`traces/context-compact-now.json`, `film/ctx-compact-run.png`):

* `.ctx-minibtn.busy` and `.ctx-status.working` appear together at t = 0;
* `ctx-status-in` (`context.css:198`, 240 ms) ramps opacity `0 → 1` and
  `translateY −4px → 0`, clock starting ~t = 40 and reaching 0 px at **t = 283**
  — the full 240 ms;
* the spinner turns **40° per 100 ms** (27° @100, 67° @200, 107° @300,
  147° @400, 187° @500) = 360° in **900 ms**, matching
  `ctx-spin 900ms linear infinite` (`context.css:210`);
* at **t = 1010** `busy` clears and the tone flips `ctx-status working →
  ctx-status ok`, matching the 900 ms `setTimeout` at `context.js:683`.

**Growth-chart dot hover** (`context.css:305`, `transition: r 140ms var(--ease)`),
`traces/context-growth-hover.json`:

| t | `:hover` | `r` | painted dot width |
|---:|---|---:|---:|
| −35 | false | 2.6px | 4.97 |
| 0 | true | 2.6px | 4.97 |
| 32 | true | 4.148px | 7.94 |
| 99 | true | 4.764px | 9.11 |
| **168** | true | **4.8px** | **9.18** |

140 ms declared, 168 ms measured to the final value. The painted width really
changes (4.97 → 9.18 px), so this is not a computed-style-only claim.

**Positive control for all of the above:** each probe asserts its target before
triggering — `nMeters` non-zero, `btn: true, status: 0` before the compact run,
`hitInsidePt: true` before the dot hover — and aborts otherwise; and each trace
contains both the before state and the after state, so no reading is a stuck
value.

## 4.4 Blocked main-thread time — **CLEAN**

`traces/context-cost.json`, measured with `performance.now()` around the
synchronous call:

```
compactMenuOpen 20.0   compactMenuClose 11.3
drawerOpen      14.7   drawerClose      12.1
compactMenuOpen(2) 12.4   moreLimits 13.8   compactNow 14.1     (ms)
```

11–20 ms — every context surface is under one frame. Nothing here is the
Area 2 `renderApp()` problem, because these all go through `renderOverlays()`.

## 4.5 **SUSPECTED C11** — the compact menu's height snaps where every other menu springs

Measured height of the compact menu across a compact run
(`traces/context-compact-now.json`):

```
t = −15   308.4 px   (bottom 395.4)
t =   0   345.4 px   (bottom 432.4)   <- +37 px in ONE frame
t = 1010  388.6 px   (bottom 475.6)   <- +43 px in ONE frame
```

and on the "More limits" collapse the lower block jumps ~46 px between frames
#4 and #5 of `film/ctx-meter-grow.png`. There is no intermediate value on any
frame in any of these transitions.

Both of the mechanisms that would have animated it are scoped away from this
menu:

* `menus.css:70-76` puts `height 340ms cubic-bezier(.22,1.72,.36,1)` on
  `.overlay-menu.model-menu` only;
* `heightBounce()` (`menus.js:271-282`) only fires when the **inline**
  `el.style.height` changes, and `app.js:1249` writes an inline height only for
  `m.type === 'model'`, so `h` is always `''` for the compact menu and
  `changed` is always false.

So this is consistent with the code as written — the question is whether it is
consistent with the *design*. It is a `[data-overlay="root-menu"]` that resizes
by 37–46 px under the user's cursor twice during a compact run, in a concept
whose stated spec (menus.css §4, ACD-439) is that a resizing menu springs.

**The single measurement that would settle it:** frame-step the PMConcept7
reference recording — `ScreenRecording_07-29-2026 19-24-09_1 (1).mov` in the
concept root — across a compact run and see whether the compact menu's height
animates or snaps there. If it springs in the reference, C11 is a defect; if it
snaps, C11 is intended and the scoping is correct. I did not run that
measurement, so C11 stays SUSPECTED.

## Area 4 verdicts

| # | Finding | Class |
|---|---|---|
| C1 | `ctx-meter-grow` does not replay when the open compact menu is re-patched (0 remounts / 0 mid-grow frames over 7 s, with 15 overlay + 92 app mutation records proving the patches happened); control: a real content change remounts one meter and re-grows it | **CLEAN** |
| C2 | `ctx-meter-grow` runs scaleX 0 → 1 with a 1.13 % overshoot over 424 ms against 420 ms declared; painted width 0 → 44.27 → 43.95 px | **CLEAN** |
| C3 | No paint above the compact menu when it re-renders while open (control: 99.22 % for one frame) | **CLEAN** |
| C4 | Chevron 0 → 180° in ~167 ms against 160 ms declared | **CLEAN** |
| C5 | `drawer-in`: opacity 0 → 1, translateX 30 → 0, 0.5 px overshoot, settled 636 ms | **CLEAN** |
| C6 | The open drawer does not replay `drawer-in` — 0 remounts / 0 disturbances over 7 s. **Caveat:** the overlay-root witness recorded **0** DOM records in 5 s with the drawer open, so the drawer is not re-patched at all; that is *why* it does not replay, and the green is about the outcome rather than about surviving a patch. The detector is the same one proven live in C1 | **CLEAN (qualified)** |
| C7 | The drawer's live readings (64 %, 83.9K/131K, cache hit 78 %) do not change over 5 s with the work simulation running and consuming context — 0 DOM records. Content freshness, not motion; flagged for whoever owns the drawer's data path | observation |
| C8 | Compact run: `ctx-status-in` 240 ms in full, spinner 360°/900 ms exactly, busy clears at t = 1010 matching `context.js:683` | **CLEAN** |
| C9 | Growth dot `r` 2.6 → 4.8 px over 168 ms; painted width 4.97 → 9.18 px | **CLEAN** |
| C10 | The hovered dot's `stroke-width` snaps 1.2 → 1.6 px in one frame while `r` eases over 168 ms — `context.css:305` lists only `r` in the transition | observation |
| **C11** | The compact menu's height changes by 37 px, 43 px and ~46 px with **no intermediate frame**, where the concept's other resizing menu springs over 340 ms. Scoped out by `menus.css:70-76` and by `app.js:1249` never writing an inline height for it | **SUSPECTED** |

**Still owed in Area 4:** reduced motion for context (`context.css:340-356`) —
see §5.3. The drawer's **close** was only measured for blocked time, never
filmed. `.ctx-growth` has no entrance animation of its own to film (the nine
points are present and final on the drawer's first frame); the only growth-chart
motion in the sheets is the dot `r` transition, so "the growth chart animation"
in the brief resolves to that plus the drawer's own `drawer-in`. The
`ctx-compact-now` outcomes other than `completed` (`partial`, and the warn tone)
were never reached, so `ctx-status.warn` / `.info` were not filmed.

---

# SECTION 5 — the Area 2 gaps, closed

Run after Areas 1–4 at the coordinator's request. Same frozen snapshot.

| Script | Produces |
|---|---|
| `filmA/50-goals-reduced.mjs` | `traces/goal-{reduced,normal}-completion.json` |
| `filmA/51-goals-reduced-pixels.mjs`, `52-goals-blank-long.mjs` | `traces/goal-blank-pixels-{reduced,normal}[-long].json` |
| `filmA/53-goals-mutations.mjs` | `traces/goal-move-phase.json`, `goal-reopen-phase.json`, `goal-unblock.json` |
| `filmA/54-move-sheet-ctxreduced.mjs` | `film/goal-move-phase.png`, `traces/context-reduced-{on,off}.json` |
| `filmA/55-reduced-sweep.mjs` | `traces/reduced-entrance-sweep.json` |

## 5.1 **G1 survives reduced motion** — and turns into a hard blink

`goals.css:369` collapses `.goal-phase`'s entrance to `animation-duration:1ms`
under `prefers-reduced-motion: reduce`. That shortens G1; it does not remove it.

rAF trace, reduced motion (`traces/goal-reduced-completion.json`), every probe
guarded by an abort if `matchMedia('(prefers-reduced-motion: reduce)').matches`
is not `true`:

```
FRAMES WHERE THE COMPLETED ROW WAS NOT FULLY OPAQUE: 3
  {t:847, op:0, clip:"inset(0px 0px 100%)", anim:"goal-phase-arrive", hit:"OL.goal-phases is-full"}
  {t:865, op:0, clip:"inset(0px 0px 100%)", anim:"goal-phase-arrive", hit:"OL.goal-phases is-full"}
  {t:867, op:0, clip:"inset(0px 0px 100%)", anim:"goal-phase-arrive", hit:"OL.goal-phases is-full"}
```

**Confirmed in painted pixels**, not just computed style. Instrument: per
screencast frame, the fraction of the row's crop that differs from the crop's own
modal (background) colour — "ink". A present row reads ~10.7 %; a blanked row
reads 0. Over a 3.4 s window (`traces/goal-blank-pixels-*-long.json`):

| | frames at ink 0 | what follows |
|---|---|---|
| **normal** | t = 2585, 2626, 2656 (+ 2693 at 0.21 %) | 3.67 → 7.47 → 10.91 — the 440 ms clip-reveal ramping back |
| **reduced** | t = 2565, 2611, 2653 | straight back to 10.94 — **no ramp, a hard blink** |

So a motion-sensitive user gets a **~90 ms full blackout of the row** with no
fade at either edge, which is the abrupt change the setting exists to prevent.
G1 should not be closed by the reduced-motion rule.

Note on timing: in both traces the event fires at ~2.6 s here and at ~0.8 s in
§2.1. That is expected and confirms the mechanism — G1 fires on the **first
`renderApp()` after the 420 ms flag expiry**, and the work tick is every 2 s, so
the delay is anywhere in [420, ~2420] ms. An earlier 1.9 s normal-motion run
missed it entirely (0 blank frames), which is why the window was widened rather
than the finding weakened.

## 5.2 The three unfilmed phase mutations

Reached by drilling into a completed phase (`.goal-phase-row` →
`data-action="goal-phase"`), which is what surfaces `goal-reopen-phase` and
`goal-move-phase`. Availability was asserted first: before the drill-in
`{unblock:2, reopen:0, move:0}`, after it `{unblock:2, reopen:1, move:1}` — so
each probe is known to have had a live trigger.

### **CONFIRMED DEFECT G10 — a reordered phase is rebuilt, not moved**

`goal-move-phase` (down) on "Audit", per frame (`traces/goal-move-phase.json`):

| t | row order and state |
|---:|---|
| −16 | `Audit@600.7` (o=1) · `Research@805.1` (o=1) |
| **0** | `Research@596.7 **o=0**` · `Audit@657.7 o=1` — Audit has **already jumped 57 px**, in one frame, with no animation |
| 75 | `Research@598.2 o=0.646` |
| 197 | `Research@600.3 o=1` |

The row that was moved past (`Research`) **replays the full 440 ms
`goal-phase-arrive` from `opacity: 0`**, and the row that was actually dragged
(`Audit`) **teleports** — its top changes 600.7 → 657.7 between two consecutive
frames with `opacity` never leaving 1 and no transform.

Painted evidence, `film/goal-move-phase.png` (18 frames): #0–#3 show Audit
first; **#4 (+150 ms) has an empty slot at the top of the list** while Audit sits
in position 2; #5 (+198 ms) still empty; #6 (+267 ms) Research fades in dimmed;
#7 onward normal. A reorder therefore reads as *"the row above vanished and a new
one was built"*, which is the same misread G1 produces.

**This is a gap, not a limitation:** the concept ships a working FLIP.
`app.js:1125-1139` collects `[data-flip]` and `app.js:1128/1158` collects
`[data-flip-move]`, and both are used (the working card at `app.js:664` carries
`data-flip`; the agent lanes at `app.js:821` carry `data-flip-move`).
`grep -n 'flip' goals.js` returns **nothing** — the phase list opts into neither.

**File:line:** `goals.js` (`goal-move-phase` handler, `goals.js:905`) emits no
`data-flip-move`, against `app.js:1128`/`app.js:1158` where the mechanism lives,
and `goals.css:71-72` whose unconditional entrance fills the vacuum.

### `goal-reopen-phase` — **CONFIRMED DEFECT G11 (same family, milder)**

`traces/goal-reopen-phase.json`. Re-opening "Audit" makes "Implement" pending
and current:

* `Implement` appears at **`opacity: 0`** on the trigger frame and fades in over
  ~341 ms — it did not arrive, its status changed;
* `Audit`'s open detail shrinks **199.4 → 180.2 px in one frame**, and every row
  below it (`Prototype`, `Materialize`, `Implement`, `Verify`, `Handoff`) jumps
  **19.2 px up with no intermediate frame**.

So a status change is animated as an arrival, and a 19 px layout shift is not
animated at all — the two are exactly inverted.

### `goal-unblock` — **CONFIRMED DEFECT G12 (same family, largest jump)**

`traces/goal-unblock.json`. Clearing the blocker:

* `Implement` **and** `Verify` both appear at `opacity: 0` and fade in together
  over ~354 ms — two rows replaying an arrival for a status change;
* **all seven rows** move on the trigger frame, the list shifting by ~241 px in
  a single frame as the blocker card is removed above it, with no intermediate
  value on any frame.

**Caveat, stated:** part of that 241 px is the `.editor-body`
(`data-scroll-key="editor"`) scroll position being re-imposed by
`restoreScroll` (`app.js:1305`) after the content above shrank — the same
mechanism as T2/T6. The measurement that separates the two contributions is a
repeat of this trace with `scrollTop` sampled per frame alongside the row tops;
I recorded row tops only. The **opacity-0 replay on two rows** is independent of
that and is not in doubt.

## 5.3 Reduced motion across the whole entrance layer — **SUSPECTED, and not settleable by another probe**

`traces/reduced-entrance-sweep.json`, computed `animation-duration` read on each
surface's first frame, under both media states:

| surface | normal | reduced | |
|---|---:|---:|---|
| plan decision (`qs-rise`) | 0.42 s | **0.001 s** | collapsed |
| questionnaire (`qs-rise`) | 0.42 s | **0.001 s** | collapsed |
| goal phase (`goal-phase-arrive`) | 0.44 s | **0.001 s** | collapsed |
| **context drawer (`drawer-in`)** | 0.52 s | **0.52 s** | **not collapsed** |
| **message (`message-arrive`)** | 0.42 s | **0.42 s** | **not collapsed** |
| **system card (`message-arrive`)** | 0.42 s | **0.42 s** | **not collapsed** |
| activity panel (`panel-pin`) | 0.52 s | 0.52 s | not collapsed *(outside my areas)* |

Confirmed dynamically, not just by computed style: the context drawer's
reduced-motion trace runs the identical ramp to the normal one — opacity
0 → 0.112 → 0.55 → 0.761 → 0.911 → 1 with `translateX 30 → 0` and the same
overshoot (`traces/context-reduced-on.json` vs `-off.json`).

Within Area 4, `context.css:340-356` **does** work for everything it names:
`.ctx-meter i` reads `animation: none/0s` and the chevron reads
`transition-duration: 0s` and snaps to 180° in one frame. The drawer is simply
not named there, because `drawer-in` lives at `styles.css:303`.

**Why this is SUSPECTED and not CONFIRMED.** `motion.css:230-231` states a
deliberate policy — *"Finite entrances are untouched, so state changes stay
legible"* — under which the context drawer and `message-arrive` are **correct**
and `goals.css:369` / the questions module are the deviations. The measurement
above is unambiguous; which of the two policies is canon is not, and no further
probe of this build can decide it. **The settling step is an owner decision
recorded in the motion canon**, not another measurement. I am not rounding this
to CONFIRMED on my own authority, and I am not rounding it to CLEAN when two
sibling modules disagree with the global rule in the same app.

## Section 5 verdicts

| # | Finding | Class |
|---|---|---|
| **G1 (reduced)** | The G1 blackout survives `prefers-reduced-motion`, shortened to ~90 ms and stripped of its fade — measured at ink 0 % on 3 screencast frames, with `elementFromPoint` returning the list behind the row | **CONFIRMED DEFECT** |
| **G10** | `goal-move-phase`: the dragged row teleports 57 px in one frame; the row it passes replays a 440 ms entrance from `opacity:0`, leaving a visibly empty slot for ~120 ms (`film/goal-move-phase.png` #4–#5). The concept's own `data-flip-move` (`app.js:1128`,`1158`) is not used by `goals.js` | **CONFIRMED DEFECT** |
| **G11** | `goal-reopen-phase`: status change animated as an arrival (`opacity 0 → 1` over 341 ms) while a real 19.2 px layout shift on five rows is not animated at all | **CONFIRMED DEFECT** |
| **G12** | `goal-unblock`: two rows replay an arrival for a status change; the whole list moves ~241 px in one frame (scroll-restore contribution not separated — see the caveat) | **CONFIRMED DEFECT** |
| C4r | `context.css:353-355` works: `.ctx-meter i` `animation:none`, chevron `transition-duration:0s` under reduced motion | **CLEAN** |
| G3r | `goals.css:370-372` works: the wipe collapses to 1 ms, 0 frames mid-wipe, strike goes straight to its final 72.73 px | **CLEAN** |
| **C13 / T8** | `drawer-in` (520 ms) and `message-arrive` (420 ms) run at **full length** under `prefers-reduced-motion` while `qs-rise` and `goal-phase-arrive` collapse to 1 ms in the same build | **SUSPECTED** |

**Left as an inference, labelled:** the activity-panel copy of the phase list
(the narrower `left: 1119` rendering) mounts the same markup from the same
`goals.js` render path, so G1, G2, G10–G12 are **expected** to apply to it
identically. I did not film it. That is an inference, not a measurement.

---

# MASTER SUMMARY

## CONFIRMED DEFECTS (9)

| # | Area | What the eye sees | Where it lives |
|---|---|---|---|
| **G1** | Goals | A just-completed phase row **vanishes and re-arrives** ~0.4–2.4 s later. `opacity:0` + `clip-path:inset(0 0 100%)`, `elementFromPoint` at its centre returns `OL.goal-phases`, and `goal-completion-2s.png` #12 is blank. Survives reduced motion as a ~90 ms hard blink (§5.1) | `goals.js:377-380` (420 ms `data-wipe` lifetime) vs `goals.css:71-72` (unconditional `goal-phase-arrive` on `.goal-phase`) and `goals.css:134` (the guard that only lasts as long as the flag) |
| **G2** | Goals | Completing a phase freezes the app for 73–90 ms; the 233 ms wipe's clock does not start for ~104 ms and 4–5 frames are dropped in front of it | `goals.js:879` calls a whole-app `renderApp()`, measured at 58–64 ms on its own (menus, which use `renderOverlays()`, cost 6–18 ms) |
| **G10** | Goals | Reordering a phase: the dragged row **teleports 57 px**, the row it passes **replays a 440 ms entrance from `opacity:0`**, leaving an empty slot for ~120 ms (`goal-move-phase.png` #4–#5) | `goals.js` uses neither `data-flip` nor `data-flip-move`; the mechanism exists at `app.js:1125-1139` / `app.js:1158` and is used elsewhere (`app.js:664`, `app.js:821`) |
| **G11** | Goals | `goal-reopen-phase`: a status change is animated as an arrival (341 ms fade-in) while a real 19.2 px shift on five rows is not animated at all | `goals.css:71-72` + the reopen handler at `goals.js:896` |
| **G12** | Goals | `goal-unblock`: two rows replay an arrival for a status change; the list moves ~241 px in one frame | handler `goals.js:881`; `goals.css:71-72`; scroll-restore contribution not separated (`app.js:1305`) |
| **T1** | Transcript | You send a message and **the transcript never scrolls to it** — the new turn lands 2787 px below the fold, `inView:false` for 3 s, `elementFromPoint` at its centre `null` | `handleSend()` `app.js:1588-1603` has no scroll-to-bottom; `appendMessage()` `app.js:1569` does |
| **T2** | Transcript | A render landing inside a smooth scroll makes the scroller **animate backwards**: 0 → 847 → 116 of 2892. The transcript therefore boots parked at the top, permanently | `styles.css:153` (`scroll-behavior:smooth`) vs `app.js:1303` `captureScroll` / `app.js:1305` `restoreScroll`; the cancelled scroll is `app.js:1566` / `app.js:1938` |
| **T6** | Transcript | A work tick resizes `.working-card` inside the transcript, the hovered message **jumps 19 px under a stationary cursor**, `:hover` drops and the action buttons flicker to `opacity 0.65` — and on the second event fade out entirely | `styles.css:190` (`.working-card`) inside a bottom-parked `.transcript` (`styles.css:153`) with **no `overflow-anchor`** anywhere in the sheets, plus `app.js:1305` |

*(G1 counted once; its reduced-motion behaviour is the same defect, recorded in §5.1.)*

## SUSPECTED (2) — neither rounded up nor down

| # | Area | Finding | The single thing that would settle it |
|---|---|---|---|
| **C11** | Context | The compact menu's height changes by **37 px, 43 px and ~46 px with no intermediate frame**, where the concept's other resizing menu springs over 340 ms. Scoped out by `menus.css:70-76` (`height 340ms` on `.model-menu` only) and by `app.js:1249` writing an inline height only for `m.type==='model'`, which is what `heightBounce()` keys off | Frame-step the PMConcept7 reference recording — `ScreenRecording_07-29-2026 19-24-09_1 (1).mov` in the concept root — across a compact run. If the compact menu springs there, C11 is a defect; if it snaps, the scoping is correct |
| **C13 / T8** | Context + Transcript | `drawer-in` (520 ms) and `message-arrive` (420 ms) run at **full length** under `prefers-reduced-motion`, while `qs-rise` and `goal-phase-arrive` collapse to 1 ms in the same build. `motion.css:230-231` states a policy under which the *uncollapsed* ones are correct; two modules contradict it | **Not settleable by a probe.** It needs an owner decision on which policy is canon, recorded in the motion canon. Every measurement that could be taken has been taken (`traces/reduced-entrance-sweep.json`) |

## CLEAN (with the control that proves each instrument was live)

| # | Finding | Control that made the same instrument read red |
|---|---|---|
| M1 | Close opacity held at 1.000 to 76 % of the collapse; first fade sample at 83 %; declared crossover 79.5 % | the same probe read `null` for a non-existent ghost on the reduced-motion run, and 1 → 0 on the normal run |
| M2 | No flash between the live menu and its ghost (monotone presence decay) | one injected `visibility:hidden` frame → detector flagged 2 frames at 0.846 between 1.448 neighbours |
| M3 | Ghost carries no `id`/`data-*`/`role`/`aria-label`/`title`/`tabindex`; `pointer-events:none`; hit-test passes through; content complete | pre-trigger assertion `[data-submenu="deep-plan"] = 1`; an earlier version fired Escape on a closed menu and reported a false zero — caught and fixed |
| M4 | No paint at the document static origin on root-menu or submenu open | a 233 × 122 box at `(0,0)` for one frame → 25.42 % of the corner changed for 3 frames |
| M5 | Height spring: bottom pinned at 809 on all frames; 47.65 px undershoot matches the declared bezier to 0.05 px | the probe reported `rows 14 → 2` and `height 560 → 190` in the same trace; a dead selector emits `{gone:1}` |
| M6 | Sprout: opacity 163 ms, transform 300 ms peaking at 1.0488, origin `100% 18%` | as M4 |
| M7 | Menu open/close blocks 6–18 ms across all six menus | direct `performance.now()` deltas, contrasted against the 58–64 ms `renderApp()` in G2 |
| M8 | Reduced motion suppresses the ghost entirely | the identical probe read `ghosts = 1` under `no-preference` |
| G3 | Wipe duration 235 ms measured vs 233 ms declared | 15 distinct intermediate widths sampled |
| G4 | Wipe direction left → right | an injected **mirrored** wipe over the same band read leftmost 38 → 22 → 16 → 9 → 4 |
| G5 | Wipe does not restart under a mid-wipe render | expando survived (`sameNode:true`), width unchanged at 61.8 px across the render |
| G6 | No reflow: 7 rows hold `top/height`, `scrollTop` constant at 418 | the same probe registered `Handoff`'s designed 4 px slide and, in §2.1, the completing row's opacity going to 0 |
| G7 | Settled strike width == title text width to 0.1 px on all completed rows | non-completed rows read `strikeW 0` in the same pass |
| G3r | Reduced motion collapses the wipe to 1 ms; 0 frames mid-wipe | the normal run through the same probe showed 7 mid-wipe frames |
| T3 | `message-arrive` 0 → 1 opacity, 8 → 0 px, overshoot 1.00008, settled 503 ms | the same probe read `opacity 1 / transform none` on the 13 pre-existing messages in the same trace |
| T4 | No message node remounted under the work tick over 6.5 s | the identical expando detector reported `newThisFrame: 2` when real messages were appended; renders proved by 4 mutation batches / 104 records and an advancing work clock |
| T5 | Hover gate: `opacity 0` + `visibility hidden` + not hit-testable at rest | the first attempt reported a *false* clean (`:hover false`, `hitIsButton:false`) because the point was over the goal panel — caught by the `hoverPointIsInsideThisMessage` assertion |
| T7 | Hover fade in 183 ms with visibility instant-in; out 166 ms with visibility held to the end | both states captured in one trace |
| C1 | `ctx-meter-grow` does not replay when the open compact menu is re-patched | 15 overlay + 92 app mutation records prove the patches happened; a real content change remounts one meter and re-grows it |
| C2 | `ctx-meter-grow` scaleX 0 → 1, 1.13 % overshoot, 424 ms vs 420 ms declared | as C1 |
| C3 | No paint above the compact menu when it re-renders while open | a 346 × 83 box at `top:0` for one frame → 99.22 % |
| C4 | Chevron 0 → 180° in ~167 ms vs 160 ms declared | reduced-motion run reads `transition-duration: 0s` and snaps |
| C5 | `drawer-in`: opacity 0 → 1, translateX 30 → 0, 0.5 px overshoot, settled 636 ms | the drawer is absent on the frame before |
| C6 | The open drawer does not replay `drawer-in` — **qualified**: the witness recorded 0 overlay DOM records in 5 s, so it is not re-patched at all | detector proven live by C1 |
| C8 | Compact run: `ctx-status-in` 240 ms in full; spinner 360°/900 ms exactly; busy clears at t = 1010 matching `context.js:683` | pre-trigger assertion `{btn:true, status:0}` |
| C9 | Growth dot `r` 2.6 → 4.8 px over 168 ms; painted width 4.97 → 9.18 px | `hitInsidePt:true` asserted before hovering; `:hover false / r 2.6px` on the frames before |
| C12 | Every context surface blocks 11–20 ms | contrasted against G2's 58–64 ms |

## Observations (not classed as defects)

* **G8** — the 520 ms completion wash is truncated at 420 ms, but only **2.9 %** of its colour travel remains (ΔL 0.0045 of 0.156).
* **G9** — `abandoned` phases carry a `.goal-strike` permanently at `scaleX(0)`; an abandoned phase is never struck (`goals.css:118` scopes the strike to `.completed`).
* **C7** — the context drawer's live readings (64 %, 83.9K/131K, cache hit 78 %) do not change over 5 s with the work simulation consuming context — 0 DOM records. Content freshness, not motion.
* **C10** — the hovered growth dot's `stroke-width` snaps 1.2 → 1.6 px in one frame while `r` eases over 168 ms (`context.css:305` lists only `r`).
* **Menus** — the ghost keeps its classes by design, so `.overlay-menu` legitimately matches **2** elements mid-close; only the data hooks are stripped.

## STILL OWED

**Menus** — `worktree`, `wand` and `persona` measured for blocked time only; their
sprout geometry and close were not filmed. The upward-opening
(`data-pm56-sprout="t"`) branch was never reached: every menu in a 1440 × 900
viewport opened upward from a bottom trigger, so `--pm56-ty:-10px` is unexercised.

**Goals** — the activity-panel copy of the phase list is an **inference**, not a
measurement (same markup, same render path). The `goal-unblock` 241 px jump has
its scroll-restore contribution unseparated; the settling run is the same trace
with `scrollTop` sampled per frame.

**Transcript** — `.pm-msg-overflow` (`transcript.css:170-196`, `pm-overflow-open`),
`.message-details` (`styles.css:166`, `details-open 300ms`) and the
`long-fade` / `toggle-message` expansion were never opened. Reduced motion for
`transcript.css:235-254` was not run beyond the entrance sweep in §5.3.

**Context** — the drawer's **close** was measured for blocked time only, never
filmed. `ctx-compact-now` outcomes other than `completed` (`partial`, and the
warn tone) were never reached, so `.ctx-status.warn` / `.info` are unfilmed.
`.ctx-growth` has no entrance animation of its own — the nine points are final on
the drawer's first frame — so "the growth chart animation" resolves to the dot
`r` transition plus the drawer's own `drawer-in`.

**Cross-cutting** — `panel-pin` (activity panel) shows the same uncollapsed
reduced-motion shape as C13/T8 but sits outside these four areas.
