# Demo Fixtures, Motion, and Functional Test Gate

## Required realistic fixture

Use at least:

```text
18 thread history entries
A long provider/settings redesign conversation
8 Todos
3 subagents on different routes
2 question flows
Goal start/pause/resume/replan/blocked/complete
Reads/search/web/browser/test/edit/verify activity
Port 3000 collision and safe alternative
Provider/cache/model warning
Unsupported attachment flow
Cross-project grant
3-file diff
4 artifacts
Final verification and elapsed time
BSD Auto and On
Offline queued message and reconnect
Thread request/spawn/branch
```

## Motion

Design motion for:

```text
Message/tool/activity arrival
Question prepare/open/transition/submit/close
Compact work expand/collapse
Goal phase transition
Subagent state
Diff/artifact handoff
Pinned history pin/unpin/compact fallback
Artifact open/switch/close
Model selector submenus
Access/BSD state
Route warning
Offline/reconnect/catch-up
Branch/rewind
```

Rules:

- no text clipping during animation;
- no composer jump;
- no focus theft;
- no indefinite glow except a truthful active operation;
- reduced motion preserves meaning;
- transcript scrolling remains stable;
- bottom/top fade/blur effects may be used sparingly and portably.

## Layout matrix

Test:

```text
Themes: 8
Reduced motion
Widths: minimum, normal, wider, wide
History: closed, open, pinned, compact pinned
Artifact: closed, loading, open
Left side panel: closed/open/narrow/wide
Chat: docked, pop-out
```

The original design work required 32 theme/width variants; preserve or exceed that coverage.

## Automated probes

- Pin/unpin persists and does not obscure/compress below threshold.
- History and artifact coexist.
- Every question flow can answer, skip, cancel, submit, and reset.
- Goal controls work.
- Todos/subagents/activity/diff expand and collapse.
- Model/effort/Fast selection persists.
- Access/BSD scopes persist correctly.
- Compact Now and Context Lens work.
- Thread request/spawn/branch/rewind work.
- Attachment routing choices work.
- Offline send queues and replays once.
- No duplicate sends after reconnect.
- Focus and keyboard paths work.
- No stuck resizers, blocking overlays, scroll lock, offscreen popups, clipped text, fake completion, or unresolved loading.
- ConceptHub validation passes.

## Hard failure

A concept fails when a visible control is decorative, a required state cannot be reached, all concepts reuse the same question/activity solution, or the layout works only in one showcase width/theme.
