# Four Video Inspiration Guide

The four recordings are included under `reference/videos/`. Contact sheets and selected frames are provided for agents that cannot play video.

They are **motion and interaction references**, not visual templates.

## Video 1 — Message arrival and transcript continuity

**Source:** `01_message_arrival_spatial_continuity.mov`  
**Duration:** about 3.94 s  
**Frame:** 460 × 640

Observed sequence:

- A compact dark chat is already populated.
- A new right-aligned user bubble becomes visible near the lower boundary.
- The bubble moves into a stable transcript position rather than appearing as an unrelated cut.
- The surrounding thread yields/repositions to make room.
- A second user message repeats the relationship.

Useful principle:

> Preserve spatial lineage between composing/sending and the canonical message's final place in the thread.

Possible questions for the designer:

- How does a sent message leave the composer and become durable history?
- How does active-turn redirect or queued-offline sending change that path?
- Can the interface show movement without disorienting the user's scroll anchor?

Do not copy the bubble shape, color, timing, or product chrome.

## Video 2 — Stable paged questionnaire and answer review

**Source:** `02_stable_paged_questionnaire.mov`  
**Duration:** about 19.85 s  
**Frame:** 308 × 640

Observed sequence:

- A stable questionnaire surface shows a title, progress, navigation, choices, freeform option, Skip, and forward action.
- Hover/selection feedback is subtle but clear.
- Question content replaces inside a stable outer footprint.
- Progress advances and the user can move backward and forward.
- Earlier answers remain selected.
- Final completion is gated until valid.

Useful principles:

- preserve answer state;
- support review and reversal;
- keep navigation predictable;
- replace inner content without uncontrolled page movement;
- keep the transcript relationship stable.

This recording is especially useful for the persistent queue, previous/next, Skip versus Cancel, and revisit-before-submit behavior.

## Video 3 — Evolving compact activity and retrospective expansion

**Source:** `03_compact_execution_activity.mov`  
**Duration:** about 36.44 s  
**Frame:** 640 × 508

Observed sequence:

1. One active region begins with a short Thinking state.
2. The same region becomes file exploration; file rows and counts update in place.
3. It becomes a design/import operation.
4. It becomes edits, with changed files and additions/deletions.
5. It becomes asset generation and update completion.
6. A later thought/edit sequence occupies the same active location.
7. The full execution condenses into a compact `tools used` history index.
8. Ordinary assistant prose appears separately.
9. A generated artifact appears as its own handoff surface.
10. The user can reopen individual completed groups such as edits, exploration, or thought summary.

Useful principle:

> One live execution locus can evolve through phases and later collapse into a durable, selectively reopenable history, keeping conversation and artifact distinct.

Do not treat this as an instruction to use one accordion or one card in every concept.

## Video 4 — Preparation pill, morphing questionnaire, and submission

**Source:** `04_questionnaire_morph_prepare_submit.mov`  
**Duration:** about 8.14 s  
**Frame:** 500 × 640

Observed sequence:

- A compact `Preparing questions…` status pill appears above the composer.
- The pill expands/morphs into a focused questionnaire card.
- Three questions advance through the same spatial region.
- Selection feedback and progress remain clear.
- Submit transforms the card back into a compact `Submitting answers…` state.
- The compact status then resolves, leaving the composer stable.

Useful principles:

- preparation, interaction, and submission are one causal lifecycle;
- the component can change scale and role without feeling teleported;
- composer position and surrounding layout remain calm;
- transient system work can become focused user input, then recede.

## How to use all four together

The videos show complementary ideas:

```text
Message movement -> spatial authorship
Stable questionnaire -> durable review state
Morphing questionnaire -> lifecycle continuity
Compact activity -> complexity compression and retrospective evidence
```

The eight concepts should not all select the same lesson or produce one shared renderer. Let different concepts interpret the principles differently.

## What the videos do not define

They do not decide:

- Puppet Master visual style;
- thread-history placement;
- Goal/Todo/subagent/Crew composition;
- blocked/paused/offline behavior;
- minimum-width behavior;
- dock/pop-out behavior;
- reduced motion;
- provider selectors, BSD, context, artifacts, or cross-thread operations;
- whether multiple groups can be expanded simultaneously.

Those remain governed by the packet or open to the creative director.
