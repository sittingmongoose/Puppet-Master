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

Written from the runs recorded below, not from intent.

### Landed and verified in a real browser

- **E0 - `shared/reveal.js` is primitives only.** `question(spec)` and `afterRender(host, svc, tid, from)`
  are gone. They were what made all eight thread concepts move identically. What remains is
  `stagger / clearStagger / oneShot / springHeight / measure / reject / ripple / capsule / keyFor /
  reduced / changed / celebrate` - materials, not choreography.
- **`shared/qflow.js` -> `PMXQFlow` (new).** The ACTION layer for questionnaires. Renders nothing, owns
  no DOM. `read()` returns one coherent snapshot per render pass; `act(svc, tid, verb, arg)` covers
  answer / answerAt / skip / unskip / goto / prev / next / submit / cancel and returns
  `{ ok, reason, offenderIndex, resolved }`. Registered in `index.html`, `stage.html`, `contact.html`,
  `tests/runner.html` and in `workspace.js` `buildServices()` as `ctx.services.qflow`.
  This is deliberately the opposite kind of sharing from what E0 deleted: a question *form* must differ
  per concept, but "what does Skip do to the store, and where does a refusal belong" is one behaviour
  with one right answer. Three of the four defects found while building t3 were in that plumbing.
- **`shared/questionnaire.js` gained two read-only accessors:** `isSkipped(qid, questionId)` and
  `historyFor(threadId)`. The skip map is keyed by a **NUL-delimited** composite (`qid + '\0' + id`);
  eight renderers reconstructing that key is eight chances to silently match nothing, which is exactly
  what happened on the first attempt.
- **t3 Timeline Spine - complete.** Spine stepper (each question is a square node ON the spine; the
  filled-node run *is* the progress, so there is no `N of M` label anywhere); spine work units where a
  completed closed group is its **marker alone**; single-open with independent reopen; BSD advice as a
  **side node** off the spine (read-only, Dismiss only, severity carried by border style *and* the
  words "caution"/"note"); artifact handoff node with `compiling -> ready` and a `Worked for` line.
- **t4 Digest - complete.** The question is one more **digest entry** using the concept's own
  `data-open` fold, with `2/3` inside the digest line while open and a `- skipped` trail; the work
  surfaces are ONE **work digest line** (`Phase 4 of 4 - 6/8 Todos - 3 agents - +182 -41`) condensing to
  `Verified - 1 artifact - 22m` and opening a bounded internal-scroll ledger; advice is its own digest
  line; handoff is a one-line card in the same register.

### Defects found by building E and fixed

1. **Nothing ever released `surfacesYielded`.** Only Cancel cleared it, so a *submitted* flow left the
   work surfaces yielded for the rest of the session and the cluster never came back. Now released by
   `PMXQFlow` on both submit and cancel, and by the no-question render path.
2. **The yield flag is read one render too early.** Every concept's `update()` renders work surfaces
   *before* the question, so reading `surfacesYielded` there painted the whole cluster for one frame
   before the question displaced it, and an open group appeared to close itself. `PMXQFlow.pending()` is
   the authoritative answer and is what t3/t4 now ask.
3. **A submit refusal had nowhere to land.** `submit()` names the offending question; showing its reason
   under the Submit button is the toast behaviour the packet forbids in different clothes. The refusal
   now travels to the offending question and renders at that field.
4. **`skipped` outranked `active`.** Travelling back to a skipped question rendered it as an inert
   marker with no field, so the run looked frozen. Active now outranks skipped, and the skip rides
   along as its own attribute so the cue is not lost.
5. **Diff counters read the wrong fixture keys** (`additions`/`deletions` instead of `added`/`removed`),
   which rendered every change set as `+0 -0`.
6. **Six concepts were calling a function that no longer exists.** t1, t2, t5, t6, t7 and t8 still
   called `PMXReveal.afterRender(...)` after E0 removed it - a latent `TypeError` on every question
   render. Those call sites and their now-unused `measure()` results are removed.

### Outstanding - honest list

- **t1, t2, t5, t6, t7, t8 keep their PRE-EXISTING question card.** It renders, advances, and throws
  nothing (verified: all eight pairings, zero console errors), but it is *not* the form the packet
  assigns them: the margin interview (t1), the composer-capsule morph (t2), the lane dialogue (t5), the
  monospace field form (t6), the card deck (t7) and the prose footnote (t8) are all unbuilt. Those six
  currently have **no** entrance/advance choreography at all, which is honest rather than borrowed.
- **The same six keep their existing work surfaces.** The two-row work strip (t1), chip run (t2), third
  work rail (t5), exec log (t6), segmented phase bar (t7) and micro-gutter dots (t8) are unbuilt, as are
  their six BSD advice surfaces and six handoff cards.
- **Reports are stale for Phase E.** `TEST_REPORT.md`, `COVERAGE.md`, `GAP_REPORT.md` and
  `VISUAL_AUDIT.md` describe the state before this phase.

### Verification runs recorded this phase

- Interaction suite, `tests/runner.html?run=1` at 1920x1000: **237 total, 237 passed, 0 failed,
  0 console errors, 0 console warnings** (2,855 ms).
- All eight `w1+tN` pairings mounted through `PMXWorkspace.setPairing`: each renders its own question
  DOM (`t1-question`, `t2-question`, `t3-qrun`, `t4-qdigest`, `t5-question`, `t6-question`,
  `t7-question`, `t8-question`), each advances on Next/Submit, **zero** console errors or warnings.
- t3 behavioural probes: refusal travels and renders `This question is required.` at the field with
  zero toasts; skip leaves a hollow dashed node with Unskip reachable; submit yields a `3 answered`
  receipt whose popup lists three rows; cancel collapses the whole run to one `Questions cancelled`
  node; `todo.complete` fired twice morphs `4/8 -> 5/8 -> 6/8` with the row count fixed at 7;
  advice dismiss removes the node; handoff walks `idle/compiling -> loading/compiling -> ready/ready`
  and an open work group survives an artifact tick; under reduced motion 10 rendered nodes report zero
  running animations.
- t4 behavioural probes: the question digest carries `1/3` inside its line, folds to `data-open="0"`
  with the counter and body gone, unfolds back, and a skip writes a `- skipped` trail row with Unskip
  reachable while the counter advances to `2/3`.
- **The 64-pairing matrix sweep was NOT re-run to completion this phase.** The probe driving it hit a
  CDP protocol timeout mid-run; that is a harness timeout, not a failure, and no result is claimed.
