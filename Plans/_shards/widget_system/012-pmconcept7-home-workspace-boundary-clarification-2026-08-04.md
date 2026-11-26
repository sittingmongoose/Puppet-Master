# Shard 012: PMConcept7 Home Workspace boundary clarification — 2026-08-04

Source: `Plans/Widget_System.md`

Source lines: L1157-L1223

Source SHA256: `474a083426727e87592cd4a30ecb0611252f32336d5675ff951be2e279bf3c07`

---

## PMConcept7 Home Workspace boundary clarification — 2026-08-04

Amended 2026-10-10 (DL-186) — dashboards run on the Usage board engine. Each dashboard tab's board is one board of
the engine the Usage page runs, and its widget layout is kept per project under
`widget_layout:v1:<project_id>:<board_id>` (WS-030), never in the Home layout record. The owner of a dashboard
widget's move, resize, gravity and Tidy is that board, exactly as on the Usage page (WS-019); the panel that holds the
tab is the outer frame that never owns a widget mutation. A widget operation inside the tab names its board in the
widget command's existing `room` field, with no new field. The ownership split below stands and now names the
per-project key; the 2026-10-09 `widget_layout:v1:dashboard:<board_id>` it named was never written, and its
"addressed by `board_id`" now reads as the board id carried in `room`.

Amended 2026-10-09 (DL-180) — panels, dashboard tabs and one gesture kit. Home's centre is now one universal panel
system (`Plans/FinalGUISpec.md#F3-630`): its panels, their tabs and the fixed chat column are shell presentation
surfaces, and a dashboard is a tab kind that may be open in several tabs, each showing one board (WS-030). The
ownership split below stands with new names: the Home layout record is `home_workspace_layout.v2`
(`Plans/storage-plan.md#SP-330`), which owns panels and tabs and never a widget, and each board's widget layout is
`widget_layout:v1:<project_id>:<board_id>` (amended 2026-10-10, DL-186), which owns widget placement and never a
panel or tab. Panels and the widget
board now move with one gesture kit (`Plans/DRY_Rules.md#DR-066`), which replaces the earlier "shared interaction
vocabulary" and "may reuse U10 interaction semantics" sentences; the kit carries no layout model, so sharing it
merges no ownership. Moving or resizing a dashboard tab, or the panel that holds it, is a panel operation
(`cmd.panel_tab.*`, `cmd.workspace_layout.*`); a widget operation inside the tab is a `cmd.widget.*` row that names
its board in the existing `room` field (WS-030, amended 2026-10-10, DL-186). The sentences below that named `editor_panel_*`, the singleton `dashboard`, terminal sections,
`home_workspace_layout.v1` and the one `widget_layout:v1:dashboard` are amended in place; the 2026-08-13 notes on the
Home surface grip are lineage, because panels are now moved by their own grip (F3-630).

Amended 2026-08-12 — shared interaction vocabulary, separate layout ownership. Dashboard
widget reorder and resize adopt the same direct-manipulation vocabulary as Home surface
movement: a lifted item that tracks the pointer one-to-one, a real in-flow placeholder in
the vacated cell carrying that item's grid span, neighbour reflow animated from pre-move
rects, a top-left grab handle, corner resize that snaps to grid tracks live and re-renders
the widget body once on release, and Escape / pointer-cancel / blur as the cancellation
contract. Sharing that vocabulary is a presentation decision and does not merge ownership:
Home layout continues to own surface placement under `home_workspace_layout.v2` (amended
2026-10-09; `home_workspace_layout.v1` is a read-only migration input), while widget layout
continues to own widget placement under each board's `widget_layout:v1:<project_id>:<board_id>`
(amended 2026-10-09 and 2026-10-10, WS-030). A widget drag never writes the Home record and a panel or tab
drag never writes a widget record.

Amended 2026-08-13 — grab-handle presentation update on the Home side: the Home surface
grab handle became a 28 by 28 folded-corner triangle filling the surface's top-left corner.
Re-amended 2026-08-13 (tweak wave): that triangle is itself retired — the Home surface grip
is now a small lines-only glyph (two diagonal strokes, no filled plate) over an 18 px hit
triangle at the surface's TOP-RIGHT corner (clip-path hit-testing still lets the empty half
fall through; in-glyph focus treatment; ARIA and keyboard grammar unchanged). The
"top-left grab handle" in the shared vocabulary above continues to describe Dashboard
WIDGETS, whose handle position and glyph are unchanged; the Home surface grip's position
and glyph are owned by F3-HOME-003, and this presentation note changes no ownership
boundary.

Home Workspace surfaces (amended 2026-10-09: the panels, their tabs of every kind,
dashboard tabs and terminal tabs included, and the chat column) are shell presentation
surfaces, not Dashboard widgets. The Home layout shares one gesture kit with the widget
board (DR-066), but it does not import Widget System hostability, DOM order as canonical
state, Dashboard widget layout, or any `cmd.widget.*` command. Dashboard widget movement
remains owned by this document and its existing projection contract; moving a dashboard
tab or its panel is owned by the Home panel owner (F3-630, F3-631).

This addendum repairs non-runtime widget rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-27612d81432b8c866dbb6e76`: `widget-custom-metrics` is the canonical id for custom metric widgets. Fields are `widget_id`, `metric_id`, `query_ref`, `unit`, `refresh_interval_seconds`, `empty_state_copy_id`, and `owner_doc_ref`.
- Repairs `sfk-243d9819162bc839409ce15b`: external usage-feature references to Widget_System `§2`, `§3`, `§4`, or `§7` resolve to named widget hostability, projection trust, layout namespace, and Progress catalog anchors. New citations must use names instead of numeric section aliases.
  Corrected 2026-11-25: the exact resolution is `§2` to `## 2. Hostability and data contracts`; `§3` to `## 3. Layout persistence` (grid, sizes and gestures are WS-017 and WS-019); `§4` as an add-widget-flow citation to WS-030's Catalogue, because `## 4. Orchestrator Progress widget scope and catalog linkage` is the Progress catalog, not the add-widget flow; `§7` and `#5` (widget configuration persistence) to `## 3. Layout persistence` with WS-020's `configuration_refs` and WS-004's configuration record. Plans/usage-feature.md cites these anchors directly. The other external `§7` citation, `ContractName:Plans/Widget_System.md#7` in FinalGUISpec Appendix C `### C.5 redb Key Migration` (kept there as a preserved ContractRef), is the `dashboard_layout:v1` to `widget_layout:v1:dashboard` key migration and also resolves to `## 3. Layout persistence`.
- Repairs `sfk-7d2d295617efe72e4e966b52`: external references to Widget_System `§7` map to the named `Progress catalog and hostability` section. New citations must use named anchors because this file's live headings are not numbered as §7.
  Corrected 2026-11-25: no heading is named `Progress catalog and hostability`, and the two external `§7` citations (usage-feature.md, per-widget configuration; FinalGUISpec Appendix C `### C.5 redb Key Migration`, `ContractName:Plans/Widget_System.md#7`, the dashboard layout key migration) are about configuration and layout persistence, not the Progress catalog. `§7` resolves to `## 3. Layout persistence` with WS-020 (`configuration_refs`) and WS-004 (configuration record). The Progress catalog's real headings are `### Progress-only widget hostability` and `### Catalog source and drill linkage` under `## 4. Orchestrator Progress widget scope and catalog linkage`.
- Repairs `sfk-cdbe4e263b71df9ea3cb1655`: example widget-shell payload: `{\"widget_id\":\"widget.orchestrator_status\",\"widget_kind\":\"progress\",\"host_surface\":\"dashboard\",\"data_ref\":\"projection.widget.orchestrator_status\",\"refresh_interval_seconds\":30,\"empty_state\":\"no_active_run\",\"schema_version\":\"1.0.0\"}`.
  Corrected 2026-11-25: that sample names no catalog entry and `dashboard` is not a Progress host (Progress widgets are on no dashboard until the Orchestrator redesign, WS-030). The catalog example is the `progress.blocked-concerns` payload under `### Catalog source and drill linkage`.
