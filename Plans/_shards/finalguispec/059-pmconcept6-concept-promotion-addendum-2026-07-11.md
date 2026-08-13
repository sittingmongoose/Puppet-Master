# Shard 059: PMConcept6 Concept Promotion Addendum - 2026-07-11

Source: `Plans/FinalGUISpec.md`

Source lines: L28360-L28539

Source SHA256: `cb8e793fd3b46d17be00745b05ace785aadc8d791bd0d3261415c532351d2b22`

---

## PMConcept6 Concept Promotion Addendum - 2026-07-11

This addendum promotes user-approved PMConcept6 shell, chat, and editor behaviors into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`; persistence reuses the existing `activity_bar_order:v1` storage contract and no new storage keys are registered. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F3-419 - Activity Bar Reorder, Hide, And More Tray

```yaml
plan_unit_id: F3-419
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Activity bar items support drag-to-reorder along the bar, drag-onto-More-tray to hide, and
  restore from the More tray by click or by dragging a tray row back onto the bar for a
  positioned restore. Persistence reuses the already-registered `activity_bar_order:v1`
  storage contract as one ordered list of activity bar item IDs plus a separator position,
  where items after the separator position are the hidden tray set; no new storage key is
  introduced. Activity-item hotkeys follow the visual order of the bar, so reordering changes
  hotkey targets and hidden items drop out of the hotkey sequence.
gui_related: true
gui_classification_reason: This unit defines visible activity bar reorder, hide, tray, and hotkey behavior.
split_recommended: false
depends_on: [F3-041, F3-071, F3-217]
unblocks: []
acceptance_criteria:
- "Activity bar icons can be drag-reordered, hidden by dragging onto the More tray control, and restored from the tray by click or by drag-back onto the bar."
- "Order and hidden set persist through the existing activity_bar_order:v1 key as an ordered id list with a separator position; no new storage key is registered."
- "Hotkeys resolve against visual order after reorder and skip hidden items."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: activity_bar_reorder_hide_and_more_tray
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:2290"
- "Plans/FinalGUISpec.md:2377"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "activity_bar_order:v1"
- "separator position"
- "More tray"
negative_constraints:
- "Do not register a new storage key for activity bar hidden state; the separator position inside activity_bar_order:v1 encodes the hidden set."
compatibility_only_notes:
- "Slint portability: drag ghosts, drop indicators, and the More tray render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The pre-2026-07-23 default visible set (which included Orchestrator, Run Graph, Planning Wizard, Notifications, Settings, and Usage shortcuts) is retired per the PMConcept7 activity-bar trim; those pages stay reachable via the title-bar page tabs and the alerts affordance is the title-bar notification stack (F3-460). Reorder, hide, tray, persistence, and hotkey mechanics of this unit are unchanged and now operate over the trimmed default set."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-420 - Chat Component Unification And Embedded Chrome Flags

```yaml
plan_unit_id: F3-420
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Assistant Chat ships as one component with per-instance chrome flags for panel, embedded,
  and floating presentation: a single chat template and state source renders the docked chat
  panel, the floating chat window, and wizard-embedded chat instances. Chrome flags toggle the
  header, thread rail, thread search, issues and worktree indicators, persona and model
  selectors, mode strip, panel toggles, and composer affordances per mount; embedded mode is
  chrome-reduced to the message stream, composer, and quick-reply chips with gated send.
  Stream and footer content resolve per thread, and context boxes are
  thread-scoped. The unified component is consumed by wizard embedding and promoted surfaces,
  and the separate `#chatPanel` side panel mount remains canonical.
gui_related: true
gui_classification_reason: This unit defines visible chat component mounts and per-instance chrome presentation.
split_recommended: false
depends_on: [F3-131, F3-357, F3-149]
unblocks: []
acceptance_criteria:
- "Docked panel, floating window, and wizard-embedded chat instances render from one chat component, template, and state source distinguished only by chrome flags."
- "Embedded mode keeps the message stream, composer, quick-reply chips, and gated send while omitting thread rail, thread search, issues and worktree indicators, persona and model selectors, mode strip, and panel toggles."
- "The separate #chatPanel side panel mount remains canonical and is not replaced by embedded instances."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
- "Plans/assistant-chat-design.md"
node_compile_hint:
  mode: chat_component_unification_and_embedded_chrome_flags
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:2092"
- "Plans/assistant-chat-design.md"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "#chatPanel"
- "quick-reply chips"
- "embedded"
- "floating"
negative_constraints:
- "Chat must remain available as the separate side panel; embedded instances must not replace the #chatPanel mount."
compatibility_only_notes:
- "Slint portability: per-instance chrome flags map to conditional widget composition; embedded chat chrome requires no arbitrary-content backdrop blur or SVG filters, color styling is precomputed, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
stale_retired_dispositions:
- "The standalone web-suggestions strip is retired per the 2026-07-16 chat polish promotion; embedded-mode quick-reply chips are a different element and remain canonical."
owner_boundary_notes:
- "Plans/assistant-chat-design.md remains the prose owner for chat behavior taxonomy (message stream, composer, and thread model sections); this unit records the component unification and chrome-flag presentation contract in FinalGUISpec without byte-editing assistant-chat-design.md."
owner_hints:
- "Plans/FinalGUISpec.md"
- "Plans/assistant-chat-design.md"
```

### F3-421 - Editor Tab Close, Pane Close, And Tab Overflow

```yaml
plan_unit_id: F3-421
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Editor tabs support per-tab close controls with editor-model bookkeeping so closing a tab
  updates the open-tab list and activates a neighboring tab. Editor panes support per-pane
  close with sibling expansion, and an editor empty state is shown when no editor panes remain
  visible. When the tab strip overflows its width, a width-aware "+N more" overflow chip
  collects non-active tabs into a picker with per-item close, keeping the active tab visible.
  Non-file tabs, including thread context detail tabs and browser preview tabs, participate in
  the same close and overflow behavior. Amended 2026-08-13 - tab drag-reorder is canonical
  and persists on all four editor panes: pane 1 through the open-tab model, panes 2 through 4
  through strip-owned order lists reasserted by every fitter and mirrored to the Home
  overlay's buffer order via the pm6:ed-tab-order event; a newly opened tab inserts at its
  model index. The +N more chip and its picker render in the shared app portal-menu family
  (portal recipe, sprout-in opening, neutral chip treatment) rather than as a bespoke pill.
gui_related: true
gui_classification_reason: This unit defines visible editor tab, pane, and overflow controls.
split_recommended: false
depends_on: [F3-140, F3-131, F3-132, F3-152]
unblocks: []
acceptance_criteria:
- "Closing a tab updates the open-tab model and activates a neighboring tab; closing the last tab yields the editor empty state or the underlying view."
- "Closing a pane expands the sibling pane; when no panes remain visible the editor empty state is shown."
- "A width-aware +N more overflow chip exposes hidden tabs through a picker with per-item close while the active tab stays visible."
- "Thread context detail tabs and browser preview tabs participate in close and overflow behavior."
- "Dragging a tab to a new position persists on all four editor panes and survives any re-render or fitter pass; a newly opened tab inserts at its model index rather than appending."
- "The overflow chip and its picker use the shared portal menu family styling with no bespoke accent glow."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: editor_tab_close_pane_close_and_tab_overflow
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1653-1656"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "+N more"
- "empty state"
negative_constraints:
- "Closing the last visible editor pane must not leave a dead surface; it must show the editor empty state or yield to the underlying view."
compatibility_only_notes:
- "Slint portability: the overflow picker, drag affordances, and pane-close overlays are opaque surfaces; no arbitrary-content backdrop blur or SVG filters, and color math is precomputed."
stale_retired_dispositions:
- "Amended 2026-08-13: pane-1-only reorder persistence (DOM-only reorder on panes 2-4 that the next re-render scrambled) is retired; the lime-accent pill chip and its generic gray picker are retired in favour of the app portal-menu family."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```
