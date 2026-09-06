# Shard 062: PMConcept6 Chat Polish Addendum - 2026-07-16

Source: `Plans/FinalGUISpec.md`

Source lines: L29347-L29526

Source SHA256: `342462919f6e41f5f85d7c9e4eaf265d109a277d8ac29b0b7343a69abd20694c`

---

## PMConcept6 Chat Polish Addendum - 2026-07-16

This addendum promotes user-approved PMConcept6 chat polish behaviors into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F3-422 - Chat Footer Pill And Jump-To-Latest Geometry

```yaml
plan_unit_id: F3-422
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The chat stream footer renders as a floating pill centered over the message stream inside
  the stream wrap: content-sized at max-content with a max-width of the stream minus side
  margins, single-row nowrap layout with tight padding. The stream is see-through around the
  pill: the message stream extends behind the pill, stream content may scroll beneath it, and
  no opaque band or full-width strip renders around the pill. A stack-height variable
  (--chat-footer-stack-height) and a footer inset (--chat-footer-inset, computed as footer
  height plus bottom offset plus 8px clearance) reserve bottom content space inside the
  scrollport (a content inset, not a scrollport shrink) so the newest row clears the pill when
  pinned, and position the jump-to-latest control above the pill at a higher z-order. The
  jump-to-latest control stays hidden until the stream is scrolled away from the bottom by
  more than a 24 pixel threshold. When the stream is pinned to the bottom, reserve changes
  re-scroll the stream so the last row stays above the pill. Stream children opt out of flex
  shrink so floating-footer reserve changes cannot crush embedded cards. Superseded lineage
  (2026-07-16 float repair, kept findable): the initial promotion reserved scrollport space
  under the stream, which rendered an opaque band around the pill.
gui_related: true
gui_classification_reason: This unit defines visible chat footer pill geometry and jump-to-latest placement.
split_recommended: false
depends_on: [F3-131, F3-189, F3-420]
unblocks: []
acceptance_criteria:
- "The footer pill floats centered over the stream, sized to its content with no fixed side gutters, in both the docked panel and the floating window; the stream is visible around and beneath the pill, with no opaque band or full-width strip."
- "The bottom content inset tracks measured footer height through --chat-footer-stack-height and --chat-footer-inset (footer height plus bottom offset plus 8px clearance) inside the scrollport, and stream content may scroll beneath the pill."
- "The jump-to-latest control renders above the footer pill at a higher z-order, appears only when scrolled more than 24px away from the bottom, and returns the stream to the latest message."
- "Pinned-to-bottom reserve changes re-scroll so the newest content stays visible above the pill; stream children do not flex-shrink."
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
  mode: chat_footer_pill_and_jump_to_latest_geometry
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:13639"
- "Plans/assistant-chat-design.md:4086"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "--chat-footer-stack-height"
- "--chat-footer-inset"
- "max-content"
- "24"
- "8px"
negative_constraints:
- "The footer pill must not use fixed side gutters or full-width footer bars; it is content-sized and centered."
compatibility_only_notes:
- "Slint portability: the pill and jump control are anchored overlay surfaces expressed as layout constraints rather than measure-then-write style passes; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed."
stale_retired_dispositions: []
owner_boundary_notes:
- "Plans/assistant-chat-design.md owns footer content semantics (ACD-435); this unit records geometry and scroll-reserve behavior only."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-423 - Composer Layout, Selector Row Layout, And Floating Chat Width Floor

```yaml
plan_unit_id: F3-423
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The chat composer lays out with attach plus the ELI5, YOLO, and CREW toggles on the left
  rail, and the rewind FAB followed by icon-only send and stop controls (inline SVG glyphs)
  on the right with an extra gap between rewind and send. The header selector row renders
  Persona, Model, and Mode as equal-shrink slots whose labels ellipsize when narrow. The
  floating chat window enforces a minimum and default width floor of 380px via
  max(380px, min(var(--floating-chat-w), 40vw)) so the selector row is not clipped on first
  open. The docked #chatPanel mount and the floating #floatingChat mount render both layouts
  from the shared chat template of the unified component.
gui_related: true
gui_classification_reason: This unit defines visible composer, selector row, and floating chat width layout.
split_recommended: false
depends_on: [F3-135, F3-131, F3-253, F3-420, ACD-437]
unblocks: []
acceptance_criteria:
- "Composer left rail renders attach plus ELI5, YOLO, and CREW toggles; the right side renders the rewind FAB with an extra gap before icon-only inline-SVG send and stop controls."
- "The selector row renders Persona, Model, and Mode as equal-shrink slots with label ellipsis when narrow, in both mounts."
- "The floating chat window width floor resolves as max(380px, min(var(--floating-chat-w), 40vw)) and the selector row is not clipped on first open."
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
  mode: composer_selector_row_and_floating_width_floor
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:10800"
- "Plans/FinalGUISpec.md:10582"
- "Plans/assistant-chat-design.md:186"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "380px"
- "40vw"
- "#chatPanel"
- "#floatingChat"
- "ELI5"
- "YOLO"
- "CREW"
negative_constraints:
- "Send and stop controls are icon-only inline SVG glyphs; no emoji glyphs and no text-labeled send button."
compatibility_only_notes:
- "Slint portability: the width floor maps to a min-width constraint on the floating window; toggles and FABs are opaque precomputed surfaces with no arbitrary-content backdrop blur, no SVG filters, and precomputed color math."
stale_retired_dispositions: []
owner_boundary_notes:
- "Plans/assistant-chat-design.md owns selector-row behavior semantics (ACD-437); this unit records layout geometry."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-424 - Chat Overlay Portals And Motion Contract

```yaml
plan_unit_id: F3-424
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Chat mode, model, and effort popouts render as body-portaled overlays above stream overflow
  clipping so they are never clipped by the scrollport; the persona dropdown remains inline
  with an overflow flip when it would exit the viewport. Footer FAB items reveal with a
  spring-stagger motion treatment. Under reduced motion all popout and FAB reveals render as
  instant show and hide with no animation.
gui_related: true
gui_classification_reason: This unit defines visible chat overlay layering and motion behavior.
split_recommended: false
depends_on: [F3-422, ACD-438]
unblocks: []
acceptance_criteria:
- "Mode, model, and effort popouts render above stream overflow clipping in both chat mounts and are never clipped by the scrollport."
- "The persona dropdown remains inline and flips its opening direction when it would overflow the viewport."
- "FAB items reveal with a spring stagger; reduced motion renders instant show and hide."
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
  mode: chat_overlay_portals_and_motion_contract
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:27404"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "spring"
- "reduced motion"
negative_constraints:
- "Popout overlays must not be clipped by stream overflow; body-portal layering (or the native popup equivalent) is required."
compatibility_only_notes:
- "Slint portability: body-portaled popouts map to native PopupWindow surfaces, which replaces the portal-plus-reposition-on-scroll machinery entirely; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```
