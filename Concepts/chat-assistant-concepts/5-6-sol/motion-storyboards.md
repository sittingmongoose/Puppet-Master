# 5.6 Sol Motion Storyboards

Motion is behavioral evidence: it explains origin, ownership, continuity, waiting, replacement, and completion. It never carries the only state cue. Targets do not move under the pointer, loops are limited to truthful active progress, and every sequence has an immediate reduced-motion branch.

## Shared timing and continuity rules

- Direct response: 120–180 ms for hover, pressed, focus, local selection, and in-place state replacement.
- Spatial handoff: 220–420 ms for history, artifact, popup, question, and remount choreography.
- Continuous progress: only while the matching operation is active; it stops on success, error, cancellation, offline, or reduced motion.
- Easing: fast departure and controlled settle (`cubic-bezier(.22, 1, .36, 1)`), with no elastic overshoot.
- Stable identity: selected message, thread, artifact, draft, question, Goal, operation, and scroll-anchor ids survive every transition.
- Reduced motion: duration collapses to effectively zero, smooth scroll becomes immediate, progress travel becomes a static semantic line, and border/text/status changes remain.
- State contract: message articles expose `data-motion-state="commit|redirect|queued"`; the thread root exposes `data-question-motion="prepare|open|page|select|submit|receipt"` and `data-work-motion="progress|condense|reopen"`. The matching `.question-preparing`, open surface, selected option, submitting surface, receipt, current work row, or expanded history supplies the visual target. The transient cue is cleared after the authored sequence, so a transcript rerender is not itself a motion event.
- Fixed geometry: question navigation, the composer, active-work ownership, and popup anchor do not move under the pointer. Transforms paint within the final box and never determine layout or meaning.

## Window concepts

### W1 — Atlas Folio

Thesis: history and artifacts open from known seams around a stable reading leaf.

1. The selected message and transcript anchor remain fixed.
2. Pinned history opens from the binding gutter; compact and full modes change the number of readable folio details without overlaying prose.
3. An artifact shortcut selects its identity first, then the left foldout plate hinges open and reports loading.
4. Ready or error replaces the plate body in place; retry never closes the foldout.
5. Dock/pop-out preserves the page marker and semantic state, then settles the leaf in its new frame.

Reduced motion: gutter, plate, and remount geometry replace atomically; the same labels, borders, and loading/error states remain.

### W2 — Stage Bay

Thesis: state changes are paced stage cues; supporting systems enter from the correct wing.

1. A cue lamp changes before an active work surface enters.
2. History enters as a backstage cue stack and artifacts from the left scene bay; the transcript remains the performance plane.
3. Questions hold the composer and take the thread stage without moving header controls.
4. Completion extinguishes the active cue and leaves durable evidence where it occurred.

Reduced motion: the cue word and lamp state change immediately; entering surfaces are placed at final geometry with no fade-only transition.

### W3 — Signal House

Thesis: movement follows a visible route and terminates in an inspectable receipt.

1. A route or thread is selected at a stable switchboard position.
2. The dispatch lane updates in place while the route board advances the selected marker.
3. Offline work queues at a visible station; reconnect changes transport separately from domain sync.
4. Replay traverses once to the delivered receipt; a second replay reports zero work without duplicating a message.

Reduced motion: route markers and labels replace at fixed coordinates; replay progress is a sequence of static state changes.

### W4 — Lens Chamber

Thesis: focus transfers through concentric zones without moving the current target.

1. Context Ring opens from the header origin while the transcript remains centered.
2. Message selection changes a local semantic mark and the selection count.
3. Focus/Mute/Subcompact changes the calibrated mode at the same center.
4. Apply Subcompact writes a receipt; the source message and rehydration identity remain reachable.

Reduced motion: scale is removed and the focused ring/state replaces immediately; contrast and labels retain the complete meaning.

### W5 — Field Desk

Thesis: desk objects move on measured axes and settle with weight around protected correspondence.

1. An artifact identity travels conceptually from its message shortcut to the left work board.
2. The board opens before content loads; the correspondence marker and draft stay fixed.
3. History opens as an index drawer beneath the correspondence column under pressure.
4. Switching artifacts changes the board object in place and preserves prior selection for reopen.

Reduced motion: board and drawer appear at final coordinates; identity, selection, loading, update, and retry text provide continuity.

### W6 — Tidal Shelf

Thesis: shared volume yields and settles, with no bounce or decorative looping.

1. Pinned history broadens the right reservoir using spare host width.
2. The conversation current retains its width and anchor while the artifact bank opens left.
3. Concurrent work collects into distinct thread-owned eddies.
4. Completion condenses each eddy into a durable evidence delta rather than removing it.

Reduced motion: regions change size immediately; state words and persistent identities replace the displacement cue.

### W7 — Concourse

Thesis: direction communicates destination—lateral for threads, left for artifacts, vertical for history.

1. A history selection advances along stable mezzanine stops.
2. Exact search jumps load the bounded message range and move focus to the destination, not the entire thread.
3. Artifact handoff opens the left hall and leaves explicit wayfinding back to the source.
4. Pop-out keeps destinations and selected objects, then changes only the containing architecture.

Reduced motion: destination boards and focus change immediately; no simulated travel is required.

### W8 — Quiet Frame

Thesis: motion reduces density and proves origin without ornament.

1. New content settles a few pixels from the composer baseline into final document flow.
2. Detail opens as aligned in-place text, not a floating card.
3. Completion replaces the active runline and reduces visual weight.
4. History and artifact regions change one measured rule and label at a time.

Reduced motion: all replacements are atomic; typography, rules, and state words preserve the hierarchy.

## Thread concepts

### T1 — Edition

New messages typeset from the composer baseline into the publication. Numbered work notes collect at their source passage. A facing-page question replaces content inside one stable question chapter; Back/Next does not move the navigation. Submission resolves into a durable colophon. Reduced motion skips travel and preserves chapter/answer indexes.

### T2 — Dialogue Score

Speaker passages enter on a shared beat. Work staves advance independently and hold terminal measures. Question choices occupy fixed beats, with prior answers retained in the score key. Reduced motion advances only the semantic beat marker and text.

### T3 — Timefield

Activity advances through chronological bands; waiting holds its coordinate, redirect splits an interval, and completion contracts to a temporal summary. Question waypoints retain earlier answers. Reduced motion replaces interval state and uses no traveling progress cue.

### T4 — Branchbook

A branch grows from the exact source joint, not from the viewport edge. Redirect keeps the interrupted attempt visible. Rewind shifts conversation focus while restore creates a sibling branch and explicitly leaves files unchanged. Reduced motion adds the branch joint and focus immediately.

### T5 — Workshop

An instrument drawer opens from the object it affects. File, test, browser, worktree, port, diff, and artifact operations may remain independently open. Completion returns tools to a compact inventory while outputs stay on the bench. Reduced motion uses direct drawer-state replacement.

### T6 — Braided

Child work splits from a parent strand, progresses independently, and rejoins only through an explicit synthesis knot. Failed and fallback strands retain their positions. Reduced motion changes connection marks and labels without spatial weaving.

### T7 — Relay

A request leaves the parent zone, waits at a capacity gate, enters a child zone, and returns an attributable result to synthesis. Questionnaire checkpoints are parent-owned; the child waits safely and never asks the user directly. Reduced motion advances numbered handoff states in place.

### T8 — Quiet Current

Send uses one short settle, live activity replaces one runline, and completion reduces density. The question focus sheet pauses above the composer and returns the durable draft on cancel/submit. Reduced motion is the default-feeling expression: immediate placement with complete text and focus cues.

## Implemented thread-motion receipt

The CSS keys each thread grammar to semantic state rather than animating the entire transcript. A message moves only while its article exposes `data-motion-state="commit|redirect|queued"` beneath the matching `data-thread-concept="thread-01"` through `thread-08`; ordinary rerenders do not replay settled messages. Commit and queued placement share the concept's composer-to-transcript origin, while redirect uses a separate return or branch-handoff path. Questionnaire prepare, open, selection, submit, and historical receipt are separately named transitions. The current work row changes at one stable locus, and reopening completed activity reuses that concept's work grammar.

| Thread | Direct send | Question lifecycle and history | Active work, condense, and reopen |
| --- | --- | --- | --- |
| T1 Edition | `edition-send`; `edition-redirect` returns through the binding | `edition-question-prepare/open/submit/receipt`; `edition-select` records the answer index | `edition-phase`; expanded history composes from the page origin, then the shared compact summary remains reopenable |
| T2 Dialogue Score | `score-send`; `score-redirect` re-counts on the shared beat | `score-question-prepare/open/submit/receipt`; `score-select` marks the fixed beat | `score-phase`; reopened measures use the same top-stave origin |
| T3 Timefield | `time-send`; `time-redirect` opens a revised interval | `time-question-prepare/open/submit/receipt`; `time-select` marks a fixed waypoint | `time-phase` targets `.activity-band.is-current`; reopened intervals descend from the time origin |
| T4 Branchbook | `branch-send`; `branch-handoff` returns to the source joint | `branch-question-prepare/open/submit/receipt`; `branch-select` resolves the local fork | `branch-phase`; reopened ancestry returns from the branch joint while retained attempts stay visible |
| T5 Workshop | `workshop-send`; `workshop-redirect` replaces correspondence on the bench | `workshop-question-prepare/open/submit/receipt`; `workshop-select` pins the choice | `workshop-phase`; reopened tool evidence returns to the bench without displacing outputs |
| T6 Braided | `braided-send`; `braid-redirect` reverses the active strand | `braided-question-prepare/open/submit/receipt`; `braid-select` tightens the selected knot | `braid-phase`; reopened child evidence converges toward synthesis but failed strands remain named |
| T7 Relay | `relay-send`; `relay-handoff` returns along the opposite role-owned direction | `relay-question-prepare/open/submit/receipt`; `relay-select` advances the parent-owned checkpoint | `relay-phase`; reopened evidence enters from the return side of the course |
| T8 Quiet Current | `quiet-send`; `quiet-redirect` is the smallest return settle | `quiet-question-prepare/open/submit/receipt`; `quiet-select` changes the small local mark | `quiet-phase`; history reappears with the smallest displacement and condenses to the runline |

The eight window selectors animate only `.artifact-region` and `.history-region`; transcript content is not replayed when a sibling region opens. The popup uses one anchored bounded placement. These are paint-only transforms with final layout present from the first frame, so the same model is feasible in Slint without DOM-dependent geometry.

The reduced-motion branch is an explicit fixed-geometry equivalent, not just a duration override: animated state surfaces are forced to final opacity and transform; preparing uses a dashed boundary, submitting a double boundary, historical receipts a terminal bottom rule, active work a full inset outline, and active progress a static line. The OS preference and the in-app `data-reduced-motion="1"` flag implement the same semantic result.

## Cross-system storyboards

### Message send, redirect, and stop

1. Typed draft remains visibly owned by the composer.
2. Send commits one stable message/operation identity.
3. If a turn is active, the prior attempt is marked retained and the new message redirects it; no Resend action appears.
4. If the composer is empty while active, the primary action is Stop.
5. Terminal state preserves partial evidence and returns focus to the composer.

### Stable questionnaire lifecycle

1. Preparing holds the ordinary draft and announces that it is retained.
2. Open places one concept-specific question surface at a stable transcript position.
3. Answer, Skip, Back, and Next mutate content without moving navigation targets.
4. Required validation appears in place.
5. Cancel returns the ordinary composer and retains answers/history.
6. Submit enters an explicit submitting state, then a durable historical receipt.

### Compact execution activity

1. One compact active summary names current work and elapsed time.
2. Domain updates coalesce in place; independent domains retain independent expansion.
3. Waiting, blocked, failure, fallback, and offline remain visible states, not hidden pauses.
4. Completion condenses into a reopenable activity history attached to the assistant message.

### Artifact handoff

1. The message shortcut selects a stable artifact identity.
2. The left workspace opens in loading state without shifting the transcript anchor or draft.
3. Ready, updated, error, and retry replace the workspace body at fixed geometry.
4. Switch preserves prior selection; close/reopen restores the last artifact.
5. Editor/Reveal routes stay disabled with reasons until canonical wiring exists.

### Offline, reconnect, replay, snapshot

1. Offline Send appends one queued message with one operation id.
2. Reconnect changes transport to Synchronizing while domain replay remains pending.
3. Replay delivers each unseen operation once and records the result.
4. Replaying again is a visible zero-op.
5. Snapshot catch-up advances the domain cursor without declaring server work lost.

## Motion evidence and acceptance

Settled screenshots remain necessary spatial evidence, but they do not prove a transition. Record timestamped before, causal-state, and after frames for every thread concept in both normal and reduced motion. Tests should prove:

1. **Send and redirect:** the composer rectangle and scroll anchor stay stable; only the newly committed direct message moves; a redirect preserves the interrupted operation and makes the branch or handoff destination explicit.
2. **Question lifecycle:** Prepare, Open, Select, Back/Next, required validation, Submit, and historical receipt are each observable states. Previous answers survive page travel, and the navigation target rectangles do not move between states.
3. **Active work:** one current phase changes in place while counts and elapsed time update. Completion condenses to one durable summary; reopening restores the same phase evidence without replaying unrelated messages.
4. **Window regions:** opening and switching history or artifacts leaves the transcript anchor, draft, selected message, and sibling-region ownership unchanged at 520, 750, and 1200 px.
5. **Reduced motion:** both OS preference and the in-app flag produce final geometry immediately, stop traveling progress, and retain the dashed preparing boundary, double submitting boundary, receipt rule, selected-answer mark, current-work outline, and readable state text.
6. **Production legibility:** metadata, action labels, dense rows, history controls, and questionnaire controls meet their token floors without clipping, overlap, horizontal loss, or inaccessible contrast in every theme, with explicit focus-visible evidence.

For each of T1–T8, capture at least one mid-transition frame for send, question open/submit, and active-work replacement, plus the matching fixed-geometry reduced-motion frame. For W1–W8, capture region closed, opening, ready/error, and reopen states. A selector count or a final still is not accepted as causal motion evidence.

## Slint 1.17.1 translation notes

- Express each concept as compositional components over one typed state adapter; do not port DOM or CSS selectors.
- Use explicit width-state branches and stable component keys for 520–1200 px behavior.
- Restrict animation primitives to opacity and bounded translate/scale/rotation supported by the target; precompute token colors instead of depending on CSS `color-mix()` or `oklch()` at runtime.
- Virtualize long transcript slices by stable message id and measure anchor deltas after expansion.
- The shared overlay owner handles one popup, viewport collision, Escape, focus entry, and return.
- Run all full-motion sequences with the OS preference and the explicit in-app reduced-motion flag; either must choose the reduced branch.
