# GUI, Motion, Theme, Slint, and Tests

## Motion direction

“Film-level” means directed choreography and continuity, not constant movement.

Key transitions:

```text
Home destination → Settings Workspace
Search Home → workspace result
Category change
Subcategory scrollspy
Manager expand/collapse
Provider refresh/health
Search-result focus
Save/reconnect/apply
Import preview/apply/rollback
Sound preview/test
Theme hover preview/apply
```

Rules:

- Establish spatial origin.
- Do not animate text before layout is stable.
- No clipped height animations.
- No uncontrolled scroll jumps.
- No indefinite attention pulse.
- Reduced motion preserves every state and action.
- Long operations use ObservableWork-like truthful phases.

## Slint portability

Design for:

- virtualized or segmented long lists;
- model-backed categories/settings/resources;
- nonblocking UI thread;
- predictable focus order;
- scroll position and scrollspy synchronization;
- accessible roles for navigation, search, regions, lists, and main content;
- modest, portable blur/material effects.

Avoid core dependence on:

- arbitrary DOM measurements;
- heavy filter stacks;
- nested unbounded scroll views;
- browser-only physics;
- clipped text as layout strategy.

## Test matrix

Widths:

```text
900
1280
1700
2200
2500
```

Surrounding shell states:

```text
Activity Bar only
Side panel open
Side panel narrow
Side panel wide
Other main workspace panels visible
```

Themes:

```text
8 themes
Reduced motion
```

Required automated probes:

```text
Search and typo result
Destination open
Deep link
Subcategory jump
Scrollspy
Back/forward
Provider refresh
Account/installation expansion
Import preview/cancel/apply/rollback
Sound upload/preview/test fixtures
Theme preview/apply/fallback
Keyboard focus
No clipped/overlapping text
No pointer-blocking overlay
No stuck resizer
No permanent spinner
Manager lazy hydration
```

## Completion gate

A concept fails if:

- it has dead/nonfunctional controls;
- provider manager is a flat list;
- category controls still read as filters;
- notices remain text-layer-heavy;
- required manager coverage is missing;
- long text clips;
- a theme breaks hierarchy;
- reduced motion loses state;
- the fake shell is removed in Hub preview;
- the concept does not validate through ConceptHub.
