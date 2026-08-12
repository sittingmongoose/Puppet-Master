# 5.6 Sol Motion Storyboards

Motion is behavioral evidence: it explains origin, ownership, continuity, waiting, replacement, and completion. It never carries the only state cue. Targets do not move under the pointer, loops are limited to truthful active progress, and every sequence has an immediate reduced-motion branch.

## Shared timing and continuity rules

- Direct response: 120–180 ms for hover, pressed, focus, local selection, and in-place state replacement.
- Spatial handoff: 220–420 ms for history, artifact, popup, question, and remount choreography.
- Continuous progress: only while the matching operation is active; it stops on success, error, cancellation, offline, or reduced motion.
- Easing: fast departure and controlled settle (`cubic-bezier(.22, 1, .36, 1)`), with no elastic overshoot.
- Stable identity: selected message, thread, artifact, draft, question, Goal, operation, and scroll-anchor ids survive every transition.
- Reduced motion: duration collapses to effectively zero, smooth scroll becomes immediate, progress travel becomes a static semantic line, and border/text/status changes remain.

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

The implementation contains 24 distinct thread-layer animation families—message, questionnaire, and work for every concept—rather than one shared settle with different names. Together with eight window families, the anchored popup family, and truthful artifact progress, the reduced-motion audit covers 34 authored families.

| Thread | Message mechanism | Questionnaire mechanism | Work mechanism |
| --- | --- | --- | --- |
| T1 Edition | `edition-impose`: page matter imposes from the binding edge | `edition-question-turn`: a shallow facing-page turn | `edition-work-compose`: work notes compose upward into the page |
| T2 Dialogue Score | `score-cue`: a speaker cue rises on the shared beat | `score-question-count-in`: the measure counts in from the top stave | `score-work-raise`: independent work staves rise into register |
| T3 Timefield | `timefield-descend`: entries descend to their temporal coordinate | `timefield-question-mark`: a waypoint drops onto the time axis | `timefield-work-band`: elapsed-work bands extend into place |
| T4 Branchbook | `branchbook-unfold`: prose unfolds from its source joint | `branchbook-question-sprout`: an answer fork sprouts from the branch spine | `branchbook-work-reveal`: revision layers reveal from ancestry |
| T5 Workshop | `workshop-place`: correspondence is placed with paper weight | `workshop-question-pin`: the brief lands and settles under its pin | `workshop-work-place`: instruments are placed on the bench |
| T6 Braided | `braided-weave`: opposing roles weave from opposite sides | `braided-question-knot`: the question strands tighten toward one knot | `braided-work-converge`: child work converges into synthesis |
| T7 Relay | `relay-handoff`: messages travel in role-owned handoff directions | `relay-question-checkpoint`: the parent checkpoint advances laterally | `relay-work-stage`: work stages enter along the relay course |
| T8 Quiet Current | `quiet-current-settle`: prose settles only a few pixels into flow | `quiet-question-focus`: the focus sheet resolves by emphasis | `quiet-work-register`: the active runline registers in place |

All 24 sequences use bounded transform and opacity, retain fixed interaction targets, and collapse to immediate semantic placement under reduced motion.

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

## Slint 1.17.1 translation notes

- Express each concept as compositional components over one typed state adapter; do not port DOM or CSS selectors.
- Use explicit width-state branches and stable component keys for 520–1200 px behavior.
- Restrict animation primitives to opacity and bounded translate/scale/rotation supported by the target; precompute token colors instead of depending on CSS `color-mix()` or `oklch()` at runtime.
- Virtualize long transcript slices by stable message id and measure anchor deltas after expansion.
- The shared overlay owner handles one popup, viewport collision, Escape, focus entry, and return.
- Run all full-motion sequences with the OS preference and the explicit in-app reduced-motion flag; either must choose the reduced branch.
