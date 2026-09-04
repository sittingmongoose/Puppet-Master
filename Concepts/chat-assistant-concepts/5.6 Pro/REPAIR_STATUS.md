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

`python3 build.py --check` is the gate. It prints the current digest; this file
deliberately does not repeat it, because a hand-copied hash is exactly what went
stale here — an earlier revision named a build that no longer existed while the
gate reported a different one. `DELIVERY_MANIFEST.json` carries the live digest
and is regenerated from disk by `reports/build-delivery-manifest.py`.

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

## Additive Correction v4 status — 2026-09-03

### Closed in this concept

| Family | State |
|---|---|
| QMAX — six ceilings, shared counter, charge-once, typed exhaustion | closed, driven by `tests/correction-v4-verify.mjs` |
| PPROG — derived projection, concurrency, out-of-order, stale, restart | closed |
| PFAIL — four labels, secondary condition, allowed actions | closed |
| PDET — Regular/Deep truth, versioned embeds, PDF fallback, unavailable | closed |
| PGOAL — atomic Goal + PlanRun + binding, idempotent, lifecycle coupling | closed |
| PSCHED — frozen topology, no pre-dispatch runtime, conjunction eligibility | closed |
| SMSG — six card states, exact snapshots, no silent fallback | closed |
| MODAL — zero durable effects before Start, held request restored on cancel | closed |
| PART / WONV — outcomes, waivers, partial/single Review, abstention, ties | closed |
| BSTALE — dispatch revalidation, four stale reasons, list isolation, epochs | closed |
| FOLDER — one command, bounded manifest, file-only alias refuses a folder | closed |
| TDG — graph validation, atomic replacement, currentness gates | closed |
| CONCEPT — retired values removed, test renamed, both outputs byte-checked | closed |

### Where each CONCEPT requirement is demonstrated

The `CONCEPT-*` family is owned by this folder rather than by a `Plans/` document, so
its evidence is a fixture and an assertion rather than a paragraph. Each row names the
source that carries the behaviour and the suite that drives it.

| Requirement | Where it lives | Driven by |
|---|---|---|
| `CONCEPT-001` Modify the existing source, do not replace the concept | the nine existing feature modules, extended in place; no new concept folder | `build.py --check` |
| `CONCEPT-002` Latest correction supersedes conflicting v2 and Chat updates | `Chat updates.md` §21 corrected **in place** and §31 added | `correction-v4-verify.mjs` §12 |
| `CONCEPT-003` Six bases and Grill totals; no 15/+10/25 left | `plans.js` `QBASE`/`QGRILL`, `collaboration.js` definitions | `correction-v4-verify.mjs` §1, §12 |
| `CONCEPT-004` Nested, concurrent, out-of-order, blocked, skipped, mixed, stale, restart | `plans.js` `progress()`, `todos.js` `CACHE_ITEMS` | `correction-v4-verify.mjs` §2 |
| `CONCEPT-005` Failure and recovery while the button stays Building… | `plans.js` `attention()` + `waitCopy()`, `ap-cache` fixture | `correction-v4-verify.mjs` §3 |
| `CONCEPT-006` Regular versus Deep Details | `plans.js` `dlgInfo` backend section | `correction-v4-verify.mjs` §4 |
| `CONCEPT-007` Ten renderer kinds, unavailable and PDF fallback | `plans.js` `EMBED_V1` + `richEmbed()` | `correction-v4-verify.mjs` §4 |
| `CONCEPT-008` Build as Goal, binding, hover controls, cancel, completion | `plans.js` `pd-build-goal`, `goals.js` bound Goals | `correction-v4-verify.mjs` §5 |
| `CONCEPT-009` Agent/Goal/Crew topology and immediate-build invalidation | `scheduling.js` `topology_snapshot`, `plans.js` `boundCancel` | `correction-v4-verify.mjs` §5, §8 |
| `CONCEPT-010` Modal open/cancel/start/failure/currentness | `collaboration.js` effect ledger + `collab-modal-cancel` | `correction-v4-verify.mjs` §6 |
| `CONCEPT-011` Participant failure, waiver, partial, tie, abstention, coordinator | the five correction seed runs in `collaboration.js` | `correction-v4-verify.mjs` §7 |
| `CONCEPT-012` Six scheduled-message states and exact snapshots | `scheduling.js` seeded messages + `renderMessageCard` | `correction-v4-verify.mjs` §8 |
| `CONCEPT-013` Stale component currentness and per-item recapture | `browser-capture.js` `revalidateContext`/`revalidateList` | `correction-v4-verify.mjs` §9 |
| `CONCEPT-014` Folder through the shared tray and a bounded manifest | `attachments.js` `attachmentAdd` + folder manifest fields | `correction-v4-verify.mjs` §10 |
| `CONCEPT-015` Rename the ambiguous test label | `tests/todo-runtime-verify.mjs` | the file name and its header |
| `CONCEPT-016` Update the companion files | this file, `Chat updates.md`, `README.md`, `RELEASE_NOTES.md`, `DELIVERY_MANIFEST.json`, `assets/component-contract.json` | `DELIVERY_MANIFEST.json` hashes |
| `CONCEPT-017` Regenerate both outputs and byte-check | `build.py` | `build.py --check`, run twice |
| `CONCEPT-018` Preserve every non-conflicting v2 decision | no broad CSS replacement; every prior suite still green | the other ten suites, 429 assertions |
| `CONCEPT-019` Fixture-backed behaviour is identified as such | the scope header in `correction-v4-verify.mjs` and its `scope_note` | `reports/REDESIGN_READINESS.md` §8 |
| `CONCEPT-020` No accessibility work required | no accessibility assertion was added or removed | — |

`CDRY-017` (one replacement audit Goal under 4,000 characters) and `CDRY-020` (additive
to the implemented branch, never a re-application of the recovered baseline) are
properties of the correction packet and this application of it, not of any file:
`REPLACEMENT_AUDIT_GOAL.txt` ships in the packet at 3,867 characters, and the changed
file set is the evidence for `CDRY-020`.

### Not closed here, and why

| Item | Blocker |
|---|---|
| Real scheduler dispatch (PSCHED-004, SMSG-006) | Needs a server-owned timer and a real message pipeline. The concept models the states; it does not run them. |
| Provider degradation at dispatch (PSCHED-007, SMSG-011) | Needs a live provider adapter. The concept records requested-versus-effective and refuses substitution; it makes no provider call. |
| Modal zero-effect proof against real subsystems (MODAL-002) | Proved here against this module's own instrumented ledger. Native proof needs the real provider and Usage subsystems. |
| Adapter conformance (PART-024, GREPLAY-012) | Needs a live direct/SDK/CLI/server adapter. Contract text only. |
| Production wiring (CDRY-012) | Needs a source-hashed native dispatcher; every `cmd.*` here is still `handler_unavailable`. |
| Storage migrations (CDRY-014..015) | Specified in `Plans/storage-plan.md`. No migration executes in a `file://` page. |

Nothing above is recorded as a concept pass. `reports/REDESIGN_READINESS.md`
keeps canonical, concept and native readiness in three separate columns.

## Independent replacement audit — 2026-09-04

The previous section recorded the correction as applied. This section records
what an **independent** audit of that claim found, and what it repaired.

`tests/independent-audit-v5.mjs` decides one verdict for each of the 481
requirements — 236 from the implemented v2 packet and 245 from
`PM_Assistant_v2_Additive_Correction_v4` — by driving the built page in a real
browser and reading state or rendered DOM. It reads no prior report: not this
file, not `DELIVERY_MANIFEST.json`, not the packet's own test matrix, and no
screenshot. `reports/AUDIT_MATRIX.md` is the per-requirement result and
`reports/independent-audit-v5.json` the machine record.

### What the audit found that the previous pass had not

Each of these was found by driving the surface, not by reading a document.
Each is repaired in source, and each has a probe that fails without the repair.

| # | Defect | How it showed up |
|---|---|---|
| 1 | `questionBudget()` never normalised its `strategy` argument, so the exported entry point resolved `Deep · Thorough` — the exact string the Plan record stores — to `standard` **6** instead of **10**, and echoed retired labels like `light` back as active strategy values. The module's own callers normalised; the public one did not. | QMAX-001/002 |
| 2 | Nothing could ever disable Build for a build blocker. `eligible()` had no blocker predicate at all, while the card's own toast asserted "Build stays enabled unless an unresolved item is an explicit build blocker" — copy describing a behaviour no code path could produce. | QMAX-015 |
| 3 | A To-Do blocked through the ordinary transition path recorded no `blocked_reason_ref`, so the projection's blocked cell had `reason:null`. Only the hand-seeded fixture item carried one. | PPROG-007 |
| 4 | Plan Details showed identity, hash and backend but **no** source messages, attachments, research, run history or currentness. | PDET-001 |
| 5 | `artifact_version` was the display string `'v3'` while the typed contract says integer. A native port reusing the shape would have inherited a string where a comparable version was promised. | PDET-008 |
| 6 | Plan completion never completed the bound Goal. Pause, Resume and Cancel drove the Plan from the Goal, but a Plan that reached Completed left its Goal `active` forever — a Goal whose whole objective was that Plan. | PGOAL-009 |
| 7 | `resumeRun()` was a second copy of the run tick that simply stopped when no work was left, so a Plan resumed after a Pause could never reach Completed. One body now, one completion predicate. | PGOAL-009, PFAIL-004 |
| 8 | `goals.js restoreFixture()` did not clear plan-bound Goals, and `plans.js restore()` left live run timers ticking and the question counters populated. A restore that leaves durable records behind is a restore that lies — and it made later measurements unreliable. | PGOAL-003 |
| 9 | An immediate Build did not invalidate the pending schedule for that Plan version, so a timer could still deliver a second dispatch for work already running. Cancel did this; Build did not. | PSCHED-005, PFAIL-010 |
| 10 | An ordinary Revise invalidated only the card's own binding. Every durable build schedule stayed `active` and still bound to the replaced version. | PSCHED-006, SCHED-004 |
| 11 | One build schedule carried **no** `topology_snapshot` at all, so a dispatcher reading it would have had to infer the topology — the inference the correction forbids. No crew-topology or held-admission schedule existed to demonstrate the frozen CollaborationDefinition or a refused admission, and no schedule carried the two distinct idempotency keys or an evaluated eligibility conjunction. | PSCHED-001/002/008/013/014 |
| 12 | `voteTally()` excluded `additiveRoleKind === 'grill'`, but every producer writes `'grill_me'`. The branch was dead: a Grill Me slot carrying a vote would have been counted without ever being configured as a voting role. | PART-013 |
| 13 | `run.coordinator` is a descriptor `{kind,label}`, not a participant id, so `participant(run, run.coordinator)` was always `undefined` and `coordinator_failed` could never become true. A failed coordinator read as a healthy run. | PART-017 |
| 14 | `mkParticipant` defaulted every slot to `required:true` unless a caller said otherwise, so a seeded Wonderer became a **required** slot — an additive specialist blocking clean completion. | WONV-006, BRAIN-016 |
| 15 | The tie-vote run had `synthesis:null`. A message said the tie would be resolved on constraints and evidence; no structured record said it was. | PART-014 |
| 16 | Participants carried no session identity, so an independent-pass claim had nothing behind it. | PART-022, REVIEW-004/005 |
| 17 | Review runs produced no output artifact — only a transcript. | REVIEW-010 |
| 18 | Every seeded run shared one idempotency key, because the key was built from `o.id`, which is undefined for any run taking a generated id. | MODAL-017 |
| 19 | A Start could not fail. There was no preflight, so "failed Start retains values and creates no partial run" had no path to exercise. | MODAL-005 |
| 20 | The natural-language BrainStorm hold was **dead code**: `collab-modal-cancel` knew how to restore a held request, but nothing ever produced one, so a prose BrainStorm request would simply have been sent. | MODAL-012 |
| 21 | ComposerBuffer had nowhere to keep a pre-send workflow configuration, so "restores config with text" could not be true. | MODAL-011 |
| 22 | The Review target-change model had a stale hash but no explicit choice between refreshing and reviewing the frozen target. | MODAL-010 |
| 23 | The scheduled-message projection declared `pm.schedule.message_projection.v1` while publishing `can_edit`/`can_cancel`; a reader following that contract would have found neither field. | SMSG-003 |
| 24 | A held schedule's attachment carried no frozen hash or version, and no snapshot modelled an unavailable retained version, so "hold rather than substitute current bytes" was not demonstrable. Failed and held dispatches kept no attempt history. | SMSG-007/008/013 |
| 25 | `applyTransition` accepted **any** `to_status`, including `verifying` — the one status the correction retires by name. `replaceThreadList` accepted it too, which is exactly how a provider whole-list snapshot arrives. | TDG-014, TODO-007, PROVIDER-007 |
| 26 | A Full or Region screenshot tripped the composer commit reconciler, which infers "a send happened" from the message count growing while the composer field is empty — and a buffer holding **attachments with no typed text** looks empty to that test. Attaching a file and then taking a screenshot silently discarded the attachment. | BROWSER-002, BSTALE-008 |
| 27 | The Chat Room definition declared only counts and limits: no moderator, turn protocol, mentions/replies, tools or output. | ROOM-002 |
| 28 | Wonderer leads had two shapes in two fixtures — `connection`/`status` in one, `seed`/`tether`/`state` in the other — so a reader could not tell a tethered hypothesis from a researched lead without knowing which fixture it came from. | WONDER-002/003, WONV-005 |
| 29 | The run status word was `cancelled` while every other terminal vocabulary in the concept — participant outcomes, scheduled-message states, Plan status, Goal status — says `canceled`. Two spellings of one state inside one module. | COLLAB-008 |
| 30 | `.pd-sec-honest` carried a 3px left accent bar, the pattern the GUI spec asks new UI to avoid. | GUI-008 |
| 31 | `Chat updates.md` recorded the retired values but never stated the precedence chain the correction requires. | CONCEPT-002, AUTH-001 |
| 32 | This file hard-coded a build digest that the gate no longer produced. A companion that repeats a digest goes stale the next time anything is rebuilt, so the digest lives in the gate output and in the regenerated manifest instead. | CONCEPT-016 |

| 33 | Four typed projections declared their schema id only in rendered copy, not in the object: `progress()`, `attention()`, `validateGraph()` and the list-replacement disposition. A consumer holding one had no way to identify it, which is the whole point of a schema id. | PPROG-001, TDG-001 |
| 34 | No inventory existed of the identifiers this surface exposes, so a later census against the real branch had nothing exact to diff against. `tests/census-ids.mjs` now writes `reports/ID_CENSUS.json`: 294 registered actions, 65 rendered, the 7 `cmd.*` the UI names as unregistered, 12 schema ids, 9 Activity domains and every published vocabulary — stated as a concept inventory, not as the branch census CDRY-001 asks for. | CDRY-001 |

### Result

34 defects found and repaired. 481 requirements decided, 0 failed,
0 not implemented. 35 are recorded
**blocked** with the exact blocker — a native handler, a storage engine, a
scheduler, a provider adapter, or a census of the implementation branch — and
none of them is recorded as a pass. 2 v2 requirements (BRAIN-002, BRAIN-003) are
recorded **superseded** by QMAX-002/QMAX-003, each with proof that the
replacement value is the one the surface holds.

All 541 assertions in the eleven pre-existing suites still pass after every
repair above.

**This is not a certification.** The concept column is closed; the canonical
`Plans/**` column is owned by `pm-plans-verify.py run-gates` and is not
addressed here, and the native column is closed for nothing at all.
