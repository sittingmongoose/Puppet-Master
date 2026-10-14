# Shard 099: F3-651 — Editor appearance, token colors, caret and indentation (2026-10-14)

Source: `Plans/FinalGUISpec.md`

Source lines: L46967-L47052

Source SHA256: `ad093afce0ca7418862e8c4d9bfd4fbb8d1081f379037deb47635caf0ea41254`

---

## F3-651 — Editor appearance, token colors, caret and indentation (2026-10-14)

```yaml
plan_unit_id: F3-651
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Each editor appearance field resolves from this tab's appearance override, then the open Project's
  code.editing rows, then Follow look. All editors and Settings write the same rows (SSYS-052); This editor
  writes through cmd.editor.appearance.set. SP-333 owns storage. The 17 token kinds are kw, fn, ty, var, prop,
  str, num, esc, com, op, pun, mac, tag, attr, head, link and code. Token Colors maps <scheme key>/<kind> to
  #rrggbb; a catalog scheme uses its resolved id after light/dark pairing and Follow look uses
  look:<look>-<mode>. A tab's map overlays the Project map token by token; clearing a tab entry reveals the
  Project entry and clearing that entry reveals the scheme. Colors > Token colours offers the scheme's kinds,
  hue, saturation, lightness and hex, with labelled numeric/text equivalents to color dragging. The stored
  requested color remains available for editing; drawing adjusts lightness with hue retained to the selected
  4.5:1 or 7:1 floor and explains any adjustment. The floor also covers Follow look and dimmed inactive editors.
  Scheme hover after 160 ms rest, or keyboard selection, previews without transition on the sample and real
  editor; leaving or Escape restores the committed scheme. A commit uses Basic fade, Friendly bloom from the
  tile, Glass glide, Retro steps or NieR wipe, with continuous readable code even on slow frames. Follow look
  caret voices are: Basic line, on/off blink, instant movement, no trail or smooth scroll; Friendly line, smooth
  blink, gliding movement, soft trail and smooth scroll; Glass line, smooth blink, glide, glow trail and smooth
  scroll; Retro reverse-video block, stepped blink, instant movement, phosphor trail and no smooth scroll; NieR
  ink line, blink, instant movement with eight-step motion, Trace only with its Scan sweep part and no smooth
  scroll. Snappy movement lasts 80 ms and Gliding 150 ms; typing and undo land immediately. A trail marks only a
  non-pointer jump of at least three rows or 24 columns, such as find, Go to line, changes or page navigation,
  and is clipped to the visible area. Typing and clicks make none. Reduced Motion suppresses blink, glide,
  trails, smooth scrolling and line reveal; still guides, scanlines and glow retain their state. Lines Arrive
  When a File Opens continues across resize and redraw instead of restarting or vanishing. Indentation reads
  applicable .editorconfig first, otherwise the file's dominant step of 2, 4 or 8 and its spaces/tabs while
  detection is on; absent a file choice, Tab Size and Indent With supply defaults. Guides, active guide, Tab,
  Shift+Tab, Backspace in leading whitespace and Enter after an opener share that unit. Real tabs remain tabs
  and display to the next tab stop, including pasted tabs; Show Spaces marks tabs with an arrow. Indentation...
  in More names the file's unit and provenance and opens these choices. Wrap Long Lines applies to ordinary
  files and inline diff, never side-by-side diff; the chosen column is bounded by the viewport, breaks prefer a
  space after one third of the width, continuation indent is capped at one third, and vertical movement follows
  visual rows. Problem Highlighting draws the file's Problems entries as severity-filtered wavy underlines with
  minimap marks and a message/source card after Hover Tip Delay. Automatic save uses the chosen pause (500 ms or
  1 s), focus exit or tab hide, never saves untitled or read-only buffers, clears the dirty mark and announces
  saved without a toast.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every one of the 17 kinds can be edited independently for two schemes and both scopes, survives reload and falls
  through token by token when cleared.
- All effective text colors meet the selected floor, including Follow look, comments, selection and inactive dimming.
- Typing and undo never wait for caret motion; Reduced Motion removes every moving caret/reveal effect.
- Spaces, tabs, pasted tabs, .editorconfig and 2/4/8-space files share one indentation rule without converting file
  bytes.
- Wrap, problems and automatic save respect the named exceptions and preserve input/focus.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_campaign
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-639
- Plans/FinalGUISpec.md#F3-650
- Plans/Settings_System.md#SSYS-052
- Plans/storage-plan.md#SP-333
- Plans/UI_Command_Catalog.md#UCC-204
preserved_exact_tokens:
- Token Colors
- 4.5:1
- '7:1'
- cmd.editor.appearance.set
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-639, ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/Settings_System.md#SSYS-052, ContractName:Plans/storage-plan.md#SP-333, ContractName:Plans/UI_Command_Catalog.md#UCC-204
