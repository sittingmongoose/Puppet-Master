# Theme, Motion, Responsive Behavior, and Slint Portability

## Puppet Master visual language

All seven concepts must feel like Puppet Master, not seven unrelated novelty applications. Use current shell, typography, icon, menu, scrollbar, status, spacing, and theme conventions while preserving genuine layout differences.

Support:

```text
Friendly Dark / Friendly Light
Glass Dark / Glass Light
Retro Dark / Retro Light
Basic Dark / Basic Light
Reduced motion
```

The three layout-only references must lose their literal steampunk, terminal, parchment, paper, binder, fantasy, CRT, and office-supply styling.

Popup menus use the current Puppet Master Model/Mode or Context Lens selector family, including collision handling, layering, submenus, and open/close behavior. Scrollable Settings surfaces use the Puppet Master custom scrollbar.

## Motion

Motion explains location and hierarchy:

- Home destination expands or transfers into the domain header;
- moving deeper uses one consistent direction;
- Back reverses the spatial transition;
- resource selection reveals or transfers into its detail sheet;
- exact search highlight originates from the landing location;
- focus and scroll position restore on return;
- narrow panes push rather than overlap.

No continuous decorative animation, loader theatre, flashing locator, or full-page blur that destroys spatial continuity. Hidden/off-screen surfaces stop decorative animation. Reduced motion preserves every state and control.

## Responsive widths

Test every concept in every theme at:

```text
760 squeezed stress
900 required narrow desktop
1280 standard
1700 wide
2200 very wide
2500 ultrawide
```

At narrow widths:

- no shell rail overlays content;
- no crushed three-column manager;
- use one-pane or two-pane push navigation;
- search dropdown remains within viewport;
- Back names the location;
- selected items and scroll position persist;
- labels, values, buttons, tabs, tooltips, menus, and diagnostics remain reachable.

At wide widths, do not stretch text lines into unreadable measures or create empty deserts. Use bounded content regions, additional useful panes, or balanced whitespace.

## Slint 1.17.1 portability

Concepts are HTML prototypes but must map plausibly to Slint 1.17.1:

- stable model IDs;
- list virtualization;
- narrow incremental updates;
- no dependence on CSS/DOM-only magic for core behavior;
- explicit state machines for routes, menus, drawers, and transitions;
- reusable components without one monolithic renderer;
- GPU-friendly effects and bounded blur/shadow use;
- no accessibility expansion beyond existing product scope; preserve basic keyboard/focus and reduced-motion behavior.
