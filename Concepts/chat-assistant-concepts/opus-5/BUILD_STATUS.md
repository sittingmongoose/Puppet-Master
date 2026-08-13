# BUILD_STATUS — Opus 5 Assistant Chat concept

Written after the 2026-08-08 cumulative packet update. **Section 2 is the honest gap list.** Anything
not listed as done is listed as outstanding, with what remains and why.

Verification numbers in this file come from runs recorded in `interaction-test-report.json` and
`demo-trigger-report.json`, both generated from live runs rather than written by hand.

---

## 1. What is built and verified

### Foundations

- **Store v5** (`shared/store.js`). `pmx.opus5.state` version 5; `rehydrate()` rejects a version
  mismatch so the stale v4 snapshot is discarded with no migration code. New session slices:
  `recents`, `providerSetup`, `sync`, `ops`, `notify`, and `spell.{source,language}`. New per-thread
  view slices: `bsd`, `decisions`, `context`, `threadOps`, `attachments`, `crew`, `capacity`.
  `attachData()` lets `view()` seed authored fixture state exactly once per thread.
  **`set` now dedupes primitives only** — an object write always announces, because read-mutate-set is
  the common pattern here and reference equality was silently swallowing it (the composer stayed in a
  stale state until an unrelated change ticked it).
- **Icons** (`shared/icons.js`). 36 packet glyphs added, 80 total. Provider marks are neutral
  geometry, not vendor logos. Retrieval is exact-key; an unknown name warns, and the suite fails on
  any console warning, so a typo cannot ship quietly.
- **ObservableWork** (`shared/observable.js`). The only progress system. Ops live in module state and
  announce through `store.touchView('observable')`.
- **ConceptHub compliance.** `concept-hub.json` (hybrid: workspace plus stage, contact and runner
  entries), `shared/hubbridge.js` carrying both validator literals, `data-concept-model="Opus 5"` on
  all four pages, and the visible `Opus 5` label in the workspace chrome.
  `py Concepts/ConceptHub/validate.py Concepts/chat-assistant-concepts/opus-5` → **passed**.

### Domain services — 13 new modules, 4 extended

`route`, `access`, `bsd`, `approvals`, `contextadmit`, `threadops`, `opsawareness`, `attach`, `sync`,
`spell`, `notify`, `observable`, `hubbridge`; extensions to `surfaces` (Goal projection, capacity,
Crew, todo/agent/activity verbs), `questionnaire` (phases, receipts, validation, terminal index),
`threadhistory` (floors registry, attribute contract, row shells, real row actions),
`artifacts` (`forceReady`, per-window `frame`, two new catalog records), `motion` (thirteen helpers).

All 23 shared modules load clean in a node harness against the real corpus and in the browser.

### Shared chrome

- **Selectors.** Peer set is Persona, Route, Mode, Access, BSD, plus Worktree and Crew where they
  apply. Effort and Normal/Fast are submenus of the model row using the real `openSubmenu` stack, so
  the catalog stays open while they are chosen. Verified in a browser: three-deep popup stack, base
  still open, collapsed label reads `Sonnet 5 · Medium · Fast`.
- **Header tools.** Search, Prior chats, Context Lens, Context ring, Environment, Sync state, More
  options, then the selector host. `Compact now` runs a real operation and shows its receipt. `More
  details` opens `artifact-context` (the `context-detail` fall-through is gone). Eleven More-options
  items, each with a real target.
- **Composer.** Ten states on `data-pmx-cstate`, all reached in the suite. Platform spellcheck,
  autocorrect and autocapitalize are OFF; PM draws its own passive underline. The question state
  keeps the composer usable and the draft intact. Redirect replaces per-message Stop. Attachments go
  through the resolver — the fabricated `screenshots/attachment-N.png` path is deleted.
- **Shell.** Title bar with the notification inbox and a compact server chip; four rail items that
  have no concept surface render `aria-disabled` with the reason `Not part of this concept study.`,
  and the other three open real surfaces.
- **Director.** 16 families, 93 events, every one returning `{ok:true}` in a live run.

### Windows

All eight migrated to `PMXThreadHistory.resolve` with registered floors; the `pinState` shim is
**deleted** and no callsite remains. All eight provide `artifactHost` with their own placement and
switcher idiom. All four history states resolve in all eight. 64 pairings mount with zero console
errors and zero warnings.

Per-window defects fixed: w1 compact column and two dead rules; w2 duplicate scan and a contradictory
duplicate CSS rule; w3 stale header and gutter rail; w4 `secondary` growth at every width; w5 command
row handler disposal and pin-rail flow; w6 `ResizeObserver` driving the sheet reserve and the rail
detent in the wide track; w7 the unreachable active-thread branch (the specific key is now tested
before the generic prefix); w8 stale header, a real 12px header-capsule recovery target, and a
measured artifact clearance so the capsule never covers the composer.

### Fixture

`demo/demoData.json` remains byte-frozen at **349,661 bytes** with an unchanged checksum. The
generator was extended and regenerates **byte-identically** across runs. Measured counts: 18 threads,
1,053 messages, `todoMax: 8`, `agentRoutes: 6`, activity kinds `browser read search test verify web`,
question kinds `freeform / multi select / single select`, goal phases
`start pause resume replan blocked complete`, 1 conflict, 3 decisions, 2 BSD modes, 1 outbox entry,
4 thread-operation records, 1 verification message.

### Tests and evidence

`tests/assert.js`, `tests/suites.js`, `tests/runner.html`. 22 suites, **236 assertions, 236 passed, 0
failed, 0 console errors, 0 console warnings** at 1920×1000. Matrix sweep: **128 pairing/width runs,
512 assertions, 0 failed**. The runner refuses to run below 1900×900 and prints the required size,
rather than reporting popup-anchor failures that describe the window instead of the product.
14 captures in `evidence/`.

### Reports

All seven required outputs exist at the folder root: `impact-register.json` (21 plan owners audited,
every array key populated), `candidate-command-delta.json` (33 adjudicated rows with catalog line
evidence), `candidate-wiring-delta.json` (24 full chains with idempotency keys),
`candidate-dry-delta.json` (24 DRY roles mapped to modules and runtime owners), `plan-owner-delta.md`,
`demo-trigger-report.json`, `interaction-test-report.json`.

---

## 2. Outstanding — the honest gap list

### 2.1 Thread concepts keep their existing question and work surfaces (largest gap)

The plan assigns each of the eight thread concepts its **own** question system, compact work cluster,
BSD advice surface and artifact handoff card, and the packet makes it a hard failure if all concepts
reuse one solution. **That per-thread work is not done.** What exists today:

- The shared `PMXQuestionnaire` controller is repaired and complete (phases, validation, terminal
  index, receipts), and the eight threads render it through their existing per-concept
  `_renderQuestionBody`, which already differ in DOM and class names.
- The `distinctness` suite asserts the eight question roots and the eight work-cluster roots are
  distinct, and it passes — so no two concepts are literally the same DOM.
- What is missing is the **choreography and semantics** the matrix specifies per concept: the margin
  interview (t1), the composer capsule morph (t2), the spine stepper (t3), the unfolding digest (t4),
  the lane dialogue (t5), the monospace field form (t6), the card deck (t7), the prose footnote (t8),
  and the eight named compact-work forms with their condensation and reopen behaviour.
- `shared/reveal.js` still owns `question(spec)` and `afterRender(...)`, which the plan requires to be
  deleted so each thread composes primitives in its own order. Deleting them before the eight local
  choreographies exist would leave every thread with no entry or exit behaviour at all, so they stay
  until the replacements are written.

### 2.2 BSD advice surfaces and artifact handoff cards per thread

`PMXBsd` produces the ten visual states and read-only advice, and the selector renders the state.
The eight **per-thread advice surfaces** (margin annotation, chip sheet, spine side node, digest line,
lane note, exec row, status-card link, gutter dot) and the eight **handoff cards** are not built.

### 2.3 Motion helpers are defined but not composed per concept

`shared/motion.js` exposes all thirteen named helpers and the reduced-motion path is centralised.
The eight concepts have not yet been rewritten to compose them; they still use their existing local
timings. `condense` remains unwired at the concept level, which is the same gap as 2.1.

### 2.4 Visual capture is partial

`evidence/` holds four contact sheets (520/750/975/1200), eight per-window compact-history captures,
one artifact-and-history capture and one reduced-motion capture. The full matrix in the plan
(history × artifact × rail × mount × reduced motion) is exercised **functionally** by
`runMatrix` but not captured visually.

### 2.5 Known narrow-width limitation

`w8`'s artifact is a floating capsule and deliberately overlays the transcript; only the composer is
guaranteed clear. Every other concept keeps the artifact out of the transcript rectangle. This is
recorded as an open question in `impact-register.json` rather than settled inside a concept study.

---

## 3. How to re-verify

```
# fixture determinism and the frozen source
node demo/build-demo-bundles.mjs && sha256sum demo/demoData.json demo/demoData*.js
node demo/build-demo-bundles.mjs && sha256sum demo/demoData.json demo/demoData*.js   # identical

# serve on an OS-assigned port, never a fixed one
py -m http.server 0 --bind 127.0.0.1

# suites at a viewport of at least 1900x900
open http://127.0.0.1:<port>/tests/runner.html?run=1
# then window.__pmxTestExit, and the Run matrix button for window.__pmxMatrixExit

# hub validation, from the repository root
py Concepts/ConceptHub/validate.py Concepts/chat-assistant-concepts/opus-5
```

## Phase E - per-concept question systems, work clusters, BSD surfaces, handoff cards

**COMPLETE.** All eight thread concepts now carry their own assigned form. Written from the runs recorded
at the end of this section, not from intent.

### What E0 removed, and the distinction that replaced it

`shared/reveal.js` used to own `question(spec)` and `afterRender(host, svc, tid, from)` - one function
that decided the entrance, the advance and the collapse for all eight thread concepts. That is why every
questionnaire in this workspace used to look and move identically. Both are gone. What remains in
`reveal.js` is materials: `stagger / clearStagger / oneShot / springHeight / measure / reject / ripple /
capsule / keyFor / reduced / changed / celebrate`.

`shared/qflow.js` -> `PMXQFlow` is the deliberate opposite kind of sharing, and the distinction is the
whole point:

| deleted | kept |
| --- | --- |
| `reveal.afterRender()` decided WHAT THE QUESTION LOOKED LIKE | `qflow.act()` decides WHAT A VERB MEANS |

A question form is a design decision that must differ per concept. "What does Skip do to the store, and
where does a refusal belong" is not: it is one behaviour with one right answer, and eight copies of it is
eight chances to get it subtly wrong. `PMXQFlow` renders nothing and owns no DOM - `read()` returns one
coherent snapshot per render pass, `act(svc, tid, verb, arg)` covers answer / answerAt / skip / unskip /
goto / prev / next / submit / cancel and returns `{ ok, reason, offenderIndex, resolved }`.

Registered in `index.html`, `stage.html`, `contact.html`, `tests/runner.html`, and in `workspace.js`
`buildServices()` as `ctx.services.qflow`.

`shared/questionnaire.js` gained two read-only accessors: `isSkipped(qid, questionId)` and
`historyFor(threadId)`.

### The eight forms

| concept | question system | compact work cluster | BSD surface |
| --- | --- | --- | --- |
| t1 Speaker Turns | **margin interview** - a real speaker turn labelled `Puppet Master asks`; options are hanging-indent rows at the prose measure; `1 of 3` in the margin; submit condenses the turn to a one-line receipt turn | **two-row work strip** - a phase glyph index over ONE morphing label; groups reopen independently | **margin annotation** beside the turn |
| t2 Two-Tone Slabs | **composer capsule morph** - ONE bounds-interpolated element from slim capsule to card and back; `Question 2 of 3` bottom-left; the bottom-right control relabels `Skip` -> `Submit`; Cancel is the card's close control | **chip run** with counts morphing INSIDE each chip; collapses to a single `13 tools used` chip that reopens the run | a **`bsd` chip** opening a sheet |
| t3 Timeline Spine | **spine stepper** - each question is a square node ON the spine; the filled-node run IS the progress, so there is no `N of M` label anywhere | **spine units** - a completed closed group is its MARKER ALONE; single-open with independent reopen | a **side node** hanging off the spine |
| t4 Digest | **digest that unfolds** - one more digest entry using the concept's own `data-open` fold; `2/3` inside the digest line while open; a `- skipped` trail | **one work digest line** condensing to `Verified - 1 artifact - 22m`, opening a bounded internal-scroll ledger | its own **digest line** |
| t5 Paired Columns | **lane dialogue** - prompt in the assistant lane, form in the user lane, folding to a stacked stepper below 900px; lanes cross-fade | **third work rail** right of the assistant lane at 900px+, each row opening its detail IN THE USER LANE; condenses to a three-row summary | a **note in the user lane** |
| t6 Work Interleave | **monospace field form** - `Q1/3` prefix rows, NO CARD at all, options keyboard-numbered 1-9 (the digits are live), answers echoing as `-> answer` rows | **exec log** with fixed `kind / label / duration` columns and counts morphing in place; condenses to one `+N steps` row | a **`bsd` exec row** in the monospace register |
| t7 Cards with Air | **card deck** - up to three level-one cards offset behind each other by translate+scale; dot rank plus `2 of 3`; answering slides the top card off; cancel fans the deck out | **status card with a segmented phase bar** - the bar greys and the head reads `Complete - 22m`; segments are buttons opening SHEETS, never nested cards | a **flat link** inside the status card |
| t8 Reading Mode | **prose footnote** - a numbered `<ol>` at the reading measure, a gutter dot marking it, resolving to a footnote receipt; opacity plus a 6px rise ONLY | **micro-gutter dots plus one quiet line** - the dots stay and the line reads `Show work`; the global toggle reveals lines in place; each dot opens its own popup | **gutter dot plus one quiet line** |

### The yield rule, and the one place it is deliberately different

A pending question takes the space the work cluster occupies. What it takes and what it leaves is a
decision, not an accident, so it is recorded here:

| surface | behaviour when a question is pending | why |
| --- | --- | --- |
| Work surfaces (goal, todo, agents, activity, diff, verification) | **hidden** | The question is the thing being asked; the work continues underneath and returns intact, including which group was open. |
| Artifact handoff card | **stays** | It is the work's *product*, not a work surface. Hiding a finished artifact because a new question arrived would misreport what exists. |
| BSD advice | **stays** in t1, t3, t4, t5 | Advice is a *comment on* the work rather than part of it, and in those four concepts it has its own host (margin annotation, spine side node, digest line, user-lane note) that can outlive the cluster. |
| BSD advice | **hides with the cluster** in t2, t6, t7, t8 | In those four the advice IS a member of the cluster by design - a chip in the run, a row in the exec log, a link inside the status card, a gutter dot sharing the quiet line. Keeping it while its container hid would require inventing a second surface for it, which is a worse answer than yielding it. |

Underneath, the state is untouched in every case: `surfaces.yieldForQuestion` only flips a flag, and
`PMXQFlow.release()` clears it on both submit and cancel, so nothing is discarded and nothing has to be
rebuilt from scratch afterwards.

**Measured.** Each concept was loaded fresh with cleared persistence so the fixture's questionnaire is
genuinely pending, counted, resolved through its own controls, then counted again:

| concept | work cluster while pending | advice while pending | work after resolve | advice after resolve |
| --- | --- | --- | --- | --- |
| t1 | 0 | 1 | 1 | 1 |
| t2 | 0 | 0 | 2 | 0 (in the run) |
| t3 | 0 | 1 | 7 | 1 |
| t4 | 0 | 1 | 1 | 1 |
| t5 | 0 | 1 | 1 | 1 |
| t6 | 0 | 0 | 1 | 0 (in the condensed log) |
| t7 | 0 | 0 | 1 | 1 |
| t8 | 0 | 0 | 1 | 1 |

The handoff card counted 1 in every cell of that run - pending and resolved, all eight concepts. Zero console
errors and zero console warnings across the eight reloads.

Two readings in that table would look like leaks and are not, which is worth recording so a later reviewer
does not chase them:

- **t2 shows one `.t2-chip` on screen while a question is pending.** It is a PER-TURN transcript chip
  belonging to a message (`activity`), not a member of the thread work cluster: measured inside the
  transcript, and the work-surface host contains zero chips. The cluster yields completely. The per-turn
  chips stay for the same reason the message bodies do - they are part of the conversation, not the cluster.
- **t6 shows no `bsd` row after resolving.** The log is condensed to its single `+N steps` row at that point;
  expanding it renders twelve rows, the last of which is `bsd`. The advice is in the log, not missing from it.

The mechanism matters as much as the rule. Concepts ask `PMXQFlow.pending(svc, tid)`, **not**
`view[tid].surfacesYielded`. The flag is written by the question renderer, but every concept's `update()`
renders its work surfaces FIRST, so a concept that reads the flag paints its whole cluster for one frame
before the question displaces it - and any group the reader had open appears to close itself. Four concepts
additionally read activity, verification and advice straight off the thread rather than through
`surfaces.activeFor`, so those reads survived the flag entirely and left a partial cluster sitting beside
the question until that was gated too.

### Defects found by building Phase E, and fixed

1. **Six concepts were calling a function that no longer existed.** t1, t2, t5, t6, t7 and t8 still called
   `PMXReveal.afterRender(...)` after E0 removed it - a latent `TypeError` on every question render.
2. **Nothing ever released `surfacesYielded`.** Only Cancel cleared it, so a SUBMITTED flow left the work
   surfaces yielded for the rest of the session and the cluster never came back. `PMXQFlow` releases it on
   both submit and cancel, and on the no-question render path.
3. **The yield flag was read one render too early.** Every concept's `update()` renders work surfaces
   BEFORE the question, so reading `surfacesYielded` there painted the whole cluster for one frame before
   the question displaced it, and any group the user had open appeared to close itself. `PMXQFlow.pending()`
   is the authoritative answer.
4. **A submit refusal had nowhere to land.** `submit()` names the offending question; showing its reason
   under the Submit button is the toast behaviour the packet forbids wearing different clothes. The refusal
   now travels to the offending question and renders at that field.
5. **`skipped` outranked `active`** in t3's node state, so travelling back to a skipped question rendered an
   inert marker with no field and the run looked frozen.
6. **Diff counters read the wrong fixture keys** (`additions`/`deletions` instead of `added`/`removed`), so
   every change set rendered `+0 -0`.
7. **The skip map is keyed by a NUL-delimited composite** (`qid + '\0' + questionId`). A hand-rolled key in
   a renderer matched nothing, silently. Hence the `isSkipped` accessor.
8. **`activityGroupFor(lastMessage())` asks the wrong question.** The newest turn frequently carries no
   activity group, so the completed/condensed form was unreachable in t1 and t2. Both now read
   `activeFor().activity`, which walks back to the latest group.
9. **Thread-level reads survived the yield.** Activity, verification and advice are read straight off the
   thread rather than through `activeFor`, so t5, t6, t7 and t8 left a partial cluster beside the question.
   The work surfaces now yield as one thing.
10. **A latent closure bug in t7.** `var entry` is function-scoped, so every click handler on the top card
    read whatever the loop left in it - correct today only by accident of iteration order.
11. **Four concepts had no artifact subscription,** so their handoff cards said `compiling` forever:
    `artifacts.open()` writes session state, which no `view*` change key covers.
12. **Class-name collisions and unscoped rules.** t3's new work cluster collided with the transcript's own
    `.t3-unit`, and its first CSS pass was unscoped - which on the contact sheet, where all eight thread
    concepts are siblings in one document, would have styled its neighbours. Every new rule is now scoped
    `[data-pmx-thread="tN"]`, and 60 orphaned rules from the replaced question cards were deleted.
13. **t5's container query matched nothing.** The lanes queried `pmx-thread`, declared on the thread's own
    root, but the question and work regions are provided by the WINDOW and live inside its shell, which
    declares `pmx-chat`. Both containers are now addressed. The lanes also needed `grid-row: 1`, without
    which auto-flow put the user half in row 2 and the dialogue still read as a stack.


### Post-Phase-E audit (asked: is this polished, is anything missing)

Three gaps were found by auditing the tree against the packet rather than against memory. All three are
closed; two of them were real defects, not documentation drift.

1. **`SERVICES.md` had been lost.** It was never git-tracked, so there was nothing to restore. Nineteen
   references to it survive across thirteen shared modules, two windows, `CONTRACT.md` and `README.md`, so it
   is load-bearing. It has been **regenerated from `shared/*.js` itself** - every global, every
   `ctx.services` key and every exported member is read out of the modules, so the inventory can no longer
   drift from the code without the drift being visible in the file. 48 globals, 409 members.

2. **Phase E had ZERO committed test coverage.** Every behaviour was verified by browser probes, which are
   evidence but not regression protection: the suite's 237 assertions contained no reference to any of the
   eight question forms, the eight work clusters, or `PMXQFlow`. A refactor could have flattened all eight
   forms back into one shared card without failing a single test. The new **`forms` suite** closes that:
   it asserts each concept renders its own form AND no other concept's, the structural decision each form
   rests on (t1 asks as a real turn; t2 expands the SAME element; t3 shows no `N of M` anywhere; t6 has no
   border, no background and no radius; t7 never nests a card; t8 uses a real `<ol>` and a `<sup>` marker),
   the yield rule per concept, the `PMXQFlow` refusal contract, and that resolving releases the surfaces.

3. **The visual evidence was stale.** The captures predated Phase E, so they showed the question cards the
   phase replaced. Eighteen new captures were taken: `question-form-t1..t8-1200.png`,
   `work-cluster-t1..t8-1200.png` (on thread-06, which has live work and no queued question), and
   `t5-lanes-520.png` / `t5-lanes-1200.png` for the one form whose geometry is width-dependent.

Writing the `forms` suite immediately paid for itself by failing 16 assertions on its first run, which
exposed a defect the browser probes had not:

- **`motion.swapText` painted an empty frame when writing a FIRST value.** It cross-faded unconditionally -
  opacity to 0, then the text on the second animation frame - so every freshly mounted work line, chip and
  status label appeared blank for two frames. A first write has nothing to fade from; it is an entrance, not
  a morph. `swapText` now writes immediately when the element is empty and still cross-fades a replacement.
  Both halves of that contract are pinned by assertions in the `motion` suite so the distinction cannot be
  "simplified" away later.

The other eight first-run failures were the test's fault, not the product's, and are worth recording because
the same trap caught an earlier probe: **thread-01 always has a questionnaire queued after a reset**, so on
that thread the work cluster is correctly always yielded. The un-yielded cluster can only be observed on a
thread that has work and no question - thread-06 - and the suite now uses it for exactly that one assertion,
while every form and yield assertion still runs on thread-01 with a live question.

**Verification after the audit**: suite **351 total, 351 passed, 0 failed, 0 console errors, 0 console
warnings** (23 suites, 4,450 ms); the full matrix re-run because `shared/motion.js` changed - **128 runs,
512 assertions, 0 failed, 0 errors, 0 warnings**; validator passes; fixture still byte-frozen at 349,661.

### Verification runs

- **Interaction suite** (`tests/runner.html?run=1`, 1920x1000): **351 total, 351 passed, 0 failed,
  0 console errors, 0 console warnings**, 4,450 ms.
- **Matrix sweep**, all 64 pairings at 520 px and 750 px, run in per-window slices: **128 runs,
  512 assertions, 0 failed, 0 console errors, 0 console warnings**. Every window contributed 16 runs and
  64 assertions with zero failures.
- **Director sweep**: 16 families, **93 events, 93 ok, 0 failed**. This run fired the events in sequence
  WITHOUT resetting between them, so it measures only that every declared event acts; it is not the
  per-event measurement in `TEST_REPORT.md`, which resets before each trigger and therefore correctly
  records 18 with no store effect of their own (a sequence step fired without its predecessor, an
  idempotent trigger fired twice, or a co-dependent pair).
- **Host pages**: `index.html` (16 gallery cards), `stage.html`, `contact.html` (8 theme stages) and
  `tests/runner.html` all reach `data-pmx-ready="1"` with **zero** console errors or warnings.
- **ConceptHub validator**: `Concept validation passed: Concepts\chat-assistant-concepts\opus-5`.
- **Syntax**: `node --check` passes on every `.js` in the concept.
- **Policy**: zero references to third-party browser-automation tooling anywhere in the folder.

### Per-concept behavioural probes (all driven in the browser)

- **t1**: the question renders as a real turn labelled `Puppet Master asks` with `1 of 3` in the margin and
  hanging-indent option rows (20px marker track); skip leaves `1 skipped` in the margin; `Send answers`
  condenses to a `2 answers sent, 1 skipped` receipt turn whose popup lists three rows; cancel leaves
  `Questions cancelled`; the strip's glyph index opens groups independently (1 -> 2 -> 3 panels, closing one
  leaves the rest); `todo.complete` twice morphs the single line `4/8 -> 5/8 -> 6/8` with the strip's child
  count fixed at 4; the handoff walks `idle/compiling -> loading/compiling -> ready/ready`; under reduced
  motion three rendered nodes report zero running animations.
- **t2**: one stamped capsule node carried all four questions and the at-end state with `count: 1`
  throughout and heights interpolating 122 -> 102 -> 69; the bottom-right control relabelled `Skip` ->
  `Submit`; a synchronous frame capture caught the SAME node at `data-expanded="0"`,
  `data-phase="submitting"`, reading `Submitting answers`; the todo chip morphed `4/8 -> 5/8` on the same
  element with the chip count unchanged; the run collapses to one chip reading exactly `13 tools used`,
  which reopens the run and offers `Collapse`.
- **t3**: the refusal travels and renders `This question is required.` at the field with zero toasts; skip
  leaves a hollow dashed node with Unskip reachable; submit yields a `3 answered` receipt; cancel collapses
  the whole run to one `Questions cancelled` node; six completed groups render as markers alone with the
  fact still reachable by title; an open group survives an artifact tick.
- **t4**: the question digest carries `1/3` inside its line, folds to `data-open="0"` with the counter and
  body gone, unfolds back, and a skip writes a `- skipped` trail row with Unskip reachable.
- **t5**: at a 1200 px chat the question host is a two-track grid (415 px user / 726 px assistant) with the
  user lane LEFT and both halves on one row; at 520 px they stack with the same left edge; the rail is the
  third column at x=829 and a rail row opens its detail at x=392 - left of the rail, same row; the
  condensed rail is three rows reading `13 tools used`, `1 artifact`, `1m 34s`; cancel collapses both lanes
  to one receipt row.
- **t6**: the form has border `0px none`, transparent background, radius `0px` and a monospace face - no
  card anywhere; `Q1/3`, `Q2/3`, `Q3/3` rows are all on screen; pressing `2` selects the second option and
  echoes `-> The first ready account`; `Enter` advances; `Escape` cancels to `-> cancelled`; the log's three
  tracks measure `52.73px 621.25px 41.02px`; `todo.complete` twice morphs `4/8 -> 5/8 -> 6/8` on the SAME
  row element with the row count fixed at 13; the condensed form is one `+12 steps` row that expands the
  log and offers `- collapse`.
- **t7**: the deck renders three sibling cards (ranks 2/1/0) with the two behind absolutely positioned at
  `scale(.964) translateY(20px)` and `scale(.982) translateY(10px)`, no nesting; the dot rank advances
  `current -> done`; answering applies `t7-qcard-off` and promotes the next card; cancel fans the deck
  (rotate transforms) then collapses to a `Cancelled` summary card that keeps the dot rank; the status head
  reads `Complete - 1m 34s` with `13 tools used` beneath, all six segments are buttons and the bar greys on
  completion; a segment opens a popup sheet and no card appears inside the status card.
- **t8**: the marker is a `<sup>` reading `1 of 3`, the options are a real `<ol>` with `decimal` numbering
  at a 531 px (68ch) measure inside an 18px gutter grid, and the block has border `0px` on a transparent
  background; the `t8-qnote-rise` keyframes are exactly `opacity: 0; transform: translateY(6px)` ->
  `opacity: 1; transform: none` with no `height` anywhere; the cluster yields entirely while a question is
  up; the resolved footnote reads `3 answers sent.` behind a `†` mark; condensed, seven dots stay and the
  line reads exactly `Show work`; the toggle reveals seven rows in place; the `bsd` dot opens its own popup.
