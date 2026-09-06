# Shard 017: Typed controls, exact owner routes, and shared hover-overlay addendum - 2026-08-31

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L844-L891

Source SHA256: `b0c77ecbeb53ef195661544a2bf03d3adc352ca3524d3ccee5e53c5d101ce5d8`

---

## Typed controls, exact owner routes, and shared hover-overlay addendum - 2026-08-31

Every actionable or focusable control on a touched surface carries exactly one canonical `data-command-id` or typed local `data-ui-action-id`. It also exposes current availability, a machine-readable disabled reason when unavailable, one owner/handler destination, and a deterministic result/error/return route. A command-required control cannot degrade into page-local mutation. A presentation-only control cannot manufacture a domain command. PMConcept7 controls remain simulation-marked until the native dispatcher and owner handler are observed.

`PMHoverTag`/`HoverTagController` is one shared Final GUI overlay consumer. It binds actionable/focusable elements, truncated values, technical identifiers, statuses, badges, chart marks, disabled controls, and dynamic pin/unpin state; static body copy and purely decorative nodes are the default exemptions. It preserves the accessible name, supplies stable `aria-describedby` text and `role="tooltip"`, replaces user-facing native `title`, and makes disabled controls keyboard-reachable without allowing activation. `general.interaction.show-tooltips` hides visual paint only; accessibility descriptions remain. Positioning centers above, flips below, clamps to the viewport, and uses the shared overlay root without changing document layout.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/touch_closure.json, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json

### UIW-013 - Typed control, owner route, and accessible hover binding

```yaml
plan_unit_id: UIW-013
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Every touched actionable or focusable control has exactly one canonical command ID or typed local UI action, one availability and disabled-reason contract, one owner route, one tested response and exact return, and a Touch Closure reverse-consumer row. The shared PMHoverTag overlay supplies stable accessible descriptions and theme-native pointer/focus presentation without changing accessible names, enabling disabled actions, dispatching domain work, or changing layout. Native title-only behavior, orphan controls, duplicate keys, missing bindings, inaccessible disabled controls, clipping, stale text, and undocumented exemptions fail the generated census.
gui_related: true
gui_classification_reason: Defines visible control activation, disabled behavior, hover tags, keyboard access, and exact return.
split_recommended: false
depends_on: [UIW-012, DR-040, F3-523]
unblocks: [WM-046]
acceptance_criteria:
  - Every touched control has exactly one command or typed local action and one owner route or explicit view-only presentation disposition.
  - Guided Tour page/focus presentation uses `ui.guided_tour.focus_route` with `route_target.page_id`; it never dispatches or promotes `cmd.nav.focus_route`.
  - Disabled controls expose a stable reason, remain accessible to focus/description, and cannot activate.
  - Pointer and keyboard-focus hover opening, Escape, 160 ms departure grace, edge flip/clamp, theme changes, glass transparency, Retro 140 ms, standard 240 ms, and reduced-motion immediate behavior are tested.
  - A generated census rejects missing bindings, duplicate keys, stale text, native-title-only behavior, clipping, inaccessible disabled controls, and undocumented exemptions.
  - PMConcept7 remains simulation-only until native dispatcher and handler evidence exists.
validation_surfaces:
  - node Concepts/pm7-tools/verify/hover_tags.mjs
  - node Concepts/pm7-tools/verify/accessibility_visual_matrix.mjs
  - python3 scripts/pm-touch-closure-verify.py
risk_class: orphan_control_or_inaccessible_hover_overlay
reasoning_tier: high
context_scope: typed_controls_and_hover_overlay
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/FinalGUISpec.md, Plans/touch_closure.json, Concepts/pm7-tools/global_hover_tags_source.py]
node_compile_hint: {mode: typed_control_and_hover_binding, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
preserved_exact_tokens: [PMHoverTag, HoverTagController, aria-describedby, role=tooltip, general.interaction.show-tooltips]
negative_constraints:
  - Do not rely on native title as the user-facing tooltip.
  - Do not enable a disabled control merely to make it focusable.
  - Do not create commands for hover open, close, positioning, or paint.
  - Do not claim native accessibility or Slint runtime proof from browser checks.
owner_hints: [Plans/UI_Wiring_Rules.md, Plans/FinalGUISpec.md, Plans/Wiring_Matrix.md]
```
