# Shard 012: PMConcept7 Home Workspace boundary clarification — 2026-08-04

Source: `Plans/Widget_System.md`

Source lines: L1093-L1127

Source SHA256: `d3ebb1ef76a687818a386485104c8a6fb62dd408448e3a67564eab2b880b2823`

---

## PMConcept7 Home Workspace boundary clarification — 2026-08-04

Amended 2026-08-12 — shared interaction vocabulary, separate layout ownership. Dashboard
widget reorder and resize adopt the same direct-manipulation vocabulary as Home surface
movement: a lifted item that tracks the pointer one-to-one, a real in-flow placeholder in
the vacated cell carrying that item's grid span, neighbour reflow animated from pre-move
rects, a top-left grab handle, corner resize that snaps to grid tracks live and re-renders
the widget body once on release, and Escape / pointer-cancel / blur as the cancellation
contract. Sharing that vocabulary is a presentation decision and does not merge ownership:
Home layout continues to own surface placement under `home_workspace_layout.v1`, while
widget layout continues to own widget placement under `widget_layout:v1:dashboard`. A
widget drag never writes the Home record and a surface drag never writes the widget record.

Amended 2026-08-13 — grab-handle presentation update on the Home side: the Home surface
grab handle is now a 28 by 28 folded-corner triangle filling the surface's top-left corner
(clip-path hit-testing lets the empty half fall through; the focus ring renders in-glyph;
ARIA and keyboard grammar unchanged). "Top-left grab handle" in the shared vocabulary
above means position, not glyph — widgets keep their own handle glyph, and this
presentation note changes no ownership boundary.

Home Workspace surfaces (`editor_panel_*`, `dashboard`, `chat`, and terminal
sections) are shell presentation surfaces, not Dashboard widgets. The Home layout
may reuse U10 interaction semantics such as lift, placeholder, reflow, edge zones,
cancellation, and save-on-drop, but it does not import Widget System hostability,
DOM order as canonical state, Dashboard widget layout, or any `cmd.widget.*`
command. Dashboard widget movement remains owned by this document and its existing
projection contract; moving the Dashboard surface itself is owned by the Home
workspace owner.

This addendum repairs non-runtime widget rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-27612d81432b8c866dbb6e76`: `widget-custom-metrics` is the canonical id for custom metric widgets. Fields are `widget_id`, `metric_id`, `query_ref`, `unit`, `refresh_interval_seconds`, `empty_state_copy_id`, and `owner_doc_ref`.
- Repairs `sfk-243d9819162bc839409ce15b`: external usage-feature references to Widget_System `§2`, `§3`, `§4`, or `§7` resolve to named widget hostability, projection trust, layout namespace, and Progress catalog anchors. New citations must use names instead of numeric section aliases.
- Repairs `sfk-7d2d295617efe72e4e966b52`: external references to Widget_System `§7` map to the named `Progress catalog and hostability` section. New citations must use named anchors because this file's live headings are not numbered as §7.
- Repairs `sfk-cdbe4e263b71df9ea3cb1655`: example widget-shell payload: `{\"widget_id\":\"widget.orchestrator_status\",\"widget_kind\":\"progress\",\"host_surface\":\"dashboard\",\"data_ref\":\"projection.widget.orchestrator_status\",\"refresh_interval_seconds\":30,\"empty_state\":\"no_active_run\",\"schema_version\":\"1.0.0\"}`.
