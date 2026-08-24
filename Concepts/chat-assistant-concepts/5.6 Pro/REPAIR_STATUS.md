# Motion repair status

## What was wrong

Verified in a headless browser against the shipped standalone, not inferred:

| # | Defect | Evidence |
|---|---|---|
| 1 | `renderApp()` assigned `#pmRoot.innerHTML` wholesale, so the entire tree was destroyed and rebuilt on the 1050ms work tick. | 6 rebuilds in 6s; `.working-card` identity changed 6x; `morph-stage.currentTime` cycled 0 -> ~1000 -> 0 |
| 2 | Consequently **all 105 transition-declaring elements could never transition**, and every entrance animation replayed forever. | 105 elements with non-zero `transition-duration` among 704 |
| 3 | `renderOverlays()` did the same to `#pmOverlayRoot`, so an open menu re-popped about once a second while work ran. | overlay node replaced 2x in 2.8s running vs 0 stopped |
| 4 | `@keyframes fade-up` and `capability-pop` were referenced but never defined. | 4 live elements, 0 `CSSAnimation` produced |
| 5 | `.message{animation:none}` paired with a `.message.animate` rule, but nothing ever added `animate`. | message arrival permanently off |
| 6 | **Four of the eight** working takes had zero live animation. | takes 2, 3, 4, 6 |
| 7 | Step Stack printed three step titles on top of each other. | 6 sibling collisions; 159 overlapping text pairs measured in filmstrips |
| 8 | `index.html` executed `app.js` twice — `build.py` inlined it *and* a hand-added `<script src>` loaded it again. | 12 rebuilds/6s vs the standalone's 6 — two work timers |
| 9 | `.chat-stage` declared grid rows but no columns, so the implicit track resolved to `max-content` and the pane overflowed. | 205px overflow at 1440, 357px at 1024; controls unreachable |
| 10 | A hardening rule re-declared `body{font-family:...}` after the themes, so every theme rendered Inter. | retro declared SFMono, rendered Inter |
| 11 | `color:#fff` on `var(--accent)` measured 1.42:1 in retro-dark. | also 2.15 friendly-dark, 2.69 glass-dark |
| 12 | `prefers-reduced-motion` flattened every duration to 0.001ms, erasing state changes along with decoration. | declared twice, identically |
| 13 | Two rules fought over the decision-host collapse; `height:auto!important` killed the model picker's height transition. | `modelMenuHeight()` was dead code |
| 14 | Search inputs forced the caret to the end after every keystroke; the Threads chip could reach `floating` and never leave. | measured `pinned -> closed -> floating -> floating -> floating` |

## What was done

- `pmPatch()` replaces the innerHTML blowaway with a keyed DOM reconciler, in
  both `renderApp()` and `renderOverlays()`. `data-k` decides what re-mounts, so
  an entrance animation fires exactly when the thing it represents changes.
- `motion.css` / `motion.js` hold one shared motion system, with timings
  measured frame by frame from the reference recording rather than invented.
- All eight original takes rebuilt so each has its own signature motion; the
  four with none now animate, and Step Stack is a real deck.
- Eight further takes added (indices 8-15), registered through `PM56_WORKING`.
- `motion-guard.css`, `motion-guard.js`, `build-motion-repair.py` and
  `index.source.html` deleted: none were in the build, and the last two would
  have baked the double-execution in permanently.
- `python3 build.py --check` now fails if either deliverable has drifted.

## Current state

Build `5a48b5f7db37c57e`. `python3 build.py --check` is the gate.

Final acceptance, 15/15:

| check | result |
|---|---|
| `build --check` passes; index.html == standalone | byte-identical |
| standalone has no external references | 0 |
| 24 working takes declared | 24 |
| `#pmRoot` wholesale replacements in 6s | **0** (was 6) |
| `.working-card` identity changes in 6s | 1 (mount only; was 6) |
| elements carrying an undefined animation-name | **0** (was 4) |
| takes with zero live motion | **0** (was 4) |
| takes with a distinct animation-name set | 16 / 16 |
| visible text overlaps in any take | 0 |
| content escaping a card (16 takes x 2 themes x 3 steps) | 0 |
| 93-state tour | populated DOM, no empty renders |
| reduced motion: perpetual loops | 0, state still advances |
| console errors/warnings | 0 |

Row cascade measured against the recording: icon in by +98ms, row 1 ghost +131
sharp +164, row 2 +213, row 3 +262 — ~49ms apart, matching the 45ms token.
Shimmer verified in pixels, not just in `getAnimations()`: the band crosses the
verb over ~550ms of the 1370ms cycle against the reference's ~500ms.

## Second pass, after independent frame-by-frame films

An independent agent filmed all 16 takes at ~52fps on a pinned copy of the
build and found four things the first pass missed. All four are fixed:

- **The row cascade was indexed from 1, not 0.** The 65ms base was becoming
  110ms, so the first row resolved at ~174ms instead of starting at the
  reference's ~65ms. Three emitters were affected (`.evidence-line`,
  `.rail8-row`, `.agent-lane`); the ones already indexing from 0 measured
  +54ms and were hitting the bar. Now: row 1 at 65ms, row 2 at 110ms, row 3
  at 155ms, 45ms apart, resolving at ~175ms.
- **The theme cross-fade made things worse than the hard cut it replaced.**
  `*:not(.pm-shimmer)` armed 859 transitions on a page already running ~800
  animations: a 141ms main-thread freeze and ~15fps. Only 16 large surfaces
  actually change background between themes, so only those are armed now:
  138 transitions, 59/64 rAF ticks against baseline.
- **`setWorkStep()` reported `running:false` while leaving the interval
  alive**, so the step kept advancing under any measurement taken from a
  "paused" state. This corrupted two of the agent's three passes and probably
  explains earlier irreproducible sweeps. It now clears the timer.
- **Agent Stage was still 99% static.** The fixtures never change, and the
  lane key had no step component, so the reconciler correctly never replaced
  them. Lanes now carry a per-step line, an advancing progress track, and a
  rotating baton among the agents that are not blocked: 90-94% still, in line
  with the other text-led takes (take 13 Blueprint sits at 95% by design).

The films also confirmed, on pixels: Step Stack's overlap fixed (0 clip-aware
pairs at all 14 steps), the hard-cut handoff fixed in 14 of 16 takes, the cold
open improved from 94.2% still to 58.6% with a real 264ms entrance, the height
FLIP firing once per real change and never on a counter-only tick, and **no
menu re-pop** — 148 samples, 0 identity changes across 3 real re-renders,
which settles a disagreement from the first pass.

## Third pass — weak takes upgraded, transcript family doubled

Every working take now stages its handoff; none is below 12 intermediate
frames (range 12-39, was 4 at the worst). The five weakest were rebuilt:
Tool Ribbon's track only moved past index 7.7, so the first eight steps of a
fourteen-step run had no motion at all; Agent Stage's lanes now reorder around
a rotating baton (13 -> 27); Blueprint draws itself (4 -> 20); Timeline Scrub
cascades instead of blanking (7 -> 25); Diff Tape prints 2-3 rows a step
(8 -> 22); Tool Collapse displaces its pile (10 -> 18).

The transcript family went 8 -> 16, with options 8-15 drawn from reading the
message components of 36 open-source AI chat clients. See
`reports/transcript-research/`. Tested as 12 feature surfaces x 16 takes x 7
conversation states, then 8 themes and reduced motion: 0 missing surfaces,
0 overlaps, 0 overflow, 0 invisible text.

Three of my own mistakes that only testing caught, all the same shape --
**a filled animation beats a declared value**:
- Focus Reader never dimmed, because its own entrance keyframe ended at
  `opacity:1` with `both` fill. It dims through `filter` now, which nothing at
  that level animates.
- Threaded Turns' branch never rendered: `~` only reaches *later* siblings and
  the work cards sit *before* the assistant turn.
- Print Sheet hid the assistant's actions, overriding the base `.always` rule
  that keeps them reachable without a pointer.

One metric caveat: the `intermediate` staging score is meaningless for
transcripts. `.transcript` has `scroll-behavior:smooth`, so sending scrolls the
column and that motion swamps the per-message entrance -- every take scores 5-7
regardless of what it does. The animation inventory is the evidence there.

Two measurement traps worth remembering, both of which produced false positives
during this pass:

- `getBoundingClientRect()` reports geometry regardless of `overflow:hidden`
  clipping, and reports stale composited values while an animation is in
  flight. It said take 11's tape was painting 42 rows over the card header; a
  screenshot showed it correctly clipped behind its mask fade. **Pixels decide.**
- Counting overlapping bounding boxes without checking ancestor `visibility`
  reports a deliberately stacked card deck as 21 colliding text pairs. Honouring
  visibility gives 0.

## Prior reports in `reports/`

Established during this pass, and worth knowing before trusting any of them:

- **Not trustworthy.** `EVIDENCE_INDEX.md` names 12 evidence files including
  three `.webm` videos; no `evidence/` directory exists and its own totals tables
  are empty. `DELIVERY_VALIDATION.md` ticks "self-contained" and "no local script
  dependency" while validating a different path on another machine — both were
  false for the build it describes.
- **Honest.** `FINAL_AUDIT.md` records a `FAIL` and marks the browser and motion
  gates `MISSING`. `reports/failure-markers/` is accurate.
- Every browser audit under `reports/` failed to execute and says so
  (`playwright-core` not found); their provenance is other machines.
