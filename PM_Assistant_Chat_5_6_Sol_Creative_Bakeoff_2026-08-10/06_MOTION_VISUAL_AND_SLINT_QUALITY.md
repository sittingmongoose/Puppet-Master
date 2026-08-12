# Motion, Visual Quality, Themes, and Slint

## Authored motion system

Each concept should define its own motion thesis and document it in the concept manifest.

Storyboard at least:

```text
Message send/queue/replay and transcript settle
Long-message collapse/expand with anchor preservation
History peek/pin/full-to-compact/unpin
Question prepare/open/advance/back/skip/cancel/submit/history
Goal start/pause/resume/replan/block/recover/complete
Todo and child-agent state changes
Activity phase replacement and final compression
Diff/artifact creation and handoff to the left workspace
Artifact loading/update/error/switch/close
Model/effort/Normal-Fast submenu changes
Access and BSD state changes
Approval and route warnings
Context selection/Compact Now/branch/rewind/restore
Offline/reconnect/replay/snapshot catch-up
Dock/pop-out remount
```

Motion should communicate continuity, causality, focus, interruption, priority, and completion.

## Reduced motion

Reduced motion is a complete product state, not `animation-duration: 0` applied after the fact.

It must:

- land in the same final states;
- preserve progress and relationship cues with static hierarchy, concise opacity, or immediate replacement;
- retain focus and scroll position;
- never leave clipped/intermediate layouts;
- preserve active BSD meaning without relying on glow;
- keep question progress, activity phase, and branch/restore state understandable.

## Theme system

All eight themes preserve identical functionality and information hierarchy.

Themes may change:

- surface material;
- contrast model;
- shadow/line treatment;
- typography tokens;
- icon treatment;
- selected/active semantic colors;
- background texture or glass treatment.

Do not let one theme become the only polished version. Motion does not need a separate personality for each theme.

## Visual standards

- No emoji.
- SVG interface symbols.
- No colored left-edge accent bars.
- No raw internal enums as prose.
- No uneven/cutoff text.
- No operating-system scrollbar leakage.
- No popup clipped by a parent or hidden behind layers.
- No generic AI aesthetic based on arbitrary nested cards, gradients, and badges.
- Cards and rounded surfaces are permitted when their hierarchy and purpose are clear.
- One truthful active glow is permitted for BSD Auto evaluating; manual On must remain semantically distinct.

## Readability under pressure

At 520 px Chat width, the conversation must remain readable with:

- long prose;
- message metadata;
- one active compact work cluster;
- a questionnaire or warning when relevant;
- history pinned in its fallback form;
- an artifact open in the surrounding workspace.

Do not solve this by reducing the transcript to an unusable strip or by hiding all secondary state with no discoverability.

## Scroll and focus

- Expanding/collapsing preserves anchor.
- Streaming does not steal the bottom position after the user scrolls away.
- Popup opening preserves composer selection when appropriate.
- Closing transient UI restores logical focus.
- Dock/pop-out restores semantic state and an equivalent anchor.
- Pinned history, artifacts, transcript, popup results, and details have clear independent scroll ownership.

## Slint 1.17.1 portability

The HTML concept may be expressive, but the eventual architecture must map cleanly to Slint.

Avoid depending on:

- arbitrary browser DOM measurement as semantic state;
- essential CSS filters or unbounded blur stacks;
- browser-only physics libraries;
- deeply nested uncontrolled scroll views;
- layout that requires text clipping;
- heavy always-live transcript/history/tool trees;
- motion that assumes every item is instantiated.

Use data-backed, virtualizable or segmented models for long thread history, transcript slices, search results, tool/activity records, and artifacts.

Streaming UI updates should coalesce; do not relayout for every token or progress byte. Durable events may remain granular behind the projection.

## Performance quality

The concept should remain responsive with:

- 18+ thread shells;
- 400-message history;
- selected detailed thread;
- pinned summary history;
- artifact workspace;
- active Goal and activity;
- ongoing streaming;
- poor-network reconnect state.

Do not keep full-detail subscriptions alive for every thread merely because history is pinned.
