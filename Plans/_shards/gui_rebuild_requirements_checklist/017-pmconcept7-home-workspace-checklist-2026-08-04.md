# Shard 017: PMConcept7 Home Workspace checklist — 2026-08-04

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L1914-L1974

Source SHA256: `148a9bb306457e0dfe08a395ad2d980caeecc3f4586b57a7e216ecfa062678e1`

---

## PMConcept7 Home Workspace checklist — 2026-08-04

The GUI rebuild is not Home-complete until the evidence set verifies:

- four stable editor panels with Panel 1/2 open defaults, Panel 3/4 closed defaults,
  panel menus, close/reopen identity, Browser access in every panel, and File
  Manager `Open in Panel` submenu targets 1 through 4;
- one 28 by 28 Home more-options button immediately left of Theme whose compact
  popup contains exactly Open Panel, Open Browser in Panel, divider, Collapse
  Bottom Terminal, and Reset Layout (amended 2026-08-13: reset is dual-surface —
  the top-bar row and the Settings Startup & Recovery row both dispatch
  `cmd.workspace_layout.reset`, and the demo's post-reset reload stays off the
  command bus);
- Dashboard, Chat, and terminal-section movement through `home_main`, all four
  in-app edge docks, and web in-canvas floating, with independent editor floating
  panels and native Slint multi-window disclosure; floating is explicit-only
  (Pop Out rows on editor panels, Chat, and Dashboard, or the keyboard float key)
  — dragging past the window edge is invalid_target, the chat pop-out floats
  in-canvas with no scrim and never a second chat, and boot demotes persisted
  floating surfaces to `last_docked_host` with a `storage.boot_demote_floating`
  receipt;
- four terminal sections, four visible panes per active section, workgroup movement,
  empty-section behavior, and rejection at the section cap;
- model-first Pointer Events movement/resize with U10 cues, cancellation-safe
  restoration, reduced motion, shared resizer glow/recovery, four-edge scroll
  dissolve, and exactly one command/persist at semantic commit;
- direct-manipulation movement from one top-left corner triangle grip per eligible
  surface (28 by 28 folded-corner triangle, clip-path hit-test with the empty half
  falling through, in-glyph focus ring, z-order above surface chrome and below
  resizers), with live neighbour reflow and a change-gated in-flow placeholder that
  carries the pickup-time footprint at the correct flex order, no
  target-picker rail, keyboard pick-up/move/drop on the same handle announced through
  a polite live region, the per-surface Move or dock menu rows retired, and host
  caps (left/right 3, top/bottom 2, floating 4, home_main uncapped) refusing with
  an announced host_full disposition while normalization spills to home_main;
- resize endpoints on the boundary the gesture moves, proven by changed rendered
  geometry rather than by a dispatch count; adjacent-pair pixel transfer (+N/-N
  exactly, non-adjacent surfaces untouched, no settle flash), fair-share minimum
  degradation so every boundary stays reachable, a floating bottom-right corner
  handle driving both axes, and the no-dead-space invariant re-summing visible
  home_main bases to the host width so degenerate persisted layouts self-heal;
- a bottom-terminal collapse chevron that both collapses and expands, staying visible
  and hit-testable on the collapsed strip;
- Open in Panel rendering a real buffer and tab in all four editor panels;
- the width-aware overflow chip present in every open editor panel styled in the
  app portal-menu family, editor tab
  drag-reorder that persists on all four panes and survives a re-render, and the
  contact-aware active-tab silhouette
  with independent left/right contact corners, masked shoulder cutouts, and the
  translucent frosted rail that ghosts scrolled code beneath the strip;
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
