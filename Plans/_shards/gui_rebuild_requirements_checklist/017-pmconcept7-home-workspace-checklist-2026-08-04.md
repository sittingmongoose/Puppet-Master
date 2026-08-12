# Shard 017: PMConcept7 Home Workspace checklist — 2026-08-04

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L1914-L1954

Source SHA256: `706621f63d64d09122cea29208ce19c805002d89aee23ebc15df994033a763ca`

---

## PMConcept7 Home Workspace checklist — 2026-08-04

The GUI rebuild is not Home-complete until the evidence set verifies:

- four stable editor panels with Panel 1/2 open defaults, Panel 3/4 closed defaults,
  panel menus, close/reopen identity, Browser access in every panel, and File
  Manager `Open in Panel` submenu targets 1 through 4;
- one 28 by 28 Home more-options button immediately left of Theme whose compact
  popup contains exactly Open Panel, Open Browser in Panel, divider, and Collapse
  Bottom Terminal, with Reset Home Layout only under Startup & Recovery;
- Dashboard, Chat, and terminal-section movement through `home_main`, all four
  in-app edge docks, and web in-canvas floating, with independent editor floating
  panels and native Slint multi-window disclosure;
- four terminal sections, four visible panes per active section, workgroup movement,
  empty-section behavior, and rejection at the section cap;
- model-first Pointer Events movement/resize with U10 cues, cancellation-safe
  restoration, reduced motion, shared resizer glow/recovery, four-edge scroll
  dissolve, and exactly one command/persist at semantic commit;
- direct-manipulation movement from one top-left grab handle per eligible surface,
  with live neighbour reflow and an in-flow placeholder during the gesture, no
  target-picker rail, keyboard pick-up/move/drop on the same handle announced through
  a polite live region, and the per-surface Move or dock menu rows retired;
- resize endpoints on the boundary the gesture moves, proven by changed rendered
  geometry rather than by a dispatch count;
- a bottom-terminal collapse chevron that both collapses and expands, staying visible
  and hit-testable on the collapsed strip;
- Open in Panel rendering a real buffer and tab in all four editor panels;
- the width-aware overflow chip present in every open editor panel, editor tab
  drag-reorder that survives a re-render, and the contact-aware active-tab silhouette
  with independent left/right contact corners;
- dashboard widget reorder and grid-snap resize on the shared direct-manipulation
  vocabulary, still persisted under the widget layout contract;
- project/workspace persistence, corruption/migration/off-screen recovery, all eight
  themes, Light/Dark/Auto, inline SVG only, no emoji, and zero page/console errors.
- one source-hashed zero-omission control census, byte-identical dual pipeline
  builds, and the exact 72-case fresh-context visual matrix plus direct headful
  keyboard/drag/blur/glow/scroll/popup pass.

Each row requires a `test_id`, validator or harness command, evidence reference,
owner-document reference, and status. An unchecked or screenshot-only row is not
PASS evidence.
