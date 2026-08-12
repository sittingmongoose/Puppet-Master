# 5. Video Reference — Questions and Compact Agent Activity

Study the two supplied recordings. Ignore social/video-player overlays such as Follow, comments, reposts, reactions, playback controls, progress bars, and recording chrome. They are not part of the desired UI.

Do **not** copy either product one-to-one. Extract their motion, hierarchy, progressive-disclosure, and information-density principles, then reinterpret them in each Puppet Master concept.

The contact sheets under `reference/` are optional visual aids. This written description is authoritative for agents without video vision.

---

## Recording A — morphing questionnaire

File: `ScreenRecording_07-30-2026 18-50-28_1 (1).mov`  
Approximate duration: 8.1 seconds.

### Initial state, roughly 0.0–0.7 seconds

A normal rounded composer remains visible near the bottom of a light interface. Its placeholder reads `Ask anything...`. Nothing takes over the full screen. The underlying conversation remains perceptually present.

### Preparing state, roughly 0.7–1.7 seconds

The surrounding UI dims and softens slightly. A slim rounded white status surface appears immediately above the composer. It reads:

```text
Preparing questions...
```

A compact four-dot activity indicator sits at the right edge. The surface fades/rises into place and settles gently; it does not snap in as a hard modal. The composer remains visible below.

### Morph into Question 1, roughly 1.7–2.2 seconds

The same status surface expands downward and outward into a larger rounded card. It does not disappear and get replaced by a separate object. The card remains spatially anchored above the composer while its bounds animate.

The first title is:

```text
How do you build UI these days?
```

The card contains four radio-style answer rows, a small close control in the upper-right, `Question 1 of 3` at the lower-left, and `Skip` at the lower-right. The answer area has clean spacing and a bounded internal scroll affordance. The composer is pushed downward cleanly rather than covered.

### Select Question 1, roughly 2.2–3.0 seconds

The pointer chooses an answer. Three visual events happen together:

1. the small radio indicator fills;
2. the full answer row receives a pale blue selected background;
3. a brief circular pointer/ripple response expands and fades.

The response is immediate but restrained. The card does not shake or pulse continuously.

### Transition to Question 2, roughly 3.0–4.1 seconds

The outer card remains stable while its contents transition. The old title/options drift and fade upward; the next question rises/fades from below. The card height subtly adjusts to the shorter option list without a hard jump.

The second title is:

```text
Where do new ideas take shape first?
```

The progress changes to `Question 2 of 3`. The user selects one of three options with the same row highlight, radio fill, and brief selection feedback.

### Transition to Question 3, roughly 4.1–5.9 seconds

The same stable-shell transition reveals:

```text
What do you still not trust AI with?
```

The progress changes to `Question 3 of 3`. This card has four options and a small internal scrollbar. The lower actions remain visible despite the taller content. Selecting an answer changes the lower-right action from `Skip` to a blue-accented `Submit` button.

### Submit and compress, roughly 5.9–6.8 seconds

The pointer presses Submit. The selected card content fades away while the card compresses vertically back toward the original pill footprint. The shell retains visual continuity; it does not vanish and leave a blank jump in the layout.

### Submitting state, roughly 6.8–8.1 seconds

The compact status surface now reads:

```text
Submitting answers...
```

The four-dot activity indicator continues at the right. The composer remains below. The final state is compact and calm rather than leaving a large completed questionnaire open.

### Interaction principles to learn from

- One surface progresses through preparing, asking, advancing, and submitting.
- Spatial continuity explains where the questionnaire came from and where it went.
- The composer and thread remain present and recoverable.
- Only one question is cognitively active at a time.
- Progress, Skip, Cancel/close, selected state, and Submit remain unmistakable.
- Different option counts change the card height without destabilizing the page.
- Motion uses overlapping fade, short vertical travel, bounds interpolation, and a controlled settle.
- Internal content may scroll while primary actions stay reachable.

### Puppet Master question-system requirement

Use a shared question-state schema/controller if helpful, but **do not reuse one visual question renderer across all concepts**. Each concept must design a question flow that belongs to its own layout and motion language.

A concept-specific renderer must define:

```text
where the question originates
how it enters and exits
how it coexists with the composer and draft
how progress is shown
how answers are selected
how Skip differs from Cancel
how validation errors appear
how the final submission state resolves
how an answered/cancelled receipt remains in history
```

The demo harness must be able to trigger the question flow repeatedly. That trigger is not a permanent production toolbar button.

Across the concept set, explore materially different structures such as composer-anchored morphs, inline conversational questions, sidecar inspectors, stepper surfaces, stacked cards, or other original approaches. Changing only colors around one shared card does not count.

---

## Recording B — compact thinking, tools, edits, and artifacts

File: `ScreenRecording_07-29-2026 19-24-09_1(1).mov`  
Approximate duration: 36.4 seconds.

The recording shows one assistant turn whose execution activity occupies a **single evolving inline region**. Related actions are grouped by intent. One group is expanded at a time; completed groups become a compact navigable index.

### User request remains visible, roughly 0–1 second

A user request card remains at the top of the visible response area. It asks the agent to rebuild a billing settings screen using an existing Figma design and the product's component system. The activity appears directly below this request.

### First status/reasoning summary, roughly 1–5 seconds

A small circular phase icon and label appear:

```text
Thinking for 4s
```

A concise user-visible reasoning/status summary grows beneath the header. It explains that the screen already exists, this is a rewrite rather than a new route, and the agent will inspect relevant files and design-system components before changing anything.

This is not a separate giant card. It is a compact header with optional detail in one response region.

### Exploration group, roughly 5–8.5 seconds

The thinking detail contracts and the next group becomes active:

```text
Exploring 5 files
```

File-read rows append below it. The count updates in place from five to six and then seven as additional files and component documentation are inspected. The UI does not emit a new card for every read.

Small phase icons accumulate in a restrained horizontal index beside the active label. The active phase has the strongest ring/accent; completed phases remain compact and clickable.

### Figma import group, roughly 8.5–12 seconds

The active group changes to an import phase:

```text
Importing from Figma — Billing / Header
```

It then updates to approximately `2 steps`. Concise child rows report processing the design source and reading a Figma component. The prior exploration group remains represented by its compact icon.

### Live edit group, roughly 12–16 seconds

The active label begins as:

```text
Making 1 edit
```

As work progresses, the same header updates to:

```text
Making 1 create, 1 edit
Making 1 create, 2 edits
```

File rows appear beneath it. Additions and deletions are aligned at the right in green and red. The count and details evolve inside one stable group rather than stacking several edit cards.

### Asset and update groups, roughly 16–19 seconds

The activity switches to a generation phase such as:

```text
Generating assets — 2 images
```

A concise detail says two images were generated for illustrations. A brief `Updated screens` phase follows. Each new phase adds a small icon to the horizontal activity index while only the current phase receives full detail.

### Second status/reasoning summary and final edit, roughly 19–22 seconds

A second `Thinking for 2s` group expands with a short rationale: the invoice table still uses the old zebra-striping treatment, so the agent will replace it with the design-system table.

The next group reports one final file edit with aligned addition/deletion counts.

### Completion compression, roughly 22–26 seconds

The live activity collapses into a compact completed header containing the accumulated phase icons, a label similar to:

```text
13 tools used
```

and a disclosure affordance.

The actual final answer appears beneath in normal prose, followed by a small verification line indicating that the updated billing screen renders correctly. Execution detail remains available but no longer dominates the transcript.

### Artifact card, roughly 26–29 seconds

A compact artifact card labeled `Billing Settings` appears beneath the result. It begins in a compiling/loading state and then settles into a completed state with a subtle green outline. A version/source line and overflow action remain visible. A small elapsed-time line appears below, approximately `Worked for 1m 34s`.

### Reopening completed groups, roughly 29–36 seconds

The pointer activates one of the small phase icons. The previously collapsed edit group expands inline above the final result, showing the created/edited files and diff counts.

The pointer then selects the exploration icon. The seven-file list replaces the edit detail. The final answer, verification line, and artifact remain below. Only the selected activity family is expanded; the others remain compact.

The expansion pushes content down in document flow rather than floating over the answer or composer.

### Interaction principles to learn from

- Current activity is detailed; prior activity becomes a compact index.
- Counts and labels morph/update in place.
- Related operations are grouped by intent rather than rendered as a wall of raw calls.
- One completed group can be reopened without expanding everything.
- Chronology remains understandable after compression.
- The user-facing answer, verification, artifact, and elapsed time remain visually distinct from execution detail.
- Artifact creation is visibly connected to the work that produced it.
- Stable layout anchors and controlled height transitions prevent scroll chaos.

### Puppet Master activity requirement

Apply these principles to:

```text
Goal phases
Todo progress
subagent waves and individual children
search/read/fetch/browser/test groups
status/reasoning summaries
diffs and file changes
verification and artifacts
```

Do not copy the exact icons, wording, Aurora/Figma branding, colors, or layout. Do not expose private chain-of-thought. Use concise user-visible status/rationale summaries and exact tool evidence where appropriate.

The compact completed state must still let the user reopen Goal, Todo, child-agent, tool, diff, test, and artifact details independently.
