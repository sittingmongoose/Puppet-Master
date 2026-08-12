# Fable — Motion Storyboards

Every storyboard names its owner. Behaviors owned by the shared layer are boarded
once and inherited by all sixteen concepts; concept-owned boards follow. Reduced
motion is a complete product state everywhere: identical final states, static
hierarchy or immediate replacement instead of movement, preserved focus, scroll,
and meaning. The only permitted continuous motions are truthful active states
(BSD Auto evaluating glow, Courier locus ring, Teletype receive cursor, Ledgerline
caret, Choreograph orbit, Dossier case breath) and every one of them has a static
reduced-motion equivalent (steady glow, solid ring, dimmed block, dimmed caret,
solid orbit ring, plain dot).

## Shared-layer storyboards (inherited by all concepts)

### 1. Message send / queue / replay and transcript settle
- Send: draft clears, the user message appends; each thread concept authors the arrival (see per-concept boards). Scroll follows only when the reader is at the bottom.
- Steer during active work: the message appends with a `redirect` flag; the live work surface rewrites its summary in place ("Steering with your correction") — no new card.
- Offline queue: the send lands in the outbox; the composer shows the offline note; the sync badge counts queued items. Nothing enters the transcript.
- Replay: on reconnect the transport passes Reconnect → Replay; queued sends append exactly once (idempotency keys), then the scripted turn runs. A second replay changes nothing.
- Reduced motion: appends are instant; the outbox/badge states are static.

### 2. Long-message collapse and expand with anchor preservation
- Collapse-eligible prose shows a bounded preview and a concept-voiced expander. Expanding and collapsing preserve the top visible message via the scroll keeper (measure → mutate → restore offset). Streaming never re-collapses. Manual state persists across dock/pop-out and reload.

### 3. Model / effort / Normal-Fast submenu changes
- Click opens the plate popup with corner-origin sprout (130 ms settle). Selecting a model replaces the popup body in place with the effort/speed stage — the menu stack stays open, resizing in place. Effort and speed select without closing; Done or Escape closes. Collision flips the origin corner; one transient overlay ever. Reduced motion: popups appear in final position.

### 4. Access and BSD state changes
- Access selection swaps the bar text immediately; when Review mode narrows Full Access, the effective result renders as one string ("Full Access · Limited by Review mode").
- BSD Auto evaluating is the sole licensed glow: box-shadow halo plus a 1.4 s opacity breath, ending the moment evaluation ends. Manual On is a static accent treatment, visually distinct from the glow. Timeout/unavailable/advice states swap text/badges without motion. Reduced motion: steady halo, no breath.

### 5. Approvals and route warnings
- Cards enter the decision stack above the composer (concept-region), compact first: one question, one scope line, immediate actions. Details expands evidence in place. Resolution removes the card and posts a receipt to the inline ticker, which fades after six seconds into the receipts record. Reduced motion: instant swap.

### 6. Context selection / Compact Now / branch / rewind / restore
- Lens marks apply instantly (Mute/Focus) as outline flags on the message; Subcompact marks accumulate into the Apply bar which counts pending items; Apply converts up to 25 and reports the remainder.
- Compact Now animates nothing: the ring value and segments update, and the receipt ticker carries the operation summary.
- Branch/rewind/restore post receipts and (for branch/rewind) switch to the new leaf; the source thread never moves.

### 7. Offline / reconnect / replay / snapshot catch-up
- Transport states render in the status-bar badge (Live → Offline → Reconnect → Replay → Live; or Snapshot catch-up). Domain rows (thread/goal/usage) change independently in the badge popup. Server work continuing is a domain state, not a banner. No motion beyond text/state swaps.

### 8. Dock / pop-out remount
- Pop-out raises a scrim and a framed window (280 ms rise-and-settle, origin center-bottom); the docked slot leaves a ghost with a dock-back affordance. All semantic state (thread, draft, expansions, questionnaire, search, selection) is shared, so the remount is a re-projection, not a transfer. Dock-back reverses. Reduced motion: frame appears in place.

### 9. Artifact loading / update / error / switch / close (chrome states)
- Content states swap inside the window's artifact region: loading (clock + label), ready (content), updated (accent stamp line), error (message + Retry). Switching artifacts reuses the same region; no stacking. The geometry motion is window-owned (boards below).

## Window-concept storyboards

### W1 Proscenium — history peek/pin/compact/unpin · artifact handoff
- Peek: the history wing slides in over the stage edge (340 ms settle) as an elevated overlay; leaving the wing slides it back.
- Pin: the overlay docks — width animates on the same axis; the stage's max-width eases simultaneously so the floor line never breaks.
- Full→compact fallback: wing width contracts to the cast list in one movement; rows swap to glyph form at the midpoint.
- Artifact open: the set-piece wing slides from the same axis between history and stage; close reverses along the entry path. Diff/artifact handoff from transcript controls lands here with the wing's slide as the causal echo.

### W2 Bindery — history · artifact page
- Peek: the contents leaf lays flat from 0.96 horizontal compression beside the spine; pinning keeps it; closing folds it back.
- The verso page opens with the same lay-flat; the gutter shadow widens from zero. Plate switching swaps verso content with no page movement.

### W3 Instrument Deck — history · artifact monitor
- The film-strip and monitor open with stepped width (steps(4)) — a mechanical index, not a glide. Frames nudge 2 px on hover with steps(3).
- Channel switching is a hard content swap with the status lamp changing color; the deck itself never moves.

### W4 Depth Field — history · artifact planes
- Peek advances the history plane from the rim: translate + scale 0.94→1 with shadow deepening (340 ms).
- Docking is a width ease to flush; receding reverses into the rim, whose edge marks stay raised while a plane is out.
- The artifact plane advances identically; Glass themes carry plate sheens through the whole move.

### W5 Workbench — history · bench
- The drawer snaps open in 120 ms with square timing; peek overlays, pin fixes the slat, compact narrows to the glyph rail.
- Bench tabs seat with a 90 ms background swap and a 2 px drop of the active tab into the surface; the shelf updates text in place.

### W6 Reading Room — history · desk
- Margin notes and the desk bloom in with a 4 px rise + opacity (ink settling, 340 ms); closing is the reverse absorption.
- Nothing slides laterally; the reference shelf underline is the only selection change.

### W7 Mosaic — history/artifact tiles · tray
- Docking a tile grows it along its flex track while neighbors reflow (340 ms settle); peek lifts the tile with overshoot.
- Filing a tile: the tile collapses and its tray chip enters from above (same axis) — the chip is the tile's continuation. Reopening reverses.

### W8 Periscope — lens overlays · crystallization
- Overlay form: surfaces scale from 0.6 out of their lens (overshoot settle, origin at the lens); collapse returns into the lens.
- Crystallized form: widths ease like conventional docks, with the stem line tying surface to lens.
- Crossing the 980 px threshold re-renders the current surface into the other form at final state — a property change, not an animated morph, so continuous resize never scrubs an animation.

## Thread-concept storyboards
Each board covers: question prepare/open/advance/back/skip/cancel/submit/history ·
activity phase replacement and final compression · Goal lifecycle (start/pause/
resume/replan/block/recover/complete) · Todo and child-agent state changes ·
message arrival/settle.

### T1 Screenplay
- Arrival: rows rise 6 px and settle (210 ms); user and assistant identical — the script treats voices equally.
- Questions: the form scene enters like any script element; question content replaces inside the stable frame; dots mark answered/skipped; submit collapses the scene to a submitting direction, then the record line.
- Activity: one live bracketed direction rewrites its text in place; scene blocks expand/collapse with anchor preservation; completion condenses to "[ 13 tools used · 1m 34s ]" style directions that reopen.
- Goal: status word and controls swap in the Goal scene block; blocked adds the five-field cause sheet; complete posts the receipt.
- Todos/agents: state words change in place; no rows enter or leave during a turn.

### T2 Courier
- Arrival: FLIP — the sent bubble travels from the composer to its slot (380 ms settle); the reply arrives conventionally, then its tools seam appears.
- Questions: prepare pill rises; morph to card (scale 0.88/0.4 from the pill silhouette, 340 ms); advance swaps content inside the card; submit morphs back to the submitting pill; the trail records answered/skipped segments.
- Activity: the locus pill rewrites summary text and spins its ring only while active; completion removes the pill as the reply's seam appears — the same information, condensed, in the same causal chain.
- Goal/todos/agents: the manifest strip updates counts and rows in place; blocked shows inline; recovery clears it.

### T3 Ledgerline
- Arrival: entries unfurl from their rule (scaleY 0.9→1); the gutter tick lands first.
- Questions: the form ledger opens as a section; the active line expands in place; answers write into the right column; post-answers closes the section into a record entry.
- Activity: postings tick in one by one; the caret blinks on the active line only; reconciliation compresses postings under a double rule in one movement.
- Goal: the goal posting swaps its status text; held postings appear in red beneath; controls live on the posting line.

### T4 Dossier
- Arrival: cards slide up 8 px into the stack.
- Questions: the form file enters like a card; page tabs switch content inside the fixed frame; Review fans the answers as rows; submit stamps ("Stamping and filing…") then resolves.
- Activity: the case file's spine carries the live summary with a breathing dot (active only); tabs switch domains with no footprint change; completion turns the spine calm and files records into the message card.
- Goal: the Goal tab holds status line, controls, blocked sheet, and replan confirmation in the same frame.

### T5 Longhand
- Arrival: the page simply grows; new passages appear whole (no per-word effects).
- Questions: the preparing rule becomes the interview heading; prompts replace inside the interview; setting the answers becomes a closing rule.
- Activity: the live rule's text rewrites; its line breathes (opacity) only while work runs; work paragraphs re-set their prose; completion reduces everything to centered record rules.
- Goal: a sentence with inline italic controls; blocked adds a held sentence; complete writes the receipt line.

### T6 Counterweight
- Arrival: blocks drop 5 px and settle; user counters land right, editorial columns left.
- Questions: the ballot card enters; options are full rows; cast collapses the ballot; abstain marks and can be reconsidered.
- Activity: weights drop into the pan as work appears; bars fill per task state; completion empties the pan (weights fade out upward) into a footnote.
- Goal: the goal weight carries status border and controls; blocked text sits inside the weight.

### T7 Teletype
- Arrival: transmissions feed up with stepped motion; the header rule prints first.
- Questions: FORM INCOMING band with cursor; the boxed form prints; fields swap inside the frame; TRANSMITTING band; resolution clears the box.
- Activity: the single status line rewrites with a hard cut (no easing); opening the panel drops it stepped; rollups number completed lines. The cursor block runs only while receiving.
- Goal: GOAL RUNNING/PAUSED/BLOCKED tokens in the status line; the panel holds controls and the held line.

### T8 Choreograph
- Arrival: cards arc in (translate + slight rotate + overshoot settle) with a ≤120 ms stagger cap.
- Questions: cards deal from the bottom edge with rotation settle; answered cards tuck into the stack chip; fan-out review staggers cards back open; submit collects the hand.
- Activity: the satellite orbits its dashed path only while the turn is active; the orbit frame's summary rewrites in place; on completion the satellite docks into the message as its worked badge — the single most explicit condensation gesture in the set.
- Goal/troupe: dancer discs change fill per status; step bars fill; the goal badge swaps text; blocked shows beneath the badge line.

## Never-list compliance
No motion clips text, steals focus, moves a hovered/pressed target, forces the
transcript to the bottom after the reader scrolled away, breaks a scroll anchor,
leaves reduced motion incomplete, pulses without a truthful active state, or is
the sole carrier of an important state (every animated state has a text or
structural twin). Streaming updates coalesce: the work surfaces rewrite one line
in place instead of appending per step, and timers tick once per second.
