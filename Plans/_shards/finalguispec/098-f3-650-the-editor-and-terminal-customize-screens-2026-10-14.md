# Shard 098: F3-650 — The editor and terminal Customize screens (2026-10-14)

Source: `Plans/FinalGUISpec.md`

Source lines: L46902-L46979

Source SHA256: `f05fb13f82babed54c090bb87736b01c7cbcf535d6c8a49773e2d7d25b8faf98`

---

## F3-650 — The editor and terminal Customize screens (2026-10-14)

```yaml
plan_unit_id: F3-650
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The editor and terminal share one Customize presentation and the code scheme catalog of F3-642. Their More
  menu's Appearance... and Settings > Editor & Terminal > Editor look or Terminal look > Open Customize reach
  the corresponding screen. The menu defaults to This editor or This terminal and remembers the scope last
  chosen for that tab; Settings opens All editors or All terminals for that visit only and never overwrites the
  tab's remembered scope. All means the open Project, disclosed as in this project; a tab's own overrides remain
  above it and the screen explains when they mask an All change. SSYS-002 forbids a persistent write without a
  Project. The screen has a live preview rendered by the real editor or terminal renderer, a change meter, quick
  sets, Try it actions and grouped controls. It sits beside the real surface without covering it and frames the
  live target. One rule decides docking on both screens: the preview follows scrolling only when the real editor
  or terminal is not visible beside the screen, including narrow or maximized layouts. Settings entry routes to
  Home beside the real target; origin in Settings alone does not force docking. Opening the screen never starts
  a shell, runs a command or changes a file. Without a suitable target the All scope remains useful through the
  isolated renderer preview, and This is unavailable with a reason. Close and Escape undo uncommitted previews,
  keep committed choices and return focus to the invoking control. Quick sets change existing fields through the
  selected scope's writer, as one change: The look's own clears that scope's overrides; Calm removes moving
  effects; Easy reading chooses Atkinson Hyperlegible Mono, 7:1, comfortable line spacing and no ligatures; Old
  monitor is the terminal set (custom scanlines, glow, Full CRT and phosphor trail); Show structure is the
  editor set (guides, bracket colors and whitespace). Try it moves the sample cursor/caret, rings the sample
  bell or types and visits a sample problem; Step back restores the sample, never the real buffer or session.
  The editor groups are Colors, Text, Caret, Lines & guides, Motion & effects and Behavior. Every one-of-several
  selector in either screen and its Settings rows keeps its choices on one line. First stack neighbouring
  fields; then shorten visible choices while keeping their full accessible names; if still too narrow, use a
  one-choice-per-line list with instant highlight placement. A sliding highlight never spans wrapped lines.
  Scope, search, scrolling, sample trials and hover are view-local; committed fields and reset/quick sets use
  UCC-204's writers. Schemes and fonts have truthful names, Light/Dark hints and supported capabilities. Dense
  Glass controls use F3-652's readable menu material.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Both entry points use the same screen, model and scope writers; Settings entry never changes a tab's remembered
  scope.
- At narrow, maximized and beside-target widths the shared visibility rule alone decides whether the preview docks.
- Every selector fits without clipped words or a highlight spanning lines in every look and both motion modes.
- Sample trials, hover, close and Escape never modify a real file or send terminal input.
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
- /mnt/Cursor/share/puppet-master/2026-10-13-terminal-customizer/PROPOSAL-canon-followups.md, SHA-256 1e0739b70d9b0f8c55f8df4747d80ff099baae6d40caf6ae784dc13864d580b0
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-642
- Plans/Settings_System.md#SSYS-002
- Plans/UI_Command_Catalog.md#UCC-204
preserved_exact_tokens:
- This editor
- All editors
- This terminal
- All terminals
- Open Customize
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-642, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/UI_Command_Catalog.md#UCC-204
