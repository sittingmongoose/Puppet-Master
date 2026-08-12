# 4. Pinned History, Left Artifact Workspace, and Compact Work Surfaces

## Pinned chat history

Every concept must implement real pin/unpin behavior. Required states:

```text
closed
transient peek
pinned compact
pinned full, when space permits
```

A transient peek may temporarily overlay. A **pinned** history surface may not cover the transcript, composer, message actions, or scrollbars.

Pinned history must be a sibling region in the surrounding workspace. It must preserve the concept's readable Chat-width floor. When the host cannot fit full history and readable Chat together, automatically reduce history to a compact rail or another concept-specific low-width form; do not squeeze Chat into an unusable sliver.

Required behavior:

- pin and unpin actually change layout and state;
- independent history and transcript scrolling;
- current thread remains visible and selected;
- switching threads preserves the pin state and transcript scroll rules;
- pinning does not move the composer offscreen or lose the message scroll anchor;
- resizers, when used, have sane limits and cannot get stuck;
- history coexists with an open artifact workspace at supported widths;
- no concept may solve pinning by merely leaving a permanent overlay open.

Share the state contract, but do not force every concept to use the same dock, width, row style, or animation.

## Artifact workspace to the left of Chat

Clicking an artifact reference must be able to open a sibling workspace **to the left of Chat**, outside the transcript. Demonstrate at least:

```text
code/file artifact
diff artifact
image or test screenshot
plan/report or structured text artifact
```

Required behavior:

- visible loading, ready, error, switch, and close states;
- Chat remains visible and interactive;
- opening an artifact preserves transcript scroll and composer draft;
- artifact links may originate from messages, tool activity, diffs, Goals, or final results;
- multiple demo artifacts can be switched without reopening the whole surface;
- at narrow widths, use a deliberate compact/sibling fallback rather than covering the transcript with an accidental overlay;
- history and artifacts must have an intentional coexistence rule.

The concepts may use tabs, a stack, a canvas, a document inspector, or another original approach. Do not copy one artifact shell into every concept.

## Compact Goal, Todo, subagent, and diff presentation

These systems should be high-signal when collapsed and detailed only on demand.

A collapsed representation should summarize the current work in a compact band, capsule, strip, inline index, or other concept-specific form. It should be able to communicate, when relevant:

```text
Goal phase/progress
Todo complete/total
subagents active/queued/blocked
diff file count and additions/deletions
current tool/activity phase
```

Expansion may be inline, sidecar, popover, nested disclosure, or another approach, but it must not obscure the composer or create an enormous always-open card.

Across the existing concept set, explore **materially different** combinations. Do not reuse one shared Goal/Todo/subagent/diff renderer everywhere. Shared data and event state are allowed; presentation and expansion behavior must retain each concept's identity.

Required interactions:

- expand and collapse;
- open a specific Todo, child agent, diff, or Goal phase;
- move from the compact summary to the left artifact workspace where appropriate;
- update counts in place as work progresses;
- preserve chronology and current status;
- show queued, failed, paused, blocked, and completed states without expanding everything at once.
