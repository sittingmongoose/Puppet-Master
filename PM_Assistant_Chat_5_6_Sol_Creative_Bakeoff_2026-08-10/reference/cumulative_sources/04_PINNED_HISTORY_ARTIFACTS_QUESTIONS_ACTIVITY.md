# Pinned History, Artifact Workspace, Questions, and Activity

## Pinned chat history

Pinning must be real geometry and persistent state.

A pinned history surface:

- remains outside the transcript and composer;
- uses spare surrounding workspace before taking width from Chat;
- preserves a declared minimum readable Chat width;
- falls back to a compact pinned rail or concept-specific form when space is insufficient;
- persists through thread switching, resizing, docking, and pop-out;
- remains usable while an artifact is open;
- never becomes a permanent overlay that obscures messages.

Pinned rows should use lightweight thread-shell/summary subscriptions, not full detail/tool streams.

## Artifact workspace

Artifacts open to the **left of Chat**, outside the transcript.

Demonstrate:

```text
Code/file
Multi-file diff
Image/test screenshot
Report/document
Loading
Ready
Updated
Error
Retry
Switch
Close
```

History, artifact, Chat, and composer must remain usable together.

Opening an artifact does not automatically inject it into model context. Context Lens shows only explicitly admitted content.

## Question systems

Each concept needs its own visible solution for:

```text
Placement
Hierarchy
Entry/exit choreography
Question transition
Progress
Selection
Submission
Cancel
Skip one question
Keyboard/pointer interaction
Composer relationship
```

Shared question state/data is allowed. One cloned questionnaire renderer reused across concepts is not.

The demo controller may trigger question flows; do not add a permanent production question button.

## Video principles

From the questionnaire reference:

- a compact preparation state can expand into a focused question card;
- content changes without uncontrolled page jumps;
- selected rows receive clear feedback;
- internal scrolling stays bounded;
- submit state resolves into a compact in-progress/result treatment.

From the compact-activity reference:

- thought/work summaries evolve in place;
- file counts and grouped tool activity remain compact;
- completed groups collapse to a durable index;
- individual groups can be reopened;
- generated artifacts have a clear handoff card.

Take substantial inspiration from pacing, staging, and compression. Do not copy either visual system one-to-one.

## Activity and diff

Show:

```text
Thinking/reasoning summary
Files inspected
Searches/fetches
Tool use
Edits
Additions/deletions
Tests
Verification
Artifacts
Elapsed time
```

The compact state must remain understandable without reading raw logs.
