# Shard 003: PMConcept7 Home Workspace OpenFile placement addendum (2026-08-04)

Source: `Plans/Contracts_V0.md`

Source lines: L305-L316

Source SHA256: `5282f46ee31d3568ee0b595606144e3c11e0381b256e5082cc48205e637c704e`

---

## PMConcept7 Home Workspace OpenFile placement addendum (2026-08-04)

Superseded 2026-10-09 (DL-180): Home has no fixed editor panels any more. `target_editor_panel_id`, `target_editor_group_id` and `target_group` never select a home panel; a file opens through the one opening module with CV-360's placement fields (`where`, `mode`, `by`, `background`). The fields below stay readable on old payloads as lineage and place nothing. The passage is kept for lineage.

Home Workspace consumers use the canonical workspace-file shape
`OpenFile { path, line?, range?, target_editor_panel_id?, target_editor_group_id?, target_group? }`.
`target_editor_panel_id` selects `editor_panel_1` through `editor_panel_4`;
`target_editor_group_id` selects an explicit group within that panel; and
`target_group` remains a compatibility alias that normalizes to
`target_editor_group_id`. These fields are placement selectors only and never
replace route identity, OpenSubject, buffer ownership, or dirty-state authority.
`cmd.file.open_with` and `cmd.panel.switch` do not gain Panel 1..4 values.
